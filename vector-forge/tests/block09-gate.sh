#!/usr/bin/env bash
set -Eeuo pipefail
test -f ../vehicle-creator/VehicleCreatorManifest.json
grep -q '"block": 9' ../vehicle-creator/VehicleCreatorManifest.json
grep -q '"mode": "thin-client"' ../vehicle-creator/VehicleCreatorManifest.json
echo "BLOCK 09 GATE: PASS"
