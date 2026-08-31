#!/usr/bin/env bash
set -Eeuo pipefail
test -f ../engineering/EngineeringManifest.json
grep -q 'CROMOLY_4130' ../engineering/EngineeringManifest.json
grep -q 'ACERO_CARBONO_1018' ../engineering/EngineeringManifest.json
grep -q 'ACERO_CARBONO_1020' ../engineering/EngineeringManifest.json
echo "BLOCK 08 GATE: PASS"
