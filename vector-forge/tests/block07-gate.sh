#!/usr/bin/env bash
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
set -Eeuo pipefail
test -f $ROOT/powertrain/PowertrainManifest.json
grep -q '"block": 7' $ROOT/powertrain/PowertrainManifest.json
grep -q '"torque"' $ROOT/powertrain/PowertrainManifest.json
echo "BLOCK 07 GATE: PASS"
