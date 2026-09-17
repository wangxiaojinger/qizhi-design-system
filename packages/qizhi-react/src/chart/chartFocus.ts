import type { ChartDatum, ChartSeries, FocusedItem } from "./Chart.types";
import type { ChartModel } from "./chartModel";

/** 从原始数据构建身份，绝不使用图形或 DOM 顺序作为索引。 */
export function focusItems(data: readonly ChartDatum[], series: readonly ChartSeries[], model: ChartModel): FocusedItem[] {
  if (model.error) return [];
  const originals = new Map<string, Map<string, ChartDatum>>();
  for (const datum of data) {
    if (!originals.has(datum.series)) originals.set(datum.series, new Map());
    originals.get(datum.series)!.set(datum.x, datum);
  }
  return model.categories.flatMap((x, dataIndex) => series.flatMap(s => {
    const datum = originals.get(s.key)?.get(x);
    return datum && datum.value !== null ? [{ seriesKey: s.key, dataIndex, dataKey: x, data: datum }] : [];
  }));
}
export const sameFocus = (a: FocusedItem | null, b: FocusedItem | null) => a === b || !!(a && b && a.seriesKey === b.seriesKey &&
  (a.dataKey !== undefined && b.dataKey !== undefined ? a.dataKey === b.dataKey : a.dataIndex === b.dataIndex));
export const resolveFocus = (item: FocusedItem | null | undefined, items: readonly FocusedItem[]) => item ? items.find(candidate => candidate.seriesKey === item.seriesKey &&
  (item.dataKey !== undefined ? candidate.dataKey === item.dataKey : candidate.dataIndex === item.dataIndex)) ?? null : null;
export const focusOpacity = (value = 0.3) => Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0.3;
