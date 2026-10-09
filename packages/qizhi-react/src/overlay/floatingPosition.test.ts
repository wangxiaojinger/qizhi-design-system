import {
  getFittedFloatingPlacement,
  getFloatingOverlayLayout,
} from "./floatingPosition";

const rect = (
  left: number,
  top: number,
  width: number,
  height: number,
) => ({
  left,
  top,
  width,
  height,
  right: left + width,
  bottom: top + height,
  x: left,
  y: top,
  toJSON: () => ({}),
}) as DOMRect;

describe("floating placement", () => {
  it("flips a right placement when the popup would overlap the viewport", () => {
    expect(getFittedFloatingPlacement(
      rect(782, 554, 80, 32),
      rect(0, 0, 240, 126),
      "right",
      { width: 1024, height: 900 },
    )).toEqual({ left: 530, top: 507, position: "left" });
  });

  it("keeps the requested placement when its primary axis fits", () => {
    expect(getFittedFloatingPlacement(
      rect(400, 400, 80, 32),
      rect(0, 0, 240, 126),
      "right",
      { width: 1024, height: 900 },
    )).toEqual({ left: 492, top: 353, position: "right" });
  });

  it("compensates the arrow after shifting a popup at the viewport edge", () => {
    expect(getFloatingOverlayLayout(
      rect(2, 300, 40, 24),
      rect(0, 0, 248, 80),
      "top",
      { gap: 12 },
    )).toEqual({ left: 8, top: 208, position: "top", arrowOffset: 14 });
  });

  it.each([
    ["topLeft", 52],
    ["topRight", 196],
    ["bottomLeft", 52],
    ["bottomRight", 196],
    ["leftTop", 16],
    ["leftBottom", 88],
    ["rightTop", 16],
    ["rightBottom", 88],
  ] as const)("points the %s arrow at the trigger center", (position, arrowOffset) => {
    expect(getFloatingOverlayLayout(
      rect(500, 300, 104, 32),
      rect(0, 0, 248, 104),
      position,
      { gap: 12 },
    ).arrowOffset).toBe(arrowOffset);
  });
});
