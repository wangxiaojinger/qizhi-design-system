import type { TimeRangeShortcut } from "./DateTimeRangePicker.types";

const day = 86_400_000;

/** Resolve again on refresh to advance the end to the current second. */
export const usageTimeShortcuts: readonly TimeRangeShortcut[] = [
  { key: "24h", label: "近 24 小时", resolve: recent(1) },
  { key: "7d", label: "近 7 天", resolve: recent(7) },
  { key: "30d", label: "近 30 天", resolve: recent(30) },
];

function recent(days: number): TimeRangeShortcut["resolve"] {
  return now => {
    const end = Math.floor(now / 1000) * 1000;
    return { start: end - days * day, end };
  };
}
