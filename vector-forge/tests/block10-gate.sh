#!/usr/bin/env bash
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
set -Eeuo pipefail
test -f $ROOT/demonstrator/DemonstratorManifest.json
grep -q '"block": 10' $ROOT/demonstrator/DemonstratorManifest.json
grep -q 'engineering-validation' $ROOT/demonstrator/DemonstratorManifest.json
echo "BLOCK 10 GATE: PASS"
