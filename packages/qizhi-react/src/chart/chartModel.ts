import { tokens } from "@wangxiaojinger/qizhi-tokens";
import type { ChartDatum, ChartSeries } from "./Chart.types";

export interface ChartRow { x: string; values: (number | null)[] }
export interface ChartModel { categories: string[]; rows: ChartRow[]; hasValues: boolean; error?: string }
const tokenValues = new Map(Object.values(tokens).map(token => [token.cssVariable as string, token.value]));
const colorNames = new Set(Object.values(tokens).filter(token => /色|颜色/.test(token.category) || /^(rgb|#|hsl)/.test(token.value)).map(token => token.cssVariable as string));
export const isChartColorToken = (name: string) => colorNames.has(name);
export const seriesColorToken = (series: ChartSeries, index: number) => series.colorToken ?? `--chart-series-${index % 7 + 1}`;
export const colorTokenCss = (name: string) => {
  let value = tokenValues.get(name) ?? "";
  const seen = new Set<string>();
  while (/^var\(--[\w-]+\)$/.test(value) && !seen.has(value)) { seen.add(value); value = tokenValues.get(value.slice(4, -1)) ?? ""; }
  return /^\s*\d+\s*,/.test(value) ? `rgb(var(${name}))` : `var(${name})`;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const parseIsoDate = (value: string) => {
  if (!ISO_DATE.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date : null;
};
const formatIsoDate = (date: Date) => date.toISOString().slice(0, 10);

export function normalizeChart(data: readonly ChartDatum[], series: readonly ChartSeries[], dateRange?: { start: string; end: string }): ChartModel {
  const invalid = (): ChartModel => ({ categories: [], rows: [], hasValues: false, error: "图表数据格式有误" });
  if (!Array.isArray(data) || !Array.isArray(series) || !series.length) return invalid();
  const keys = new Map<string, number>();
  for (const [index, item] of series.entries()) {
    if (!item || typeof item.key !== "string" || !item.key || typeof item.label !== "string" || !item.label.trim() || keys.has(item.key) || (item.colorToken !== undefined && !isChartColorToken(item.colorToken))) return invalid();
    keys.set(item.key, index);
  }
  const rows = new Map<string, ChartRow>();
  const seen = new Map<string, Set<string>>();
  let hasValues = false;
  for (const item of data) {
    if (!item || typeof item.x !== "string" || !item.x || !keys.has(item.series) || (item.value !== null && (typeof item.value !== "number" || !Number.isFinite(item.value)))) return invalid();
    if (!rows.has(item.x)) { rows.set(item.x, { x: item.x, values: series.map(() => null) }); seen.set(item.x, new Set()); }
    if (seen.get(item.x)!.has(item.series)) return invalid();
    seen.get(item.x)!.add(item.series);
    rows.get(item.x)!.values[keys.get(item.series)!] = item.value;
    hasValues ||= item.value !== null;
  }
  if (dateRange) {
    const start = parseIsoDate(dateRange.start); const end = parseIsoDate(dateRange.end);
    if (!start || !end || start > end) return invalid();
    const completed = new Map<string, ChartRow>();
    for (let cursor = start.getTime(); cursor <= end.getTime(); cursor += 86_400_000) {
      const x = formatIsoDate(new Date(cursor));
      completed.set(x, rows.get(x) ?? { x, values: series.map(() => 0) });
    }
    if ([...rows.keys()].some(x => !completed.has(x))) return invalid();
    return { categories: [...completed.keys()], rows: [...completed.values()], hasValues: true };
  }
  return { categories: [...rows.keys()], rows: [...rows.values()], hasValues };
}
