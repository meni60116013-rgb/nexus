#!/usr/bin/env bash
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
set -Eeuo pipefail
test -f $ROOT/vehicle-core/VehicleCoreManifest.json
grep -q '"block": 4' $ROOT/vehicle-core/VehicleCoreManifest.json
grep -q '"contract": "vcore.vehicle.v1"' $ROOT/vehicle-core/VehicleCoreManifest.json
echo "BLOCK 04 GATE: PASS"
