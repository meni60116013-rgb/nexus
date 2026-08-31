#!/usr/bin/env bash
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
set -Eeuo pipefail
test -f $ROOT/vehicle-creator/VehicleCreatorManifest.json
grep -q '"block": 9' $ROOT/vehicle-creator/VehicleCreatorManifest.json
grep -q '"mode": "thin-client"' $ROOT/vehicle-creator/VehicleCreatorManifest.json
echo "BLOCK 09 GATE: PASS"
