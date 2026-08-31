#!/usr/bin/env bash
set -Eeuo pipefail
test -f ../contracts/vehicle-contract.json
test -f ../integration/IntegrationManifest.json
test -f ../integration/Block03Integration.json
echo "BLOCK 03 GATE: PASS"
