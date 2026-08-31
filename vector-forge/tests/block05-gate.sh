#!/usr/bin/env bash
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
set -Eeuo pipefail
test -f $ROOT/frame-chassis/FrameChassisManifest.json
grep -q '"block": 5' $ROOT/frame-chassis/FrameChassisManifest.json
echo "BLOCK 05 GATE: PASS"
