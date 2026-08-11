export type BalloonHitbox = {
  /** Horizontal position of the balloon's center. */
  x: number;
  /** Vertical position of the balloon's center. */
  y: number;
  /** Radius of the balloon's hitbox. */
  radius: number;
};

export type ArrowPoint = {
  /** Horizontal position of the arrow tip. */
  x: number;
  /** Vertical position of the arrow. */
  y: number;
};

/**
 * Tolerant hit check between an arrow tip and a balloon.
 *
 * The arrow must have reached the balloon's x position first. The vertical
 * check allows a little extra tolerance beyond the radius so fast arrows
 * that clip the edge still register as hits.
 */
export function arrowHitsBalloon(
  arrow: ArrowPoint,
  balloon: BalloonHitbox,
  tolerance = 6,
): boolean {
  if (arrow.x < balloon.x) return false;
  return Math.abs(arrow.y - balloon.y) <= balloon.radius + tolerance;
}
