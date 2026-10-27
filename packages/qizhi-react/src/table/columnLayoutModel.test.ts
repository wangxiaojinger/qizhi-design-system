import type { TableColumn } from "./Table.types";
import {
  columnLayoutEqual,
  columnResizeBounds,
  defaultColumnLayout,
  moveColumnLayout,
  normalizeColumnLayout,
  setColumnLayoutVisibility,
  setColumnLayoutWidth,
} from "./columnLayoutModel";

type Row = { id: string };

const columns = (overrides: Partial<TableColumn<Row>>[] = []): TableColumn<Row>[] => {
  const defaults: TableColumn<Row>[] = [
    { key: "a", title: "A" },
    { key: "b", title: "B" },
    { key: "lock", title: "Lock", movable: false },
    { key: "c", title: "C" },
    { key: "d", title: "D" },
    { key: "action", title: "Action", fixed: "right", layoutRole: "action" },
  ];
  return defaults.map((column, index) => ({ ...column, ...overrides[index] }));
};

describe("column layout model", () => {
  it("normalizes requested order only inside source fixed and locked segments, retaining hidden columns", () => {
    const current = columns([{ fixed: "left" }, { fixed: "left" }]);
    const layout = normalizeColumnLayout(current, {
      schemaVersion: 1,
      columnOrder: ["d", "c", "b", "a", "action", "lock"],
      columnWidths: {},
      columnVisibility: { b: false },
    });

    expect(layout.columnOrder).toEqual(["b", "a", "lock", "d", "c", "action"]);
    expect(layout.columnVisibility).toEqual({ a: true, b: false, lock: true, c: true, d: true, action: true });
  });

  it("removes stale or duplicated persisted entries and appends current definitions in source order", () => {
    const current = columns().slice(0, 5);
    const layout = normalizeColumnLayout(current, {
      schemaVersion: 1,
      columnOrder: ["b", "b", "removed", "a"],
      columnWidths: { removed: 120 },
      columnVisibility: { removed: false },
    });

    expect(layout.columnOrder).toEqual(["b", "a", "lock", "c", "d"]);
    expect(layout.columnWidths).toEqual({});
    expect(layout.columnVisibility).toEqual({ a: true, b: true, lock: true, c: true, d: true });
  });

  it("accepts schema version one only and falls back safely for damaged values", () => {
    const current = columns().slice(0, 2);
    const defaults = defaultColumnLayout(current);

    expect(normalizeColumnLayout(current, {
      schemaVersion: 2,
      columnOrder: ["b", "a"],
      columnWidths: { a: 180 },
      columnVisibility: { a: false },
    })).toEqual(defaults);
    expect(normalizeColumnLayout(current, {
      schemaVersion: 1,
      columnOrder: "b,a",
      columnWidths: [180],
      columnVisibility: null,
    })).toEqual(defaults);
  });

  it("retains only explicit, resizable finite widths and clamps them to current bounds", () => {
    const current = columns([
      { minWidth: 100, maxWidth: 200 },
      { resizable: false },
      {},
      { minWidth: 300, maxWidth: 200 },
      {},
    ]).slice(0, 5);
    const layout = normalizeColumnLayout(current, {
      schemaVersion: 1,
      columnOrder: [],
      columnWidths: { a: 260, b: 170, c: 20, d: 20, unknown: 120 },
      columnVisibility: {},
    });

    expect(layout.columnWidths).toEqual({ a: 200, c: 300, d: 64 });
    expect(columnResizeBounds(current[0])).toEqual({ min: 100, max: 200 });
    expect(columnResizeBounds(current[3])).toEqual({ min: 300, max: 300 });
    expect(columnResizeBounds({ key: "x", title: "X", minWidth: 0, maxWidth: 0 })).toEqual({ min: 0, max: 0 });
    expect(columnResizeBounds({ key: "x", title: "X" })).toEqual({ min: 64, max: Infinity });
  });

  it("enforces forced visibility and a visible data column, with an all-action fallback", () => {
    const current = columns([
      { defaultVisible: false },
      { defaultVisible: false, hideable: false },
      { defaultVisible: false },
      { defaultVisible: false, layoutRole: "action" },
      { defaultVisible: false, layoutRole: "action" },
    ]).slice(0, 5);
    const layout = defaultColumnLayout(current, ["c"]);

    expect(layout.columnVisibility).toEqual({ a: false, b: true, lock: false, c: true, d: false });
    expect(defaultColumnLayout([
      { key: "one", title: "One", layoutRole: "action", defaultVisible: false },
      { key: "two", title: "Two", layoutRole: "action", defaultVisible: false },
    ]).columnVisibility).toEqual({ one: true, two: false });
  });

  it("does not hide the final visible data column or a protected/non-hideable column", () => {
    const current: TableColumn<Row>[] = [
      { key: "a", title: "A" },
      { key: "b", title: "B" },
      { key: "action", title: "Action", layoutRole: "action" },
    ];
    const before = defaultColumnLayout(current, ["b"]);
    const afterFirstHide = setColumnLayoutVisibility(current, before, "a", false, ["b"]);
    const afterSecondHide = setColumnLayoutVisibility(current, afterFirstHide, "b", false, ["b"]);

    expect(afterFirstHide.columnVisibility).toEqual({ a: false, b: true, action: true });
    expect(columnLayoutEqual(afterSecondHide, afterFirstHide)).toBe(true);
  });

  it("moves only movable keys within their current segment and treats rejected moves as no-ops", () => {
    const current = columns();
    const state = defaultColumnLayout(current);
    const moved = moveColumnLayout(current, state, "d", "c", "before");

    expect(moved.columnOrder).toEqual(["a", "b", "lock", "d", "c", "action"]);
    expect(columnLayoutEqual(moveColumnLayout(current, moved, "d", "a"), moved)).toBe(true);
    expect(columnLayoutEqual(moveColumnLayout(current, moved, "c", "lock"), moved)).toBe(true);
    expect(columnLayoutEqual(moveColumnLayout(current, moved, "missing", "c"), moved)).toBe(true);
  });

  it("updates a valid resizable width only and keeps no-op state equal", () => {
    const current = columns([{ minWidth: 100, maxWidth: 200 }, { resizable: false }]).slice(0, 2);
    const state = defaultColumnLayout(current);
    const resized = setColumnLayoutWidth(current, state, "a", 300);

    expect(resized.columnWidths).toEqual({ a: 200 });
    expect(columnLayoutEqual(setColumnLayoutWidth(current, resized, "b", 180), resized)).toBe(true);
    expect(columnLayoutEqual(setColumnLayoutWidth(current, resized, "a", Number.NaN), resized)).toBe(true);
  });

  it("safely preserves special keys through JSON and does not alias inputs", () => {
    const current: TableColumn<Row>[] = [
      { key: "__proto__", title: "Proto" },
      { key: "constructor", title: "Constructor" },
    ];
    const input = JSON.parse('{"schemaVersion":1,"columnOrder":["constructor","__proto__"],"columnWidths":{"__proto__":160,"constructor":180},"columnVisibility":{"__proto__":false,"constructor":true}}');
    const layout = normalizeColumnLayout(current, input);

    input.columnOrder[0] = "__proto__";
    input.columnWidths.constructor = 1;
    input.columnVisibility.__proto__ = true;

    expect(layout.columnOrder).toEqual(["constructor", "__proto__"]);
    expect(Object.prototype.hasOwnProperty.call(layout.columnWidths, "__proto__")).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(layout.columnWidths, "constructor")).toBe(true);
    expect(layout.columnWidths).toEqual(Object.fromEntries([["__proto__", 160], ["constructor", 180]]));
    expect(layout.columnVisibility).toEqual(Object.fromEntries([["__proto__", false], ["constructor", true]]));
    expect(JSON.parse(JSON.stringify(layout))).toEqual(layout);
    expect(({} as { polluted?: unknown }).polluted).toBeUndefined();
  });

  it("does not include empty or duplicate current keys in a serializable layout", () => {
    const current = [
      { key: "", title: "Empty" },
      { key: "dup", title: "First" },
      { key: "dup", title: "Second" },
      { key: "valid", title: "Valid" },
    ] as TableColumn<Row>[];

    expect(defaultColumnLayout(current)).toEqual({
      schemaVersion: 1,
      columnOrder: ["valid"],
      columnWidths: {},
      columnVisibility: { valid: true },
    });
  });
});
