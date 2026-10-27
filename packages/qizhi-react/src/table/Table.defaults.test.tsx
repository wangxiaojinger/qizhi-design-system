import { act, fireEvent, render, screen } from "@testing-library/react";
import { Table } from "./Table";
import type { TableColumn } from "./Table.types";

const columns: TableColumn<{ id: number; value: string | null }>[] = [
  { key: "value", title: "内容", dataIndex: "value", width: 160 },
];
const rows = [{ id: 1, value: "默认两行文本" }];

describe("Table built-in business defaults", () => {
  it("applies the approved defaults without an opt-in configuration", () => {
    const { container } = render(<Table columns={columns} dataSource={rows} rowKey="id" />);
    expect(container.firstChild).not.toHaveClass("is-bordered");
    expect(container.firstChild).toHaveClass("is-hoverable");
    expect(screen.getByRole("columnheader")).toHaveTextContent("内容");
    expect(screen.queryByRole("separator")).toBeNull();
    expect(container.querySelector(".qizhi-table__text.is-rows-2")).toHaveTextContent("默认两行文本");
    expect(screen.queryByRole("button", { name: "列显隐" })).toBeNull();
    expect(screen.queryByRole("button", { name: /移动列/ })).toBeNull();
    expect(screen.queryByRole("checkbox")).toBeNull();
  });

  it("merges partial feature configuration and honors explicit false", () => {
    const { rerender, container } = render(<Table columns={columns} dataSource={rows} rowKey="id"
      columnCustomization={{ visibility: true }} />);
    expect(screen.getByRole("button", { name: "列显隐" })).toBeInTheDocument();
    expect(screen.queryByRole("separator")).toBeNull();
    rerender(<Table columns={columns} dataSource={rows} rowKey="id"
      columnCustomization={{ resize: undefined, visibility: true }} />);
    expect(screen.queryByRole("separator")).toBeNull();
    rerender(<Table columns={columns} dataSource={rows} rowKey="id" border
      columnCustomization={{ resize: true, visibility: true }} />);
    expect(container.firstChild).toHaveClass("is-bordered");
    expect(screen.getByRole("separator")).toBeInTheDocument();
    rerender(<Table columns={columns} dataSource={rows} rowKey="id" border={false}
      hover={false} ellipsis={false} columnCustomization={{ resize: false, reorder: true }} />);
    expect(container.firstChild).not.toHaveClass("is-bordered");
    expect(container.firstChild).not.toHaveClass("is-hoverable");
    expect(screen.queryByRole("separator")).toBeNull();
    expect(screen.getByRole("button", { name: "移动列 内容" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "列显隐" })).toBeNull();
    expect(container.querySelector(".qizhi-table__text")).toBeNull();
  });

  it("prioritizes column text settings and never clamps custom controls", () => {
    const { container, rerender } = render(<Table rowKey="id" dataSource={rows}
      columns={[
        { ...columns[0], key: "wrap", ellipsis: false },
        { ...columns[0], key: "legacy", ellipsis: true },
        { key: "action", title: "操作", render: () => <button>详情</button> },
      ]} />);
    const cells = container.querySelectorAll("tbody .qizhi-table__cell");
    expect(cells[0].querySelector(".qizhi-table__text")).toBeNull();
    expect(cells[1]).toHaveClass("is-ellipsis");
    expect(cells[1]).toHaveAttribute("title", "默认两行文本");
    expect(cells[2].querySelector(".qizhi-table__text")).toBeNull();
    rerender(<Table rowKey="id" dataSource={rows} ellipsis={false}
      columns={[{ ...columns[0], ellipsis: { rows: 1, tooltip: false } }]} />);
    expect(container.querySelector(".qizhi-table__text.is-rows-1")).toBeInTheDocument();
  });

  it("uses a missing-value placeholder by default and permits disabling it", () => {
    const data = [null, undefined, "", 0, false].map((value, id) => ({ id, value }));
    const { container, rerender } = render(<Table rowKey="id" columns={[
      { key: "value", title: "值", dataIndex: "value" },
    ]} dataSource={data} />);
    expect([...container.querySelectorAll("tbody td")].map((cell) => cell.textContent))
      .toEqual(["-", "-", "-", "0", ""]);
    rerender(<Table rowKey="id" columns={columns} dataSource={[{ id: 1, value: null }]} emptyCell={null} />);
    expect(container.querySelector("tbody td")).toHaveTextContent("");
  });

  it("pads default and custom empty states and permits explicit zero padding", () => {
    const { container, rerender } = render(<Table columns={columns} dataSource={[]} rowKey="id" />);
    expect(container.querySelector(".qizhi-table__empty-content")).toHaveStyle({ paddingBlock: "36px" });
    rerender(<Table columns={columns} dataSource={[]} rowKey="id" empty="没有结果" emptyPadding={0} />);
    expect(container.querySelector(".qizhi-table__empty-content")).toHaveStyle({ paddingBlock: "0px" });
  });

  it("defaults loading to the data area and preserves explicit whole-table loading", () => {
    const { container, rerender } = render(<Table columns={columns} dataSource={rows} rowKey="id" loading />);
    expect(container.querySelector(".qizhi-table__loading")).toHaveAttribute("data-scope", "body");
    expect(screen.getByText("默认两行文本")).toBeInTheDocument();
    rerender(<Table columns={columns} dataSource={rows} rowKey="id" loading={{ spinning: true }} />);
    expect(container.querySelector(".qizhi-table__loading")).toHaveAttribute("data-scope", "body");
    rerender(<Table columns={columns} dataSource={rows} rowKey="id" loading={{ spinning: true, scope: "table" }} />);
    expect(container.querySelector(".qizhi-table__scroll > .qizhi-table__loading")).not.toBeNull();
  });

  it("disables fixed columns at 640px by default and permits false or another threshold", () => {
    let width = 640;
    const callbacks: ResizeObserverCallback[] = [];
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(() => width);
    vi.stubGlobal("ResizeObserver", class {
      constructor(callback: ResizeObserverCallback) { callbacks.push(callback); }
      observe() {} disconnect() {} unobserve() {}
    });
    try {
      const fixed = [{ ...columns[0], fixed: "left" as const }];
      const { container, rerender } = render(<Table columns={fixed} dataSource={rows} rowKey="id" />);
      expect(container.querySelector(".is-fixed-left")).toBeNull();
      width = 641;
      act(() => callbacks.forEach((callback) => callback([], {} as ResizeObserver)));
      expect(container.querySelector(".is-fixed-left")).not.toBeNull();
      rerender(<Table columns={fixed} dataSource={rows} rowKey="id" fixedBreakpoint={false} />);
      width = 300;
      act(() => callbacks.forEach((callback) => callback([], {} as ResizeObserver)));
      expect(container.querySelector(".is-fixed-left")).not.toBeNull();
      rerender(<Table columns={fixed} dataSource={rows} rowKey="id" fixedBreakpoint={800} />);
      expect(container.querySelector(".is-fixed-left")).toBeNull();
    } finally { vi.unstubAllGlobals(); }
  });

  it("commits a manual width through an explicitly enabled handle without mutating columns", () => {
    const onChange = vi.fn();
    render(<Table columns={columns} dataSource={rows} rowKey="id" columnCustomization={{ resize: true }} onColumnLayoutChange={onChange} />);
    fireEvent.keyDown(screen.getByRole("separator"), { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].columnWidths.value).toBe(168);
    expect(columns[0].width).toBe(160);
  });

  it("reserves actual table borders inside the automatic width budget", () => {
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(240);
    const flexible = [{ ...columns[0], width: 120, minWidth: 120, grow: 1 }];
    const { container, rerender } = render(<Table rowKey="id" columns={flexible}
      dataSource={rows} style={{ border: "3px solid black" }} />);
    expect(container.querySelector("col")).toHaveStyle({ width: "234px" });
    expect(container.querySelector("table")).toHaveStyle({ width: "240px" });
    rerender(<Table rowKey="id" columns={flexible} dataSource={rows}
      border={false} style={{ border: "0px solid black" }} />);
    expect(container.querySelector("col")).toHaveStyle({ width: "240px" });
  });
});
