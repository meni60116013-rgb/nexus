#!/usr/bin/env bash
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
set -Eeuo pipefail

test -f $ROOT/release/ReleaseManifest.json

for f in \
  $ROOT/contracts/vehicle-contract.json \
  $ROOT/integration/IntegrationManifest.json \
  $ROOT/vehicle-core/VehicleCoreManifest.json \
  $ROOT/frame-chassis/FrameChassisManifest.json \
  $ROOT/suspension-dynamics/SuspensionDynamicsManifest.json \
  $ROOT/powertrain/PowertrainManifest.json \
  $ROOT/engineering/EngineeringManifest.json \
  $ROOT/vehicle-creator/VehicleCreatorManifest.json \
  $ROOT/demonstrator/DemonstratorManifest.json
do
  test -f "$f"
done

echo "BLOCK 11 RELEASE GATE: PASS"
