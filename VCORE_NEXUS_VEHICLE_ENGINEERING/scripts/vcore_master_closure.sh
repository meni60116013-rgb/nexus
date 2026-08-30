#!/usr/bin/env bash
set -euo pipefail

REPO="${REPO:-$(git remote get-url origin)}"
MAIN="main"
INTEGRATION="motorcycle-core-integration"

step() {
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

step "GATE 01 — BRANCH / WORKTREE"
test "$(git branch --show-current)" = "$INTEGRATION" || fail "wrong branch"
test -z "$(git status --porcelain)" || fail "dirty worktree"
pass "WORKTREE"

step "GATE 02 — LINEAGE"
git merge-base --is-ancestor "$MAIN" vehicle-engineering-foundation || fail "main lineage"
git merge-base --is-ancestor vehicle-engineering-foundation universal-vehicle-core-integration || fail "foundation lineage"
git merge-base --is-ancestor universal-vehicle-core-integration "$INTEGRATION" || fail "universal lineage"
pass "LINEAGE"

step "GATE 03 — MERGE SIMULATION"
MAIN_SHA="$(git rev-parse "$MAIN")"
HEAD_SHA="$(git rev-parse "$INTEGRATION")"
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

git merge-tree --write-tree "$MAIN_SHA" "$HEAD_SHA" > "$TMP" \
  || fail "merge simulation"

if grep -qiE '<<<<<<<|>>>>>>>|both modified|CONFLICT' "$TMP"; then
  fail "merge conflicts detected"
fi

pass "MERGE SIMULATION"

step "GATE 04 — CORE INVENTORY"
for p in \
  core/vehicle \
  vehicle_core \
  vehicle_engineering \
  vehicle_motorcycle
do
  test -d "$p" || fail "missing $p"
done
pass "CORE INVENTORY"

step "GATE 05 — CONTRACTS"
CONTRACTS="$(find vehicle_core vehicle_engineering vehicle_motorcycle \
  -type f -name '*contract.json' | wc -l)"
test "$CONTRACTS" -ge 12 || fail "contract count"
echo "CONTRACTS=$CONTRACTS"
pass "CONTRACTS"

step "GATE 06 — TEST INVENTORY"
TESTS="$(find core/vehicle vehicle_core vehicle_engineering vehicle_motorcycle tests \
  -type f \( -name '*.test.js' -o -name '*.test.ts' \) 2>/dev/null | wc -l)"
test "$TESTS" -ge 18 || fail "test inventory"
echo "TESTS=$TESTS"
pass "TEST INVENTORY"

step "GATE 07 — MAIN PROTECTION"
test "$(git rev-parse "$MAIN")" = "$MAIN_SHA" || fail "main changed"
pass "MAIN PROTECTED"

step "GATE 08 — GITHUB CLI"
command -v gh >/dev/null 2>&1 || fail "gh unavailable"
gh auth status >/dev/null 2>&1 || fail "gh not authenticated"
pass "GITHUB CLI"

step "GATE 09 — RELEASE PREPARATION"
echo "TARGET=$MAIN"
echo "SOURCE=$INTEGRATION"
echo "MAIN_SHA=$MAIN_SHA"
echo "SOURCE_SHA=$HEAD_SHA"
pass "RELEASE PREPARATION"

echo
echo "============================================================"
echo "MASTER CLOSURE PREFLIGHT : PASS"
echo "============================================================"
echo "NEXT:"
echo "1. CONTROLLED MERGE"
echo "2. GITHUB ACTIONS VALIDATION"
echo "3. ENGINEERING VALIDATION"
echo "4. MOTORCYCLE VALIDATION"
echo "5. RELEASE GATE"
echo "============================================================"
