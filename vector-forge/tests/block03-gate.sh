#!/usr/bin/env bash
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

test -f "$ROOT/contracts/vehicle-contract.json"
test -f "$ROOT/integration/IntegrationManifest.json"
test -f "$ROOT/integration/Block03Integration.json"

echo "BLOCK 03 GATE: PASS"
