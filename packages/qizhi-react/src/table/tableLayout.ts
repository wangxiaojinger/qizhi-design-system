export interface NumericColumnWidth { width?: number | string; minWidth?: number; maxWidth?: number; grow?: number }

export function allocateColumnWidths(columns: readonly NumericColumnWidth[], available: number, compact = false): number[] {
  const positive = (value: number | undefined, fallback: number) => value != null && Number.isFinite(value) && value >= 0 ? value : fallback;
  const bounds = columns.map((column) => {
    const grow = positive(column.grow, 0);
    const defaultMinimum = !grow && typeof column.width === "number" ? positive(column.width, 120) : 120;
    const minimum = positive(column.minWidth, Math.min(defaultMinimum, positive(column.maxWidth, Infinity)));
    const maximum = Math.max(minimum, positive(column.maxWidth, Infinity));
    return { minimum, maximum, grow };
  });
  const widths = columns.map((column, index) => Math.min(bounds[index].maximum, Math.max(bounds[index].minimum, positive(column.width as number | undefined, bounds[index].minimum))));
  let remaining = Math.max(0, available) - widths.reduce((sum, width) => sum + width, 0);
  if (compact && remaining > 0) return widths;
  // Every pass exhausts the budget or reaches at least one bound.
  for (let pass = 0; pass < columns.length && Math.abs(remaining) > 0.01; pass += 1) {
    const growing = remaining > 0;
    const active = bounds.map((bound, index) => index).filter((index) => bounds[index].grow > 0 && (growing ? widths[index] < bounds[index].maximum : widths[index] > bounds[index].minimum));
    const totalWeight = active.reduce((sum, index) => sum + bounds[index].grow, 0);
    if (!totalWeight) break;
    const budget = remaining;
    active.forEach((index) => {
      const next = Math.max(bounds[index].minimum, Math.min(bounds[index].maximum, widths[index] + budget * bounds[index].grow / totalWeight));
      remaining -= next - widths[index];
      widths[index] = next;
    });
  }
  return widths;
}
