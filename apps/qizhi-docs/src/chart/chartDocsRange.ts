import type { ChartDateRange, ChartDatum, LineChartProps, TimeRange, TimeRangeShortcut } from "@wangxiaojinger/qizhi-react";

export type ChartDemoQuery = (data: readonly ChartDatum[], dateRange?: ChartDateRange, kind?: "bar") => Pick<LineChartProps, "data" | "dateRange" | "rangeSelection">;
export type DemoGranularity = "auto" | "hour" | "day";

const hour = 3_600_000;
const day = 24 * hour;
const maxHourlyDays = 10;
const maxDailyDays = 60;
const sampleEnd = Date.UTC(2026, 8, 11);
const recent = (length: number): TimeRange => ({ start: sampleEnd - length, end: sampleEnd });
export const defaultRange = recent(10 * day);
export const shortcuts: readonly TimeRangeShortcut[] = [
  { key: "24h", label: "最近 24 小时", resolve: () => recent(hour * 24) },
  { key: "7d", label: "最近 7 天", resolve: () => recent(7 * day) },
  { key: "30d", label: "最近 30 天", resolve: () => recent(30 * day) },
];

export function resolveDemoGranularity(range: TimeRange, mode: DemoGranularity): "hour" | "day" {
  if (mode !== "auto") return mode;
  return range.end - range.start > 2 * day && range.start % day === 0 && range.end % day === 0 ? "day" : "hour";
}

export function validateDemoRange(range: TimeRange, mode: DemoGranularity): string | undefined {
  if (!Number.isFinite(range.start) || !Number.isFinite(range.end) || range.end <= range.start) return "结束时间须晚于开始时间。";
  const daily = resolveDemoGranularity(range, mode) === "day";
  const step = daily ? day : hour;
  if (range.start % step || range.end % step) return daily ? "按天查询需对齐 UTC 零点。" : "按小时查询需对齐 UTC 整点。";
  const maximum = daily ? maxDailyDays : maxHourlyDays;
  if (range.end - range.start > maximum * day) return `当前粒度最多查询 ${maximum} 天。`;
}

function resolveDemoBrushStep(range: TimeRange, mode: DemoGranularity): number {
  if (mode === "day") return day;
  const hourlyBuckets = Math.ceil(range.end / hour) - Math.floor(range.start / hour);
  return mode === "auto" && hourlyBuckets > maxHourlyDays * 24 ? day : hour;
}

export function queryDemoData(range: TimeRange | undefined, mode: DemoGranularity, onBrush: (range: TimeRange) => void): ChartDemoQuery {
  return (data, dateRange) => {
    const step = range && resolveDemoGranularity(range, mode) === "hour" ? hour : day;
    const start = range?.start ?? Date.parse(dateRange?.start ?? data[0]?.x ?? "");
    const end = range?.end ?? Date.parse(dateRange?.end ?? data.at(-1)?.x ?? "") + step;
    const rangeSelection = {
      timeDomain: { start, end, step: mode === "day" ? day : hour },
      resolveStep: (range: TimeRange) => resolveDemoBrushStep(range, mode),
      onChange: onBrush,
    };
    if (!range || !data.length) return { data, dateRange, rangeSelection };
    if (step === day) return {
      data: data.filter(item => Date.parse(item.x) >= start && Date.parse(item.x) < end), rangeSelection,
      dateRange: { start: new Date(start).toISOString().slice(0, 10), end: new Date(end - day).toISOString().slice(0, 10) },
    };
    // The docs use fixed daily fixtures. Distribute daily values across their
    // hours. An absent record contributes zero; an explicit null stays unknown.
    const sourceValues = new Map(data.map(item => [JSON.stringify([item.series, item.x]), item.value]));
    const keys = [...new Set(data.map(item => item.series))];
    const hourly = Array.from({ length: (end - start) / hour }, (_, index) => {
      const x = new Date(start + index * hour).toISOString();
      return keys.map(series => {
        const source = sourceValues.get(JSON.stringify([series, x.slice(0, 10)]));
        return { x, series, value: source === null ? null : (source ?? 0) / 24 };
      });
    }).flat();
    return { data: hourly, rangeSelection };
  };
}
