#!/usr/bin/env bash
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
set -Eeuo pipefail

test -f $ROOT/contracts/vehicle-contract.json
test -f $ROOT/integration/IntegrationManifest.json
test -f $ROOT/core-engine/build.gradle.kts

grep -q '"schema": "vcore.vehicle.v1"' $ROOT/contracts/vehicle-contract.json
grep -q '"block2": "contracts"' $ROOT/integration/IntegrationManifest.json
grep -q '"block3": "integration"' $ROOT/integration/IntegrationManifest.json

echo "VECTOR-FORGE INTEGRATION GATE: PASS"
