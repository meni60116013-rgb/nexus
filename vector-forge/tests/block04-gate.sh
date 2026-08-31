#!/usr/bin/env bash
set -Eeuo pipefail
test -f ../vehicle-core/VehicleCoreManifest.json
grep -q '"block": 4' ../vehicle-core/VehicleCoreManifest.json
grep -q '"contract": "vcore.vehicle.v1"' ../vehicle-core/VehicleCoreManifest.json
echo "BLOCK 04 GATE: PASS"
