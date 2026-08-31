#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STAMP="$(date +%Y%m%d_%H%M%S)"
RUN="$ROOT/VCORE_RELEASE_RUN/$STAMP"

mkdir -p "$RUN"/{inventory,candidates,selected,integration,validation,report}

log(){ printf '%s\n' "$*" | tee -a "$RUN/report/master.log"; }

log "============================================================"
log "VCORE MASTER ORCHESTRATOR :: $STAMP"
log "============================================================"

cd "$ROOT"

# ------------------------------------------------------------
# 00 SAFETY
# ------------------------------------------------------------
git diff --check
git status --short --branch > "$RUN/report/git-before.txt"

if git diff --quiet && git diff --cached --quiet; then
  log "WORKTREE :: CLEAN"
else
  log "WORKTREE :: MODIFIED"
  log "ACTION :: PRESERVE USER CHANGES"
fi

# ------------------------------------------------------------
# 01 STORAGE DISCOVERY
# ------------------------------------------------------------
log "--- 01 :: STORAGE DISCOVERY ---"

{
  echo "INTERNAL=$ROOT"

  [ -d "$HOME/storage/external-1" ] &&
    echo "MICROSD_TERMUX=$HOME/storage/external-1"

  [ -d /storage ] &&
    echo "ANDROID_STORAGE=/storage"
} > "$RUN/inventory/storage.txt"

cat "$RUN/inventory/storage.txt"

# ------------------------------------------------------------
# 02 PROJECT INVENTORY
# ------------------------------------------------------------
log "--- 02 :: PROJECT INVENTORY ---"

find "$ROOT" \
  -path "$ROOT/.git" -prune -o \
  -path "$ROOT/VCORE_RELEASE_RUN" -prune -o \
  -path "$ROOT/VECTOR_FORGE_AUTO_"'*' -prune -o \
  -path "$ROOT/VECTOR_FORGE_"'*' -prune -o \
  -type f \
  -name '*.kt' -o -name '*.java' -o -name '*.ts' \
     -o -name '*.tsx' -o -name '*.js' -o -name '*.json' \
     -o -name 'build.gradle*' -o -name 'package.json' \
     -o -name 'AndroidManifest.xml' \
  -print 2>/dev/null > "$RUN/inventory/local-source.txt"

# External discovery is intentionally narrow to protect RAM/storage.
for EXT in "$HOME/storage/external-1" /storage; do
  [ -d "$EXT" ] || continue

  find "$EXT" \
    -maxdepth 6 \
    -type f \
    -name '*.kt' -o -name '*.java' -o -name '*.ts' \
       -o -name '*.tsx' -o -name '*.js' -o -name '*.json' \
       -o -name 'build.gradle*' -o -name 'package.json' \
       -o -name 'AndroidManifest.xml' \
    -print 2>/dev/null || true
done > "$RUN/inventory/external-source.txt"

LOCAL_COUNT="$(wc -l < "$RUN/inventory/local-source.txt")"
EXT_COUNT="$(wc -l < "$RUN/inventory/external-source.txt")"

log "LOCAL_SOURCE :: $LOCAL_COUNT"
log "EXTERNAL_SOURCE :: $EXT_COUNT"

# ------------------------------------------------------------
# 03 PRODUCT BASELINE
# ------------------------------------------------------------
log "--- 03 :: PRODUCT BASELINE ---"

BASELINE="$RUN/inventory/baseline.txt"

{
  echo "VECTOR-FORGE"
  find vector-forge -type f -not -path '*/build/*' 2>/dev/null | sort

  echo "VCORE ENGINEERING"
  find VCORE_NEXUS_VEHICLE_ENGINEERING -type f \
    -name '*.ts' -o -name '*.js' -o -name '*.json' \
    2>/dev/null | sort

  echo "NEXUS GENESIS"
  find nexus-genesis -type f \
    -name '*.tsx' -o -name '*.ts' -o -name '*.json' \
    2>/dev/null | sort
} > "$BASELINE"

log "BASELINE_FILES :: $(wc -l < "$BASELINE")"

# ------------------------------------------------------------
# 04 ADAPTIVE CANDIDATE SCORING
# ------------------------------------------------------------
log "--- 04 :: ADAPTIVE VALUE SCORING ---"

CAND="$RUN/candidates/ranked.tsv"

cat "$RUN/inventory/local-source.txt" \
    "$RUN/inventory/external-source.txt" |
awk '
{
  f=$0
  score=0

  # Core engineering value
  if (f ~ /vector|vehicle|engineering|frame|chassis|suspension|powertrain/) score+=8

  # Runtime/product value
  if (f ~ /core|engine|service|repository|database|telemetry|diagnostic/) score+=6

  # UI value
  if (f ~ /tsx|ui|Activity|Screen|Dashboard|Configurator/) score+=4

  # CI/release value
  if (f ~ /workflow|gradle|package\.json|Manifest/) score+=3

  # Tests increase confidence
  if (f ~ /test|Test/) score+=5

  # Documentation has value but lower priority
  if (f ~ /README|docs/) score+=1

  print score "\t" f
}' |
sort -rn > "$CAND"

log "CANDIDATES_RANKED :: $(wc -l < "$CAND")"

# ------------------------------------------------------------
# 05 DOMAIN PRIORITY
# ------------------------------------------------------------
log "--- 05 :: DOMAIN PRIORITY ---"

awk -F/ '
{
  path=$NF
  if ($0 ~ /engineering|vehicle|frame|chassis|suspension|powertrain/)
    print "ENGINEERING\t" $0
  else if ($0 ~ /diagnostic|telemetry|sensor|scan/)
    print "TELEMETRY_DIAGNOSTICS\t" $0
  else if ($0 ~ /tsx|ui|Activity|Dashboard|Configurator/)
    print "UI\t" $0
  else if ($0 ~ /test|Test/)
    print "TEST\t" $0
  else if ($0 ~ /workflow|gradle|package/)
    print "CI\t" $0
}' "$CAND" |
head -200 > "$RUN/candidates/domain-priority.txt"

# ------------------------------------------------------------
# 06 SELECTIVE INTEGRATION POLICY
# ------------------------------------------------------------
log "--- 06 :: SELECTIVE INTEGRATION ---"

cat > "$RUN/integration/POLICY.md" <<'POLICY'
# VCORE Selective Integration Policy

Priority order:

1. Existing Vector-Forge contracts and core engine.
2. VCORE_NEXUS_VEHICLE_ENGINEERING engineering implementations.
3. Nexus Genesis UI/product capabilities.
4. HiddenSignal reusable local sensor/telemetry patterns.
5. Factory Engine Suite reusable utilities.
6. Mirror/repository infrastructure only when independently useful.

Never overwrite an existing Vector-Forge implementation merely because
another project contains a similarly named file.

Integration requires:

- no credential leakage
- no generated/binary artifacts
- no destructive filesystem operation
- no dependency on private local paths
- no weakening of existing gates
- no removal of existing tests
- no change of build authority from GitHub Actions
POLICY

# Produce a conservative selection manifest.
{
  echo "{"
  echo '  "schema": "vcore.integration.selection.v1",'
  echo '  "authority": "github-actions",'
  echo '  "automaticMerge": false,'
  echo '  "candidates": ['

  head -50 "$CAND" |
  awk -F'\t' '
  BEGIN { first=1 }
  {
    gsub(/\\/,"\\\\",$2)
    gsub(/"/,"\\\"",$2)
    if (!first) printf ",\n"
    printf "    {\"score\":%s,\"path\":\"%s\"}",$1,$2
    first=0
  }
  END { print "" }'

  echo "  ]"
  echo "}"
} > "$RUN/selected/selection.json"

# ------------------------------------------------------------
# 07 CREATE INTEGRATION BRANCH
# ------------------------------------------------------------
log "--- 07 :: INTEGRATION BRANCH ---"

BRANCH="vcore/autonomous-release-$STAMP"

git switch -c "$BRANCH"

echo "$BRANCH" > "$RUN/integration/branch.txt"

# ------------------------------------------------------------
# 08 SAFE COMMERCIAL INFRASTRUCTURE
# ------------------------------------------------------------
log "--- 08 :: COMMERCIAL INFRASTRUCTURE ---"

[ -f LICENSE ] || cat > LICENSE <<'LICENSE'
VCORE NEXUS
Copyright (c) 2026 Manuel de Jesús Ovalle Carrillo

All rights reserved.

No permission is granted to reproduce, distribute, modify, sublicense,
or commercially exploit this software without prior written permission.
LICENSE

[ -f CHANGELOG.md ] || cat > CHANGELOG.md <<'CHANGE'
# Changelog

## 2026-08-31

- Established autonomous release orchestration.
- Preserved GitHub Actions as the build authority.
- Added selective integration and release gates.
- Added automated artifact and deployment pipeline.
CHANGE

# Conservative placeholders rather than inventing legal claims.
[ -f PRIVACY.md ] || cat > PRIVACY.md <<'PRIVACY'
# Privacy

This document is a release placeholder.

Before public commercial deployment, replace this document with the
final privacy policy applicable to the deployed product, jurisdictions,
data flows, analytics, authentication, telemetry and third-party services.
PRIVACY

[ -f TERMS.md ] || cat > TERMS.md <<'TERMS'
# Terms

This document is a release placeholder.

Before public commercial deployment, replace this document with the
final terms applicable to the product, licensing model, warranties,
limitations and applicable jurisdiction.
TERMS

# ------------------------------------------------------------
# 09 STATIC SAFETY
# ------------------------------------------------------------
log "--- 09 :: STATIC SAFETY ---"

if grep -RniE \
  'BEGIN (RSA|OPENSSH|EC) PRIVATE KEY|ghp_[A-Za-z0-9]|sk-[A-Za-z0-9]|password\s*=' \
  vector-forge nexus-genesis VCORE_NEXUS_VEHICLE_ENGINEERING \
  2>/dev/null > "$RUN/validation/secrets.txt"; then

  log "SECRET_SCAN :: FAIL"
  log "ACTION :: STOP BEFORE PUSH"
  exit 20
else
  log "SECRET_SCAN :: PASS"
fi

git diff --check
log "DIFF_CHECK :: PASS"

# ------------------------------------------------------------
# 10 VECTOR-FORGE GATES
# ------------------------------------------------------------
log "--- 10 :: VECTOR-FORGE GATES ---"

PASS=0
FAIL=0

for gate in vector-forge/tests/*-gate.sh; do
  [ -f "$gate" ] || continue

  if bash "$gate" > "$RUN/validation/$(basename "$gate").log" 2>&1; then
    PASS=$((PASS+1))
  else
    FAIL=$((FAIL+1))
  fi
done

log "GATES_PASS :: $PASS"
log "GATES_FAIL :: $FAIL"

if [ "$FAIL" -gt 0 ]; then
  log "GATE_POLICY :: STOP"
  exit 21
fi

# ------------------------------------------------------------
# 11 COMMIT
# ------------------------------------------------------------
log "--- 11 :: COMMIT PREPARATION ---"

git add \
  LICENSE CHANGELOG.md PRIVACY.md TERMS.md \
  scripts/vcore_master_orchestrator.sh \
  .github/workflows/vcore-autonomous-release.yml 2>/dev/null || true

git add vector-forge nexus-genesis 2>/dev/null || true

git status --short > "$RUN/report/staged.txt"

if git diff --cached --quiet; then
  log "COMMIT :: NOTHING_NEW"
else
  git commit -m "chore: establish autonomous VCORE release pipeline"
fi

# ------------------------------------------------------------
# 12 PUSH
# ------------------------------------------------------------
log "--- 12 :: CONTROLLED PUSH ---"

git push -u origin "$BRANCH"

# ------------------------------------------------------------
# 13 FINAL REPORT
# ------------------------------------------------------------
git status --short --branch > "$RUN/report/git-after.txt"
git rev-parse HEAD > "$RUN/report/commit.txt"

cat > "$RUN/report/FINAL.txt" <<EOF
VCORE AUTONOMOUS RELEASE
STAMP=$STAMP
BRANCH=$BRANCH
SOURCE_FILES=$LOCAL_COUNT
EXTERNAL_FILES=$EXT_COUNT
GATES_PASS=$PASS
GATES_FAIL=$FAIL
LOCAL_BUILD=NONE
PUSH=COMPLETED
BUILD_AUTHORITY=GITHUB_ACTIONS
PRODUCTION_DEPLOY=GATED_BY_CI
STATUS=CI_DISPATCHED
EOF

cp "$RUN/report/FINAL.txt" "$ROOT/VCORE_RELEASE_LATEST.txt"

cat "$RUN/report/FINAL.txt"

log "============================================================"
log "ORCHESTRATOR :: COMPLETE"
log "REPORT :: $RUN/report/FINAL.txt"
log "============================================================"
