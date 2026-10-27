import { fireEvent, render, screen, within } from "@testing-library/react";
import { Table } from "./Table";
import { defaultColumnLayout } from "./columnLayoutModel";
import type { TableColumn } from "./Table.types";
import type { TableColumnLayoutState } from "./TableColumnLayout.types";

type Row = { id: number; name: string; status: string; children?: Row[] };
const rows: Row[] = [{ id: 1, name: "Alpha", status: "Ready" }];
const columns: TableColumn<Row>[] = [
  { key: "name", title: "名称", dataIndex: "name", minWidth: 100, grow: 1 },
  { key: "status", title: "状态", dataIndex: "status", width: 100 },
  { key: "action", title: "操作", width: 80, movable: false, hideable: false,
    layoutRole: "action", render: () => <button>查看</button> },
];
const saved: TableColumnLayoutState = {
  schemaVersion: 1, columnOrder: ["status", "name", "action"],
  columnWidths: { name: 175 }, columnVisibility: { status: false },
};

describe("Table column customization integration", () => {
  it("preserves invalid whitespace-key columns by disabling customization rather than swallowing them", () => {
    render(<Table columns={[{ key: " ", title: "无效键列", dataIndex: "name" }]}
      dataSource={rows} rowKey="id" columnCustomization={{ resize: true, settings: true }} />);
    expect(screen.getByRole("columnheader", { name: "无效键列" })).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
  });
  it("restores order, manual widths and visibility without emitting user commits", () => {
    const onChange = vi.fn();
    const { container, rerender } = render(<Table columns={columns} dataSource={rows}
      rowKey="id" defaultColumnLayout={saved} onColumnLayoutChange={onChange} />);
    expect(screen.getAllByRole("columnheader").map((node) => node.textContent))
      .toEqual(["名称", "操作"]);
    expect(container.querySelector("col")).toHaveStyle({ width: "175px" });
    rerender(<Table columns={columns.map((column) => ({ ...column, width: 400 }))}
      dataSource={rows} rowKey="id" defaultColumnLayout={{ ...saved, columnWidths: {} }}
      onColumnLayoutChange={onChange} />);
    expect(container.querySelector("col")).toHaveStyle({ width: "175px" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders no customization controls when explicitly disabled", () => {
    render(<Table columns={columns} dataSource={rows} rowKey="id" columnCustomization={{ resize: false }} />);
    expect(screen.queryByRole("button", { name: "列显隐" })).not.toBeInTheDocument();
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /移动列/ })).not.toBeInTheDocument();
  });

  it("ties the visibility entry to visibility regardless of the legacy settings flag", () => {
    const { rerender } = render(<Table columns={columns} dataSource={rows} rowKey="id"
      columnCustomization={{ visibility: true }} />);
    expect(screen.getByRole("button", { name: "列显隐" })).toBeInTheDocument();
    rerender(<Table columns={columns} dataSource={rows} rowKey="id"
      columnCustomization={{ visibility: false, settings: true }} />);
    expect(screen.queryByRole("button", { name: "列显隐" })).toBeNull();
    rerender(<Table columns={columns} dataSource={rows} rowKey="id"
      columnCustomization={{ visibility: true, settings: false }} />);
    expect(screen.getByRole("button", { name: "列显隐" })).toBeInTheDocument();
  });

  it("keeps controlled layout authoritative and emits one immutable full snapshot", () => {
    const onChange = vi.fn();
    const initial: TableColumnLayoutState = { ...saved, columnVisibility: {}, columnWidths: {} };
    const { rerender } = render(<Table columns={columns} dataSource={rows} rowKey="id"
      columnLayout={initial} columnCustomization={{ visibility: true, settings: true }}
      onColumnLayoutChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "列显隐" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "状态" }));
    expect(onChange).toHaveBeenCalledTimes(1);
    const [next, meta] = onChange.mock.calls[0];
    expect(meta).toEqual({ reason: "visibility", columnKey: "status" });
    expect(next.columnVisibility.status).toBe(false);
    expect(screen.getAllByRole("columnheader")).toHaveLength(3);
    rerender(<Table columns={columns} dataSource={rows} rowKey="id"
      columnLayout={next} columnCustomization={{ visibility: true, settings: true }}
      onColumnLayoutChange={onChange} />);
    expect(screen.getAllByRole("columnheader")).toHaveLength(2);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(initial.columnVisibility).toEqual({});
  });

  it("allows explicit external reset without a user commit or a reset action in visibility settings", () => {
    const onChange = vi.fn();
    const { container, rerender } = render(<Table columns={columns} dataSource={rows} rowKey="id"
      columnLayout={saved} columnCustomization={{ visibility: true, settings: false, resize: true }}
      onColumnLayoutChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "列显隐" }));
    expect(screen.queryByRole("button", { name: "恢复默认布局" })).toBeNull();
    rerender(<Table columns={columns} dataSource={rows} rowKey="id"
      columnLayout={defaultColumnLayout(columns)} onColumnLayoutChange={onChange} />);
    expect(screen.getAllByRole("columnheader")).toHaveLength(3);
    expect(container.querySelector("col")).not.toHaveStyle({ width: "175px" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("keeps tree expansion anchored to its key after layout reorders columns", () => {
    render(<Table columns={columns} rowKey="id" dataSource={[
      { ...rows[0], children: [{ id: 2, name: "Child", status: "Ready" }] },
    ]} columnLayout={{ ...saved, columnWidths: {}, columnVisibility: {} }} />);
    const row = screen.getAllByRole("row")[1];
    const cells = within(row).getAllByRole("cell");
    expect(cells[0]).toHaveTextContent("Ready");
    expect(within(cells[1]).getByRole("button", { name: "展开Alpha" })).toBeInTheDocument();
    fireEvent.click(within(cells[1]).getByRole("button", { name: "展开Alpha" }));
    expect(screen.getByText("Child")).toBeInTheDocument();
  });

  it("disables order and visibility overrides for horizontal spans but not style-only onCell", () => {
    const { rerender } = render(<Table rowKey="id" dataSource={rows}
      columns={columns.map((column, index) => ({ ...column,
        onCell: () => ({ colSpan: index === 0 ? 2 : index === 1 ? 0 : 1 }) }))}
      columnLayout={saved} columnCustomization={{ reorder: true, visibility: true }} />);
    expect(screen.getAllByRole("columnheader").map((node) => node.textContent))
      .toEqual(["名称", "状态", "操作"]);
    expect(screen.queryByRole("button", { name: /移动列/ })).not.toBeInTheDocument();
    rerender(<Table rowKey="id" dataSource={rows}
      columns={columns.map((column) => ({ ...column, onCell: () => ({ style: { color: "red" } }) }))}
      columnLayout={saved} />);
    expect(screen.getAllByRole("columnheader").map((node) => node.textContent))
      .toEqual(["名称", "操作"]);
  });
});
