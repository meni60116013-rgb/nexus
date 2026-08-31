#!/usr/bin/env bash
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
set -Eeuo pipefail
test -f $ROOT/engineering/EngineeringManifest.json
grep -q 'CROMOLY_4130' $ROOT/engineering/EngineeringManifest.json
grep -q 'ACERO_CARBONO_1018' $ROOT/engineering/EngineeringManifest.json
grep -q 'ACERO_CARBONO_1020' $ROOT/engineering/EngineeringManifest.json
echo "BLOCK 08 GATE: PASS"
