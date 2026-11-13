import { expect, it } from "vitest";
import { interpolateUsageBrush, usageBrushAnchors, usageTick } from "./chartUsageTime";

it("uses the displayed bucket starts in both brush directions, including a partial first bucket", () => {
  const start = Date.UTC(2026, 10, 12, 3, 16);
  const boundary = Date.UTC(2026, 10, 12, 4);
  const end = Date.UTC(2026, 10, 12, 4, 32);
  const buckets = [
    { x: "2026-11-12T03:00:00Z", start, end: boundary },
    { x: "2026-11-12T04:00:00Z", start: boundary, end },
  ];
  const anchors = usageBrushAnchors(buckets, [0.03, 0.97]);
  expect(usageTick(buckets[0].x, { granularity: "hour", timeZone: "Asia/Shanghai", buckets }, start)).toBe("11:16");
  expect(interpolateUsageBrush(start, anchors, "time")).toBe(0.03);
  expect(interpolateUsageBrush(boundary, anchors, "time")).toBeCloseTo(0.97);
  expect(interpolateUsageBrush(0.97, anchors, "ratio")).toBe(boundary);
  expect(interpolateUsageBrush(1, anchors, "ratio")).toBe(end);
});
