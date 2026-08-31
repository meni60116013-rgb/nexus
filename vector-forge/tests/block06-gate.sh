#!/usr/bin/env bash
set -Eeuo pipefail
test -f ../suspension-dynamics/SuspensionDynamicsManifest.json
grep -q '"block": 6' ../suspension-dynamics/SuspensionDynamicsManifest.json
grep -q 'weight-transfer' ../suspension-dynamics/SuspensionDynamicsManifest.json
echo "BLOCK 06 GATE: PASS"
