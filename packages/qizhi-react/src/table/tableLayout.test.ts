import { allocateColumnWidths } from "./tableLayout";

describe("Table numeric width allocation", () => {
  it("gives remaining space only to growing columns and redistributes at caps", () => {
    expect(allocateColumnWidths([
      { width: 96 }, { minWidth: 160, maxWidth: 220, grow: 1 },
      { minWidth: 120, grow: 1 }, { width: 224 },
    ], 800)).toEqual([96, 220, 260, 224]);
  });
  it("shrinks growing columns to their floors before overflowing", () => {
    const columns = [{ width: 96 }, { width: 300, minWidth: 160, grow: 1 }, { width: 224 }];
    expect(allocateColumnWidths(columns, 520)).toEqual([96, 200, 224]);
    expect(allocateColumnWidths(columns, 400)).toEqual([96, 160, 224]);
  });
  it("keeps compact widths and allows unused space when caps are reached", () => {
    const columns = [{ width: 96 }, { minWidth: 160, maxWidth: 220, grow: 1 }];
    expect(allocateColumnWidths(columns, 900, true)).toEqual([96, 160]);
    expect(allocateColumnWidths(columns, 900)).toEqual([96, 220]);
  });
  it("uses growth weights and normalizes conflicting bounds", () => {
    expect(allocateColumnWidths([{ minWidth: 100, grow: 1 }, { minWidth: 100, grow: 3 }], 600)).toEqual([200, 400]);
    expect(allocateColumnWidths([{ width: 60, minWidth: 100, maxWidth: 80 }], 600)).toEqual([100]);
  });
  it("caps an explicit width when no minimum is supplied", () => {
    expect(allocateColumnWidths([{ width: 300, maxWidth: 200 }], 800)).toEqual([200]);
  });
  it("shrinks an independently shrinkable column without making fixed columns flexible", () => {
    expect(allocateColumnWidths([
      { width: 96, shrink: 0 }, { width: 224 }, { width: 300, shrink: 1 },
    ], 500)).toEqual([96, 224, 180]);
  });
  it("keeps fixed action columns and surplus unchanged without an explicit grow", () => {
    expect(allocateColumnWidths([{ width: 96 }, { width: 224 }], 800)).toEqual([96, 224]);
  });
  it("shrinks lower-priority tiers with weighted redistribution before later tiers", () => {
    expect(allocateColumnWidths([
      { width: 300, minWidth: 100, shrink: 1, shrinkPriority: 0 },
      { width: 300, minWidth: 100, shrink: 3, shrinkPriority: 0 },
      { width: 300, minWidth: 100, shrink: 1, shrinkPriority: 1 },
    ], 600)).toEqual([200, 100, 300]);
  });
  it("grows lower-priority tiers first and continues after their caps", () => {
    const columns = [
      { minWidth: 100, maxWidth: 200, grow: 1, growPriority: 0 },
      { minWidth: 100, maxWidth: 220, grow: 3, growPriority: 0 },
      { minWidth: 100, grow: 1, growPriority: 1 },
    ];
    expect(allocateColumnWidths(columns, 500)).toEqual([180, 220, 100]);
    expect(allocateColumnWidths(columns, 700)).toEqual([200, 220, 280]);
  });
  it("applies bounded independent shrink while preserving a conflicting explicit minimum", () => {
    expect(allocateColumnWidths([{ width: 300, maxWidth: 200, shrink: 1 }], 0)).toEqual([120]);
    expect(allocateColumnWidths([{ width: 300, minWidth: 180, maxWidth: 120, shrink: 1 }], 0)).toEqual([180]);
  });
  it("sanitizes invalid weights, honors negative priorities, and treats invalid available width as zero", () => {
    expect(allocateColumnWidths([
      { minWidth: 100, grow: 1, growPriority: Number.POSITIVE_INFINITY },
      { minWidth: 100, grow: 1, growPriority: -1 },
    ], 500)).toEqual([100, 400]);
    expect(allocateColumnWidths([
      { width: 300, shrink: Number.NaN }, { width: 300, shrink: Number.POSITIVE_INFINITY }, { width: 300, shrink: -1 },
    ], 0)).toEqual([300, 300, 300]);
    expect(allocateColumnWidths([{ width: 300, shrink: 1 }], Number.NaN)).toEqual([120]);
  });
});
