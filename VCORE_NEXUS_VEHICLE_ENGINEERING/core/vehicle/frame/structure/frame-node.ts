export interface FrameNode {
  id: string;
  xMm: number;
  yMm: number;
  zMm: number;
  role:
    | "STEERING_HEAD"
    | "SWINGARM_PIVOT"
    | "ENGINE_MOUNT"
    | "SEAT_MOUNT"
    | "REAR_SUBFRAME"
    | "BASE";
}

export function distanceBetweenNodes(
  a: FrameNode,
  b: FrameNode
): number {
  const dx = a.xMm - b.xMm;
  const dy = a.yMm - b.yMm;
  const dz = a.zMm - b.zMm;

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
