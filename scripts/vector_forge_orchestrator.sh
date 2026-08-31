#!/data/data/com.termux/files/usr/bin/bash
set -u

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$HOME/VECTOR_FORGE_ORCHESTRATOR"
STAMP="$(date +%Y%m%d_%H%M%S)"

rm -rf "$OUT/$STAMP"
mkdir -p "$OUT/$STAMP"/{inventory,domains,decision}

LOG="$OUT/$STAMP/run.log"
exec > >(tee "$LOG") 2>&1

echo "============================================================"
echo "VECTOR-FORGE :: AUTONOMOUS ORCHESTRATOR"
echo "STAMP :: $STAMP"
echo "============================================================"

cd "$ROOT"

safe_find() {
  find "$@" 2>/dev/null || true
}

echo "--- 01 :: SOURCE INVENTORY ---"

SEARCH_ROOTS=(
  "$HOME"
)

for BASE in "${SEARCH_ROOTS[@]}"; do
  safe_find "$BASE" -type f \
    \( -name '*.kt' -o -name '*.java' -o -name '*.ts' \
    -o -name '*.tsx' -o -name '*.js' -o -name '*.mjs' \
    -o -name '*.py' -o -name '*.json' \) |
  grep -Ev \
    '(/\.git/|/\.gradle/|/node_modules/|/build/|/dist/|/historical_archive/|/test_extraction_sandbox/|/VECTOR_FORGE_AUTO_|/VECTOR_FORGE_MASTER_|/VECTOR_FORGE_HARVEST_)' |
  sort -u
done > "$OUT/$STAMP/inventory/source.txt"

echo "SOURCE :: $(wc -l < "$OUT/$STAMP/inventory/source.txt")"

echo "--- 02 :: PROJECTS ---"

safe_find "$HOME" -type f \
  \( -name 'build.gradle' -o -name 'build.gradle.kts' \
  -o -name 'settings.gradle' -o -name 'settings.gradle.kts' \
  -o -name 'package.json' -o -name 'AndroidManifest.xml' \) |
grep -Ev \
'(/\.git/|/\.gradle/|/node_modules/|/build/|/historical_archive/|/test_extraction_sandbox/|/VECTOR_FORGE_AUTO_)' |
sort -u > "$OUT/$STAMP/inventory/projects.txt"

echo "PROJECTS :: $(wc -l < "$OUT/$STAMP/inventory/projects.txt")"

echo "--- 03 :: HIGH-VALUE DOMAINS ---"

for D in \
  vehicle motorcycle engineering diagnostics telemetry dynamics \
  suspension powertrain frame chassis materials welding analytics \
  sensor fusion obd configurator blueprint security offline database
do
  grep -iE "$D" "$OUT/$STAMP/inventory/source.txt" |
    sort -u > "$OUT/$STAMP/domains/$D.txt" || true
done

echo "--- 04 :: VECTOR-FORGE BASELINE ---"

safe_find vector-forge -type f \
  ! -path '*/build/*' |
sort -u > "$OUT/$STAMP/inventory/vectorforge.txt"

echo "VECTOR_FORGE :: $(wc -l < "$OUT/$STAMP/inventory/vectorforge.txt")"

echo "--- 05 :: CANDIDATE SCORING ---"

: > "$OUT/$STAMP/decision/candidates.txt"

while IFS= read -r FILE; do
  SCORE=0

  case "$FILE" in
    *engineering*|*vehicle*|*motorcycle*) SCORE=$((SCORE+5));;
  esac
  case "$FILE" in
    *diagnostic*|*telemetry*|*dynamics*|*suspension*|*powertrain*) SCORE=$((SCORE+4));;
  esac
  case "$FILE" in
    *Core*|*Engine*|*Manager*|*Repository*|*Validator*|*Adapter*) SCORE=$((SCORE+3));;
  esac
  case "$FILE" in
    *test*|*spec*) SCORE=$((SCORE+1));;
  esac

  if [ "$SCORE" -ge 7 ]; then
    echo "$SCORE :: $FILE" >> "$OUT/$STAMP/decision/candidates.txt"
  fi
done < "$OUT/$STAMP/inventory/source.txt"

sort -t: -k1,1nr -k2 "$OUT/$STAMP/decision/candidates.txt" \
  -o "$OUT/$STAMP/decision/candidates.txt"

echo "HIGH_VALUE :: $(wc -l < "$OUT/$STAMP/decision/candidates.txt")"

echo "--- 06 :: MICROSD DISCOVERY ---"

{
  echo "HOME STORAGE"
  ls -lah "$HOME/storage" 2>/dev/null || true
  echo
  echo "EXTERNAL-1"
  ls -lah "$HOME/storage/external-1" 2>/dev/null || true
  echo
  echo "MOUNTS"
  mount 2>/dev/null | grep -E 'external-1|media_rw' || true
} > "$OUT/$STAMP/inventory/microsd.txt"

echo "--- 07 :: VECTOR-FORGE GATES ---"

GATES=0
FAILS=0

for G in vector-forge/tests/*-gate.sh; do
  [ -f "$G" ] || continue
  if bash -n "$G" 2>/dev/null && bash "$G" >/dev/null 2>&1; then
    GATES=$((GATES+1))
  else
    FAILS=$((FAILS+1))
  fi
done

echo "GATES_PASS :: $GATES"
echo "GATES_FAIL :: $FAILS"

echo "--- 08 :: GIT SAFETY ---"

git diff --check || true
git status --short --branch > "$OUT/$STAMP/inventory/git.txt"

echo "--- 09 :: DECISION ---"

if [ "$FAILS" -gt 0 ]; then
  DECISION="HOLD"
elif [ ! -s "$OUT/$STAMP/decision/candidates.txt" ]; then
  DECISION="DISCOVERY_ONLY"
else
  DECISION="READY_FOR_SELECTIVE_INTEGRATION"
fi

echo "DECISION :: $DECISION"

cat > "$OUT/$STAMP/decision/DECISION.md" <<EOT
# VECTOR-FORGE Autonomous Decision

Timestamp: $STAMP

## Result
$DECISION

## Policy
- vector-forge remains the canonical engine.
- External projects are capability sources only.
- No blind repository merge.
- Historical/archive material is excluded.
- Local compilation is prohibited.
- GitHub Actions is the build authority.
- Existing gates must remain valid.
- Only high-value implementations may proceed to integration.
EOT

echo "--- 10 :: COMPACT REPORT ---"

{
  echo "VECTOR-FORGE AUTONOMOUS REPORT"
  echo "STAMP :: $STAMP"
  echo "SOURCE :: $(wc -l < "$OUT/$STAMP/inventory/source.txt")"
  echo "PROJECTS :: $(wc -l < "$OUT/$STAMP/inventory/projects.txt")"
  echo "HIGH_VALUE :: $(wc -l < "$OUT/$STAMP/decision/candidates.txt")"
  echo "GATES_PASS :: $GATES"
  echo "GATES_FAIL :: $FAILS"
  echo "DECISION :: $DECISION"
  echo "LOCAL_BUILD :: NONE"
  echo "PUSH :: CONTROLLED"
  echo "BUILD_AUTHORITY :: GITHUB_ACTIONS"
} | tee "$OUT/LATEST.txt"

echo
echo "============================================================"
echo "ORCHESTRATOR :: COMPLETE"
echo "REPORT :: $OUT/LATEST.txt"
echo "FULL RUN :: $OUT/$STAMP/"
echo "DECISION :: $DECISION"
echo "LOCAL BUILD :: NONE"
echo "============================================================"
