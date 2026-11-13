import type { ChartDateRange, ChartDatum, ChartTimeBucket, LineChartProps, TimeRange } from "@wangxiaojinger/qizhi-react";

export type ChartDemoQuery = (data: readonly ChartDatum[], dateRange?: ChartDateRange, kind?: "bar") =>
  Pick<LineChartProps, "data" | "dateRange" | "rangeSelection" | "usageTimeAxis">;
export type DemoGranularity = "auto" | "hour" | "day";

const hour = 3_600_000;
const day = 24 * hour;
const sampleInterval = 5 * 60_000;
const maxHourlyDays = 10;
const maxDailyDays = 60;
export const demoTimeZone = "Asia/Shanghai";
const shanghaiOffset = 8 * hour;
const displayTime = new Intl.DateTimeFormat("sv-SE", {
  timeZone: demoTimeZone, year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
});
const sampleEnd = Date.UTC(2026, 8, 11);
export function defaultRange(now: number): TimeRange {
  const end = Math.floor(now / 1000) * 1000;
  return { start: end - 10 * day, end };
}

export function resolveDemoGranularity(range: TimeRange, mode: DemoGranularity): "hour" | "day" {
  if (mode !== "auto") return mode;
  return range.end - range.start > 2 * day ? "day" : "hour";
}

export function validateDemoRange(range: TimeRange, mode: DemoGranularity): string | undefined {
  if (!Number.isFinite(range.start) || !Number.isFinite(range.end) || range.end <= range.start) return "结束时间须晚于开始时间。";
  const maximum = resolveDemoGranularity(range, mode) === "day" ? maxDailyDays : maxHourlyDays;
  if (range.end - range.start > maximum * day) return `当前粒度最多查询 ${maximum} 天。`;
}

/** The documentation fixtures are daily samples. Expand them into five-minute
 * synthetic records, then count only records inside the requested interval. */
export function queryDemoData(range: TimeRange, mode: DemoGranularity, onBrush: (range: TimeRange) => void, sampleShift?: number, local = false): ChartDemoQuery {
  const granularity = resolveDemoGranularity(range, mode);
  const step = granularity === "hour" ? hour : day;
  const offset = local ? shanghaiOffset : 0;
  const buckets: ChartTimeBucket[] = [];
  for (let start = Math.floor((range.start + offset) / step) * step - offset; start < range.end; start += step) {
    buckets.push({ x: new Date(start).toISOString(), start: Math.max(start, range.start), end: Math.min(start + step, range.end) });
  }
  const rangeSelection = {
    timeDomain: range,
    stepOrigin: -offset,
    formatTime: local ? (time: number) => displayTime.format(time) : undefined,
    resolveStep: (next: TimeRange) => mode === "day" || mode === "auto" && next.end - next.start > maxHourlyDays * day ? day : hour,
    onChange: onBrush,
  };

  return data => {
    if (!data.length) return { data, rangeSelection };
    const source = new Map(data.map(item => [JSON.stringify([item.series, item.x]), item.value]));
    const series = [...new Set(data.map(item => item.series))];
    const latestSampleDay = Math.max(...data.map(item => Date.parse(item.x)));
    const sourceShift = sampleShift === undefined ? 0 : sampleShift + sampleEnd - day - latestSampleDay;
    const rows = buckets.flatMap(bucket => {
      const dayStart = Math.floor((Date.parse(bucket.x) + offset) / day) * day;
      const date = new Date(dayStart - sourceShift).toISOString().slice(0, 10);
      const events = Math.ceil(bucket.end / sampleInterval) - Math.ceil(bucket.start / sampleInterval);
      return series.map(key => {
        const value = source.get(JSON.stringify([key, date]));
        return { x: bucket.x, series: key, value: value === null ? null : (value ?? 0) * events / (day / sampleInterval) };
      });
    });
    return { data: rows, rangeSelection, usageTimeAxis: { granularity, buckets, timeZone: local ? demoTimeZone : undefined } };
  };
}

export function demoSampleShift(end: number) {
  // Keep the source data anchored to the current Shanghai day throughout a rolling query.
  const activeDayEnd = Math.ceil((end + shanghaiOffset) / day) * day;
  return activeDayEnd - sampleEnd;
}
