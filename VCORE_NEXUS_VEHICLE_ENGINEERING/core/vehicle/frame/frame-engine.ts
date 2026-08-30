import type { FrameGeometry } from "./geometry/frame-geometry";
import {
  validateFrameGeometry
} from "./geometry/frame-geometry";
import type { FrameNode } from "./structure/frame-node";
import {
  distanceBetweenNodes
} from "./structure/frame-node";
import type { FrameMember } from "./structure/frame-member";
import {
  tubeCrossSectionAreaMm2,
  tubeLengthMm
} from "./structure/frame-member";
import {
  calculateResultantLoad
} from "./loads/frame-loads";
import {
  STANDARD_FRAME_LOAD_CASES
} from "./loads/load-cases";

export interface FrameAnalysis {
  valid: boolean;
  geometry: ReturnType<typeof validateFrameGeometry>;
  totalTubeLengthMm: number;
  estimatedStructuralMassKg: number;
  maximumDesignLoadN: number;
  nodeCount: number;
  memberCount: number;
}

export function analyzeFrame(
  geometry: FrameGeometry,
  nodes: FrameNode[],
  members: FrameMember[],
  materialDensityKgM3 = 7850
): FrameAnalysis {
  const geometryResult =
    validateFrameGeometry(geometry);

  let totalTubeLengthMm = 0;

  for (const member of members) {
    const from = nodes.find(
      node => node.id === member.from
    );

    const to = nodes.find(
      node => node.id === member.to
    );

    if (!from || !to) {
      throw new Error(
        `Invalid frame member nodes: ${member.id}`
      );
    }

    totalTubeLengthMm += tubeLengthMm(from, to);
  }

  let volumeM3 = 0;

  for (const member of members) {
    const from = nodes.find(
      node => node.id === member.from
    );

    const to = nodes.find(
      node => node.id === member.to
    );

    if (!from || !to) continue;

    const areaMm2 =
      tubeCrossSectionAreaMm2(
        member.outerDiameterMm,
        member.wallThicknessMm
      );

    const lengthMm =
      distanceBetweenNodes(from, to);

    volumeM3 +=
      areaMm2 *
      lengthMm /
      1_000_000_000;
  }

  const estimatedStructuralMassKg =
    volumeM3 * materialDensityKgM3;

  let maximumDesignLoadN = 0;

  for (const loadCase of STANDARD_FRAME_LOAD_CASES) {
    const result =
      calculateResultantLoad(loadCase);

    maximumDesignLoadN =
      Math.max(
        maximumDesignLoadN,
        result.designLoadN
      );
  }

  return {
    valid: geometryResult.valid,
    geometry: geometryResult,
    totalTubeLengthMm,
    estimatedStructuralMassKg,
    maximumDesignLoadN,
    nodeCount: nodes.length,
    memberCount: members.length
  };
}
