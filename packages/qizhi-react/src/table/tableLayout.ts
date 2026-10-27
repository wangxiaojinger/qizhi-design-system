export interface NumericColumnWidth {
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  grow?: number;
  shrink?: number;
  shrinkPriority?: number;
  growPriority?: number;
}

export function allocateColumnWidths(columns: readonly NumericColumnWidth[], available: number, compact = false): number[] {
  const nonNegative = (value: unknown, fallback: number) => typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : fallback;
  const weight = (value: unknown) => nonNegative(value, 0);
  const priority = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : 0;
  const bounds = columns.map((column) => {
    const grow = weight(column.grow);
    const shrink = column.shrink == null ? grow : weight(column.shrink);
    const maximumCandidate = nonNegative(column.maxWidth, Infinity);
    const defaultMinimum = grow > 0 || shrink > 0
      ? 120
      : typeof column.width === "number"
        ? nonNegative(column.width, 120)
        : 120;
    const minimum = nonNegative(column.minWidth, Math.min(defaultMinimum, maximumCandidate));
    const maximum = Math.max(minimum, maximumCandidate);
    return {
      minimum,
      maximum,
      grow,
      shrink,
      growPriority: priority(column.growPriority),
      shrinkPriority: priority(column.shrinkPriority),
    };
  });
  const widths = columns.map((column, index) => Math.min(
    bounds[index].maximum,
    Math.max(bounds[index].minimum, nonNegative(column.width, bounds[index].minimum)),
  ));
  let remaining = nonNegative(available, 0) - widths.reduce((sum, width) => sum + width, 0);
  if (compact && remaining > 0) return widths;

  const distribute = (growing: boolean) => {
    const priorities = [...new Set(bounds
      .filter((bound) => (growing ? bound.grow : bound.shrink) > 0)
      .map((bound) => growing ? bound.growPriority : bound.shrinkPriority))]
      .sort((left, right) => left - right);
    for (const currentPriority of priorities) {
      for (let pass = 0; pass < columns.length && Math.abs(remaining) > 0.01; pass += 1) {
        const active = bounds.map((bound, index) => index).filter((index) => {
          const bound = bounds[index];
          const currentWeight = growing ? bound.grow : bound.shrink;
          const currentBoundPriority = growing ? bound.growPriority : bound.shrinkPriority;
          return currentBoundPriority === currentPriority
            && currentWeight > 0
            && (growing ? widths[index] < bound.maximum : widths[index] > bound.minimum);
        });
        const totalWeight = active.reduce((sum, index) => sum + (growing ? bounds[index].grow : bounds[index].shrink), 0);
        if (!totalWeight) break;
        const budget = remaining;
        const nextWidths = active.map((index) => {
          const bound = bounds[index];
          const currentWeight = growing ? bound.grow : bound.shrink;
          return Math.max(bound.minimum, Math.min(bound.maximum, widths[index] + budget * currentWeight / totalWeight));
        });
        const adjustment = nextWidths.reduce((sum, width, activeIndex) => sum + width - widths[active[activeIndex]], 0);
        active.forEach((index, activeIndex) => {
          widths[index] = nextWidths[activeIndex];
        });
        remaining -= adjustment;
      }
      if (growing ? remaining <= 0.01 : remaining >= -0.01) break;
    }
  };

  distribute(remaining > 0);
  return widths;
}
