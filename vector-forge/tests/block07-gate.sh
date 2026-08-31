#!/usr/bin/env bash
set -Eeuo pipefail
test -f ../powertrain/PowertrainManifest.json
grep -q '"block": 7' ../powertrain/PowertrainManifest.json
grep -q '"torque"' ../powertrain/PowertrainManifest.json
echo "BLOCK 07 GATE: PASS"
