#!/usr/bin/env bash
set -Eeuo pipefail

test -f ../release/ReleaseManifest.json

for f in \
  ../contracts/vehicle-contract.json \
  ../integration/IntegrationManifest.json \
  ../vehicle-core/VehicleCoreManifest.json \
  ../frame-chassis/FrameChassisManifest.json \
  ../suspension-dynamics/SuspensionDynamicsManifest.json \
  ../powertrain/PowertrainManifest.json \
  ../engineering/EngineeringManifest.json \
  ../vehicle-creator/VehicleCreatorManifest.json \
  ../demonstrator/DemonstratorManifest.json
do
  test -f "$f"
done

echo "BLOCK 11 RELEASE GATE: PASS"
