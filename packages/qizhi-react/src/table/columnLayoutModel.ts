import type { TableColumn } from "./Table.types";
import type { TableColumnLayoutState } from "./TableColumnLayout.types";

type FixedRegion = "left" | "right" | undefined;

interface LayoutColumn<RecordType> {
  column: TableColumn<RecordType>;
  key: string;
  segment: number;
}

interface LayoutContext<RecordType> {
  columns: LayoutColumn<RecordType>[];
  byKey: Map<string, LayoutColumn<RecordType>>;
  segments: string[][];
  protectedKeys: Set<string>;
}

const hasOwn = (value: object, key: string) => Object.prototype.hasOwnProperty.call(value, key);

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === "object" && value !== null && !Array.isArray(value)
);

const ownValue = (value: unknown, key: string): unknown => {
  if (!isRecord(value) || !hasOwn(value, key)) return undefined;
  try {
    return value[key];
  } catch {
    return undefined;
  }
};

const isLayoutKey = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;

const fixedRegion = <RecordType,>(column: TableColumn<RecordType>): FixedRegion => (
  column.fixed === "left" || column.fixed === "right" ? column.fixed : undefined
);

const safeDictionary = <Value>(entries: Iterable<readonly [string, Value]>): Record<string, Value> => (
  Object.fromEntries(entries) as Record<string, Value>
);

const toProtectedKeys = (protectedKeys: readonly string[]): Set<string> => new Set(
  protectedKeys.filter((key): key is string => typeof key === "string"),
);

const createContext = <RecordType,>(
  columns: readonly TableColumn<RecordType>[],
  protectedKeys: readonly string[],
): LayoutContext<RecordType> => {
  const candidates = columns
    .map((column) => ({ column, key: column?.key }))
    .filter((candidate): candidate is { column: TableColumn<RecordType>; key: string } => isLayoutKey(candidate.key));
  const keyCounts = new Map<string, number>();
  candidates.forEach(({ key }) => keyCounts.set(key, (keyCounts.get(key) ?? 0) + 1));

  const contextColumns: LayoutColumn<RecordType>[] = [];
  const segments: string[][] = [];
  let activeRegion: FixedRegion;
  let activeSegment = -1;
  let startsSegment = true;

  candidates.forEach(({ column, key }) => {
    if (keyCounts.get(key) !== 1) return;
    const region = fixedRegion(column);
    const barrier = column.movable === false;
    if (startsSegment || region !== activeRegion || barrier) {
      segments.push([]);
      activeSegment = segments.length - 1;
    }
    const layoutColumn = { column, key, segment: activeSegment };
    contextColumns.push(layoutColumn);
    segments[activeSegment].push(key);
    activeRegion = region;
    startsSegment = barrier;
  });

  return {
    columns: contextColumns,
    byKey: new Map(contextColumns.map((entry) => [entry.key, entry])),
    segments,
    protectedKeys: toProtectedKeys(protectedKeys),
  };
};

const readVersionOne = (input: unknown): Record<string, unknown> | undefined => {
  if (!isRecord(input) || ownValue(input, "schemaVersion") !== 1) return undefined;
  return input;
};

const rawDictionary = (input: Record<string, unknown> | undefined, key: string): Record<string, unknown> | undefined => {
  const value = input && ownValue(input, key);
  return isRecord(value) ? value : undefined;
};

export function columnResizeBounds<RecordType>(column: TableColumn<RecordType>): { min: number; max: number } {
  const explicitMin = typeof column.minWidth === "number" && Number.isFinite(column.minWidth) && column.minWidth >= 0
    ? column.minWidth
    : 64;
  const explicitMax = typeof column.maxWidth === "number" && Number.isFinite(column.maxWidth) && column.maxWidth >= 0
    ? column.maxWidth
    : Infinity;
  return { min: explicitMin, max: Math.max(explicitMin, explicitMax) };
}

const normalizedOrder = <RecordType,>(context: LayoutContext<RecordType>, input: Record<string, unknown> | undefined): string[] => {
  const requested = ownValue(input, "columnOrder");
  const requestedKeys = Array.isArray(requested) ? requested : [];
  const firstOccurrence = new Set<string>();
  const requestedBySegment = context.segments.map(() => [] as string[]);

  requestedKeys.forEach((key) => {
    if (!isLayoutKey(key) || firstOccurrence.has(key)) return;
    firstOccurrence.add(key);
    const column = context.byKey.get(key);
    if (column) requestedBySegment[column.segment].push(key);
  });

  return context.segments.flatMap((segment, index) => {
    const requestedInSegment = requestedBySegment[index];
    const requestedSet = new Set(requestedInSegment);
    return [...requestedInSegment, ...segment.filter((key) => !requestedSet.has(key))];
  });
};

const isForcedVisible = <RecordType,>(entry: LayoutColumn<RecordType>, protectedKeys: Set<string>) => (
  entry.column.hideable === false || protectedKeys.has(entry.key)
);

const defaultVisibility = <RecordType,>(entry: LayoutColumn<RecordType>, protectedKeys: Set<string>) => (
  isForcedVisible(entry, protectedKeys) || entry.column.defaultVisible !== false
);

const ensureMinimumVisibility = <RecordType,>(
  context: LayoutContext<RecordType>,
  visibility: Map<string, boolean>,
): void => {
  context.columns.forEach((entry) => {
    if (isForcedVisible(entry, context.protectedKeys)) visibility.set(entry.key, true);
  });

  const dataColumns = context.columns.filter((entry) => entry.column.layoutRole !== "action");
  const minimumColumns = dataColumns.length > 0 ? dataColumns : context.columns;
  // Defensive fallback for action-only definitions: a layout must remain operable.
  if (minimumColumns.length > 0 && !minimumColumns.some((entry) => visibility.get(entry.key) === true)) {
    visibility.set(minimumColumns[0].key, true);
  }
};

const normalizedVisibility = <RecordType,>(
  context: LayoutContext<RecordType>,
  input: Record<string, unknown> | undefined,
): Record<string, boolean> => {
  const savedVisibility = rawDictionary(input, "columnVisibility");
  const visibility = new Map<string, boolean>();

  context.columns.forEach((entry) => {
    const saved = ownValue(savedVisibility, entry.key);
    const visible = typeof saved === "boolean" ? saved : defaultVisibility(entry, context.protectedKeys);
    visibility.set(entry.key, visible);
  });
  ensureMinimumVisibility(context, visibility);
  return safeDictionary(context.columns.map((entry) => [entry.key, visibility.get(entry.key) === true] as const));
};

const normalizedWidths = <RecordType,>(
  context: LayoutContext<RecordType>,
  input: Record<string, unknown> | undefined,
): Record<string, number> => {
  const savedWidths = rawDictionary(input, "columnWidths");
  const widths: [string, number][] = [];
  context.columns.forEach((entry) => {
    if (entry.column.resizable === false) return;
    const saved = ownValue(savedWidths, entry.key);
    if (typeof saved !== "number" || !Number.isFinite(saved) || saved <= 0) return;
    const { min, max } = columnResizeBounds(entry.column);
    widths.push([entry.key, Math.max(min, Math.min(max, saved))]);
  });
  return safeDictionary(widths);
};

const normalizeWithContext = <RecordType,>(
  context: LayoutContext<RecordType>,
  input: unknown,
): TableColumnLayoutState => {
  const versionOne = readVersionOne(input);
  return {
    schemaVersion: 1,
    columnOrder: normalizedOrder(context, versionOne),
    columnWidths: normalizedWidths(context, versionOne),
    columnVisibility: normalizedVisibility(context, versionOne),
  };
};

export function normalizeColumnLayout<RecordType>(
  columns: readonly TableColumn<RecordType>[],
  input: unknown,
  protectedKeys: readonly string[] = [],
): TableColumnLayoutState {
  return normalizeWithContext(createContext(columns, protectedKeys), input);
}

export function defaultColumnLayout<RecordType>(
  columns: readonly TableColumn<RecordType>[],
  protectedKeys: readonly string[] = [],
): TableColumnLayoutState {
  return normalizeColumnLayout(columns, undefined, protectedKeys);
}

export function moveColumnLayout<RecordType>(
  columns: readonly TableColumn<RecordType>[],
  state: unknown,
  key: string,
  targetKey: string,
  placement: "before" | "after" = "before",
  protectedKeys: readonly string[] = [],
): TableColumnLayoutState {
  const context = createContext(columns, protectedKeys);
  const normalized = normalizeWithContext(context, state);
  const source = context.byKey.get(key);
  const target = context.byKey.get(targetKey);
  if (!source || !target || source.key === target.key || placement !== "before" && placement !== "after"
    || source.column.movable === false || target.column.movable === false || source.segment !== target.segment) return normalized;

  const order = [...normalized.columnOrder];
  const sourceIndex = order.indexOf(source.key);
  const targetIndex = order.indexOf(target.key);
  if (sourceIndex < 0 || targetIndex < 0) return normalized;
  order.splice(sourceIndex, 1);
  const nextTargetIndex = order.indexOf(target.key);
  const insertionIndex = placement === "before" ? nextTargetIndex : nextTargetIndex + 1;
  order.splice(insertionIndex, 0, source.key);
  return normalizeWithContext(context, { ...normalized, columnOrder: order });
}

export function setColumnLayoutWidth<RecordType>(
  columns: readonly TableColumn<RecordType>[],
  state: unknown,
  key: string,
  width: number,
  protectedKeys: readonly string[] = [],
): TableColumnLayoutState {
  const context = createContext(columns, protectedKeys);
  const normalized = normalizeWithContext(context, state);
  const entry = context.byKey.get(key);
  if (!entry || entry.column.resizable === false || !Number.isFinite(width) || width <= 0) return normalized;

  const { min, max } = columnResizeBounds(entry.column);
  const clamped = Math.max(min, Math.min(max, width));
  return normalizeWithContext(context, {
    ...normalized,
    columnWidths: safeDictionary([...Object.entries(normalized.columnWidths), [entry.key, clamped]]),
  });
}

export function setColumnLayoutVisibility<RecordType>(
  columns: readonly TableColumn<RecordType>[],
  state: unknown,
  key: string,
  visible: boolean,
  protectedKeys: readonly string[] = [],
): TableColumnLayoutState {
  const context = createContext(columns, protectedKeys);
  const normalized = normalizeWithContext(context, state);
  const entry = context.byKey.get(key);
  if (!entry || typeof visible !== "boolean" || isForcedVisible(entry, context.protectedKeys)) return normalized;

  return normalizeWithContext(context, {
    ...normalized,
    columnVisibility: safeDictionary([...Object.entries(normalized.columnVisibility), [entry.key, visible]]),
  });
}

export function columnLayoutEqual(a: TableColumnLayoutState, b: TableColumnLayoutState): boolean {
  if (a === b) return true;
  if (a.schemaVersion !== b.schemaVersion || a.columnOrder.length !== b.columnOrder.length) return false;
  if (!a.columnOrder.every((key, index) => key === b.columnOrder[index])) return false;
  const equalDictionary = (left: Record<string, unknown>, right: Record<string, unknown>) => {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    return leftKeys.length === rightKeys.length
      && leftKeys.every((key) => hasOwn(right, key) && Object.is(left[key], right[key]));
  };
  return equalDictionary(a.columnWidths, b.columnWidths) && equalDictionary(a.columnVisibility, b.columnVisibility);
}
