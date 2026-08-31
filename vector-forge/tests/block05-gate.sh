#!/usr/bin/env bash
set -Eeuo pipefail
test -f ../frame-chassis/FrameChassisManifest.json
grep -q '"block": 5' ../frame-chassis/FrameChassisManifest.json
echo "BLOCK 05 GATE: PASS"
