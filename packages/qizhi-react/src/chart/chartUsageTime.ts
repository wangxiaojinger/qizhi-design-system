import type { ChartTimeBucket, ChartUsageTimeAxis } from "./Chart.types";
import { formatRangeDateTime } from "../time-range-picker/rangeDateTime";
import { parseChartTime } from "./chartModel";

export function usageTick(key: string, axis: ChartUsageTimeAxis, start = parseChartTime(key)) {
  const time = formatRangeDateTime(start, axis.timeZone ?? "UTC");
  if (!time) return key;
  if (axis.granularity === "day") return time.slice(5, 10);
  return time.slice(11, 16);
}

export function usageBucketTitle(bucket: ChartTimeBucket, axis: ChartUsageTimeAxis) {
  if (axis.granularity === "day") return usageTick(bucket.x, axis, bucket.start);
  const start = formatRangeDateTime(bucket.start, axis.timeZone ?? "UTC");
  return start ? `${Number(start.slice(5, 7))}月${Number(start.slice(8, 10))}日 ${start.slice(11, 16)}` : bucket.x;
}

/** The brush and the rendered ticks share the bucket-start coordinates. */
export function usageBrushAnchors(buckets: readonly ChartTimeBucket[], positions: readonly number[]) {
  return [
    ...buckets.map((bucket, index) => ({ time: bucket.start, ratio: positions[index] })),
    { time: buckets[buckets.length - 1].end, ratio: 1 },
  ];
}

export function interpolateUsageBrush(
  value: number,
  anchors: ReturnType<typeof usageBrushAnchors>,
  from: "time" | "ratio",
) {
  const to = from === "time" ? "ratio" : "time";
  const right = anchors.findIndex(anchor => value <= anchor[from]);
  if (right < 0) return anchors[anchors.length - 1][to];
  if (right === 0) return anchors[0][to];
  const a = anchors[right - 1];
  const b = anchors[right];
  return a[to] + (value - a[from]) / (b[from] - a[from]) * (b[to] - a[to]);
}
