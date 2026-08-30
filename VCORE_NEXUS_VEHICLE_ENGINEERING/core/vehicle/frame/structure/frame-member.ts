import type { FrameNode } from "./frame-node";

export interface FrameMember {
  id: string;
  from: string;
  to: string;
  outerDiameterMm: number;
  wallThicknessMm: number;
  materialId: string;
}

export function tubeCrossSectionAreaMm2(
  outerDiameterMm: number,
  wallThicknessMm: number
): number {
  const innerDiameterMm =
    outerDiameterMm - (2 * wallThicknessMm);

  if (innerDiameterMm <= 0) {
    throw new Error("Invalid tube wall thickness");
  }

  return (
    Math.PI / 4 *
    (
      outerDiameterMm ** 2 -
      innerDiameterMm ** 2
    )
  );
}

export function tubeLengthMm(
  from: FrameNode,
  to: FrameNode
): number {
  const dx = from.xMm - to.xMm;
  const dy = from.yMm - to.yMm;
  const dz = from.zMm - to.zMm;

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
