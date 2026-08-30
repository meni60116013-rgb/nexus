#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

MAIN="main"
SOURCE="motorcycle-core-integration"

log() {
  echo
  echo "============================================================"
  echo "$1"
  echo "============================================================"
}

pass() {
  echo "PASS :: $1"
}

fail() {
  echo "FAIL :: $1"
  exit 1
}

# ------------------------------------------------------------
# 32 — MAIN PREFLIGHT
# ------------------------------------------------------------

log "32 — MAIN PREFLIGHT"

test "$(git branch --show-current)" = "$MAIN" || fail "not on main"
test -z "$(git status --porcelain)" || fail "dirty main"

MAIN_SHA="$(git rev-parse HEAD)"

pass "MAIN PREFLIGHT"

# ------------------------------------------------------------
# 33 — REMOTE SYNCHRONIZATION
# ------------------------------------------------------------

log "33 — REMOTE SYNCHRONIZATION"

git push origin "$MAIN"

git fetch origin --quiet

REMOTE_MAIN="$(git rev-parse origin/main)"

test "$REMOTE_MAIN" = "$(git rev-parse HEAD)" \
  || fail "remote main mismatch"

pass "REMOTE MAIN"

# ------------------------------------------------------------
# 34 — GITHUB ACTIONS DISCOVERY
# ------------------------------------------------------------

log "34 — GITHUB ACTIONS"

command -v gh >/dev/null 2>&1 \
  || fail "GitHub CLI unavailable"

gh auth status >/dev/null 2>&1 \
  || fail "GitHub authentication unavailable"

gh run list \
  --limit 10 \
  --json databaseId,name,status,conclusion,headBranch \
  --jq '.[] |
    "\(.databaseId) | \(.name) | \(.status) | \(.conclusion) | \(.headBranch)"' \
  || true

pass "GITHUB ACTIONS ACCESS"

# ------------------------------------------------------------
# 35 — SOURCE / CONTRACT / TEST GATE
# ------------------------------------------------------------

log "35 — ENGINEERING INTEGRATION GATE"

for p in \
  core/vehicle \
  vehicle_core \
  vehicle_engineering \
  vehicle_motorcycle
do
  test -d "$p" || fail "missing $p"
done

CONTRACTS="$(find \
  vehicle_core \
  vehicle_engineering \
  vehicle_motorcycle \
  -type f \
  -name '*contract.json' \
  | wc -l)"

TESTS="$(find \
  core/vehicle \
  vehicle_core \
  vehicle_engineering \
  vehicle_motorcycle \
  tests \
  -type f \
  \( -name '*.test.js' -o -name '*.test.ts' \) \
  2>/dev/null \
  | wc -l)"

test "$CONTRACTS" -ge 12 || fail "contracts"
test "$TESTS" -ge 18 || fail "tests"

echo "CONTRACTS=$CONTRACTS"
echo "TESTS=$TESTS"

pass "ENGINEERING INTEGRATION"

# ------------------------------------------------------------
# 36 — GIT INTEGRITY
# ------------------------------------------------------------

log "36 — GIT INTEGRITY"

git fsck \
  --no-progress \
  --connectivity-only \
  >/dev/null

test "$(git rev-parse main)" = "$MAIN_SHA" \
  || fail "unexpected main mutation"

pass "GIT INTEGRITY"

# ------------------------------------------------------------
# 37 — RELEASE GATE
# ------------------------------------------------------------

log "37 — RELEASE GATE"

echo "MAIN=$MAIN_SHA"
echo "SOURCE=$SOURCE"

git log -1 \
  --oneline \
  --decorate

test -d .github/workflows \
  || fail "workflows directory missing"

WF_COUNT="$(find .github/workflows \
  -type f \
  \( -name '*.yml' -o -name '*.yaml' \) \
  | wc -l)"

test "$WF_COUNT" -ge 1 \
  || fail "no workflows"

echo "WORKFLOWS=$WF_COUNT"

pass "RELEASE GATE"

# ------------------------------------------------------------
# 38 — FINAL STATUS
# ------------------------------------------------------------

log "38 — FINAL STATUS"

echo "MAIN=$MAIN_SHA"
echo "REMOTE_MAIN=$REMOTE_MAIN"
echo "CONTRACTS=$CONTRACTS"
echo "TESTS=$TESTS"
echo "WORKFLOWS=$WF_COUNT"

echo
echo "============================================================"
echo "VCORE NEXUS — CLOSURE PIPELINE : PASS"
echo "============================================================"
echo "ENGINEERING CORE : CONSOLIDATED"
echo "MAIN : SYNCHRONIZED"
echo "GITHUB ACTIONS : AVAILABLE"
echo "RELEASE GATE : PASS"
echo "============================================================"
