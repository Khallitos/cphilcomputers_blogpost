import { describe, expect, it } from "vitest";
import { arrowHitsBalloon } from "./collision";

const balloon = { x: 100, y: 200, radius: 36 };

describe("arrowHitsBalloon", () => {
  it("hits when the arrow tip lands at the balloon's center", () => {
    expect(arrowHitsBalloon({ x: 100, y: 200 }, balloon)).toBe(true);
  });

  it("hits when the arrow is exactly at the edge (radius away)", () => {
    expect(arrowHitsBalloon({ x: 100, y: 200 + 36 }, balloon)).toBe(true);
    expect(arrowHitsBalloon({ x: 100, y: 200 - 36 }, balloon)).toBe(true);
  });

  it("hits just outside the edge within the tolerance", () => {
    // radius 36 + tolerance 6 = 42 → y=241 is inside, y=243 is outside.
    expect(arrowHitsBalloon({ x: 100, y: 200 + 41 }, balloon)).toBe(true);
    expect(arrowHitsBalloon({ x: 100, y: 200 + 43 }, balloon)).toBe(false);
  });

  it("misses when the arrow flies above the balloon", () => {
    expect(arrowHitsBalloon({ x: 100, y: 200 - 60 }, balloon)).toBe(false);
  });

  it("misses when the arrow flies below the balloon", () => {
    expect(arrowHitsBalloon({ x: 100, y: 200 + 60 }, balloon)).toBe(false);
  });

  it("misses when the arrow has not reached the balloon's x yet", () => {
    // Same y as the center, but the arrow is still left of the balloon.
    expect(arrowHitsBalloon({ x: 99, y: 200 }, balloon)).toBe(false);
    expect(arrowHitsBalloon({ x: 40, y: 200 }, balloon)).toBe(false);
  });

  it("handles tiny balloons with a small radius edge", () => {
    const tiny = { x: 300, y: 150, radius: 1 };
    expect(arrowHitsBalloon({ x: 300, y: 150 }, tiny)).toBe(true);
    // 1 + 6 tolerance = 7 → y=156 is inside, y=158 is outside.
    expect(arrowHitsBalloon({ x: 300, y: 156 }, tiny)).toBe(true);
    expect(arrowHitsBalloon({ x: 300, y: 158 }, tiny)).toBe(false);
  });

  it("respects a custom tolerance passed by the caller", () => {
    expect(arrowHitsBalloon({ x: 100, y: 200 + 41 }, balloon, 4)).toBe(false);
    expect(arrowHitsBalloon({ x: 100, y: 200 + 41 }, balloon, 5)).toBe(true);
  });
});
