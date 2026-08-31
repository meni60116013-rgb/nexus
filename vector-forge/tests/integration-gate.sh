#!/usr/bin/env bash
set -Eeuo pipefail

test -f ../contracts/vehicle-contract.json
test -f ../integration/IntegrationManifest.json
test -f ../core-engine/build.gradle.kts

grep -q '"schema": "vcore.vehicle.v1"' ../contracts/vehicle-contract.json
grep -q '"block2": "contracts"' ../integration/IntegrationManifest.json
grep -q '"block3": "integration"' ../integration/IntegrationManifest.json

echo "VECTOR-FORGE INTEGRATION GATE: PASS"
