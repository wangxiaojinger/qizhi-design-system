import { getFittedFloatingPlacement } from "./floatingPosition";

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
});
