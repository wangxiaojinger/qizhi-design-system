import { act, render, screen } from "@testing-library/react";
import { Table } from "./Table";
import type { TableColumn } from "./Table.types";

describe("Table opt-in engineering capabilities", () => {
  const columns: TableColumn<{ id: number; value: unknown }>[] = [
    { key: "value", title: "内容", dataIndex: "value", width: 160, fixed: "left" },
  ];

  it("only fills missing raw cells when requested, preserving render, zero and false", () => {
    const rows = [null, undefined, "", 0, false].map((value, id) => ({ id, value }));
    const { container, rerender } = render(
      <Table columns={columns} rowKey="id" dataSource={rows} emptyCell="-" />,
    );
    const cells = [...container.querySelectorAll("tbody td")];
    expect(cells.map((cell) => cell.textContent)).toEqual(["-", "-", "-", "0", ""]);
    rerender(<Table columns={[{ ...columns[0], render: () => "从未使用" }]}
      rowKey="id" dataSource={rows} emptyCell="-" />);
    expect(screen.getAllByText("从未使用")).toHaveLength(5);
    rerender(<Table columns={columns} rowKey="id" dataSource={rows} />);
    expect(container.querySelector("tbody td")).toHaveTextContent("");
  });

  it("keeps boolean loading compatible and accepts explicit body-only loading", () => {
    const { container, rerender } = render(<Table columns={columns} rowKey="id"
      dataSource={[{ id: 1, value: "保留数据" }]} loading />);
    expect(screen.getByRole("status")).toHaveTextContent("加载中...");
    rerender(<Table columns={columns} rowKey="id"
      dataSource={[{ id: 1, value: "保留数据" }]}
      loading={{ spinning: true, scope: "body", tip: "正在刷新" }} />);
    expect(screen.getByRole("status")).toHaveTextContent("正在刷新");
    expect(screen.getByRole("columnheader")).toHaveTextContent("内容");
    expect(screen.getByText("保留数据")).toBeInTheDocument();
    expect(container.querySelector(".qizhi-table__loading"))
      .toHaveAttribute("data-scope", "body");
    rerender(<Table columns={columns} rowKey="id" dataSource={[]}
      loading={{ spinning: false, scope: "body" }} />);
    expect(container.querySelector(".qizhi-table__loading")).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("暂无数据");
  });

  it("only clamps enhanced primitive text and never wraps complex controls or placeholders", () => {
    const { container } = render(<Table rowKey="id" emptyCell="-" columns={[
      { ...columns[0], ellipsis: { rows: 2, tooltip: true } },
      { key: "action", title: "操作", ellipsis: { rows: 2, tooltip: true },
        render: () => <button>打开详情</button> },
    ]} dataSource={[{ id: 1, value: "长名称 gjpqy_" }, { id: 2, value: null }]} />);
    expect(container.querySelectorAll(".qizhi-table__text")).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "打开详情" })).toHaveLength(2);
    expect(screen.getByText("-").closest(".qizhi-table__cell"))
      .not.toHaveClass("is-ellipsis");
    expect(screen.getAllByRole("button", { name: "打开详情" })[0].parentElement)
      .not.toHaveClass("is-ellipsis");
  });

  it("pads both default and custom empty content once only when opted in", () => {
    const { container, rerender } = render(<Table columns={columns} rowKey="id"
      dataSource={[]} emptyPadding={36} />);
    expect(container.querySelector(".qizhi-table__empty-content"))
      .toHaveStyle({ paddingBlock: "36px" });
    rerender(<Table columns={columns} rowKey="id" dataSource={[]}
      empty={<span>没有匹配记录</span>} emptyPadding={36} />);
    expect(container.querySelectorAll(".qizhi-table__empty-content")).toHaveLength(1);
    expect(container.querySelector(".qizhi-table__empty-content"))
      .toHaveTextContent("没有匹配记录");
    rerender(<Table columns={columns} rowKey="id" dataSource={[]} />);
    expect(container.querySelector(".qizhi-table__empty-content")).toBeNull();
  });

  it("disables fixed columns by container width and restores them after resize", () => {
    let width = 640;
    const callbacks: ResizeObserverCallback[] = [];
    const clientWidth = vi.spyOn(HTMLElement.prototype, "clientWidth", "get")
      .mockImplementation(() => width);
    vi.stubGlobal("ResizeObserver", class {
      constructor(callback: ResizeObserverCallback) { callbacks.push(callback); }
      observe() {} disconnect() {} unobserve() {}
    });
    try {
      const { container, rerender } = render(<Table columns={columns} rowKey="id"
        dataSource={[{ id: 1, value: "固定列" }]} fixedBreakpoint={640} />);
      expect(container.querySelector(".is-fixed-left")).toBeNull();
      width = 641;
      act(() => callbacks.forEach((callback) => callback([], {} as ResizeObserver)));
      expect(container.querySelector(".is-fixed-left")).not.toBeNull();
      width = 300;
      act(() => callbacks.forEach((callback) => callback([], {} as ResizeObserver)));
      expect(container.querySelector(".is-fixed-left")).toBeNull();
      rerender(<Table columns={columns} rowKey="id"
        dataSource={[{ id: 1, value: "固定列" }]} />);
      expect(container.querySelector(".is-fixed-left")).not.toBeNull();
    } finally {
      clientWidth.mockRestore();
      vi.unstubAllGlobals();
    }
  });
});
