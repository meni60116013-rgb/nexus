#!/usr/bin/env bash
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
set -Eeuo pipefail
test -f $ROOT/suspension-dynamics/SuspensionDynamicsManifest.json
grep -q '"block": 6' $ROOT/suspension-dynamics/SuspensionDynamicsManifest.json
grep -q 'weight-transfer' $ROOT/suspension-dynamics/SuspensionDynamicsManifest.json
echo "BLOCK 06 GATE: PASS"
