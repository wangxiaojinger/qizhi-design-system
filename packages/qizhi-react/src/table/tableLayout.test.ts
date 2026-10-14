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
});
