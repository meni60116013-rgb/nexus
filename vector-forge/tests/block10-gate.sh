#!/usr/bin/env bash
set -Eeuo pipefail
test -f ../demonstrator/DemonstratorManifest.json
grep -q '"block": 10' ../demonstrator/DemonstratorManifest.json
grep -q 'engineering-validation' ../demonstrator/DemonstratorManifest.json
echo "BLOCK 10 GATE: PASS"
