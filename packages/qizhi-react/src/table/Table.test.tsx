import { fireEvent, render, screen } from "@testing-library/react";
import { Table } from "./Table";
import type { TableColumn, TableSortOrder } from "./Table.types";

type Row = { id: number; name: string; salary: number; children?: Row[] };
const data: Row[] = [{ id: 1, name: "乙", salary: 2 }, { id: 2, name: "甲", salary: 1 }];
const columns: TableColumn<Row>[] = [{ key: "name", title: "姓名", dataIndex: "name" }, { key: "salary", title: "薪水", dataIndex: "salary", sorter: (a, b) => a.salary - b.salary }];

describe("Table", () => {
  it("honors explicit cell alignment independently of the column header", () => {
    const { container } = render(<Table rowKey="id" dataSource={data} columns={[
      { key: "name", title: "姓名", dataIndex: "name", align: "right", onCell: () => ({ style: { textAlign: "center" } }) },
    ]} />);
    expect(container.querySelector("th")).toHaveAttribute("data-align", "right");
    expect(container.querySelector("td")).toHaveStyle({ textAlign: "center" });
    expect(container.querySelector("td")).toHaveAttribute("data-align", "center");
  });
  it("keeps column declarations without headers and aligns sortable headers and cells", () => {
    const layoutColumns: TableColumn<Row>[] = [
      { key: "name", title: "姓名", dataIndex: "name", width: 180 },
      { key: "salary", title: "薪水", dataIndex: "salary", width: 120, align: "right", sorter: (a, b) => a.salary - b.salary },
    ];
    const { container, rerender } = render(<Table rowKey="id" columns={layoutColumns} dataSource={data} />);
    expect(container.querySelectorAll("col")).toHaveLength(2);
    expect(container.querySelectorAll("col")[0]).toHaveStyle({ width: "180px" });
    expect(container.querySelectorAll("th")[1]).toHaveStyle({ textAlign: "right" });
    expect(container.querySelectorAll("td")[1]).toHaveStyle({ textAlign: "right" });
    rerender(<Table rowKey="id" columns={layoutColumns} dataSource={data} showHeader={false} />);
    expect(container.querySelectorAll("col")[0]).toHaveStyle({ width: "180px" });
    expect(container.querySelector("thead")).toBeNull();
  });
  it("supports explicit auto and compact modes without changing legacy defaults", () => {
    const { container, rerender } = render(<Table rowKey="id" columns={columns} dataSource={data} />);
    expect(container.querySelector("table")).toHaveStyle({ tableLayout: "fixed" });
    rerender(<Table rowKey="id" columns={columns} dataSource={data} layoutMode="compact" />);
    expect(container.querySelector("table")).toHaveStyle({ tableLayout: "auto", width: "max-content" });
    rerender(<Table rowKey="id" columns={[{ ...columns[0], minWidth: 200 }]} dataSource={data} tableLayout="auto" />);
    expect(container.querySelector("col")).toHaveStyle({ minWidth: "200px" });
  });
  it("keeps the default table outline-free like the legacy specification", () => {
    const { container } = render(<Table rowKey="id" columns={columns} dataSource={data} />);
    expect(container.querySelector(".qizhi-table")).not.toHaveClass("is-bordered");
  });

  it("wraps cell content by default and marks only ellipsis columns", () => {
    const contentColumns: TableColumn<Row>[] = [
      { key: "name", title: "姓名", dataIndex: "name" },
      { key: "salary", title: "薪水", dataIndex: "salary", ellipsis: true },
    ];
    const { container } = render(
      <Table rowKey="id" columns={contentColumns} dataSource={data} />,
    );
    const cells = container.querySelectorAll("tbody .qizhi-table__cell");

    expect(cells[0]).not.toHaveClass("is-ellipsis");
    expect(cells[1]).toHaveClass("is-ellipsis");
    expect(cells[1]).toHaveAttribute("title", "2");
  });

  it("allows an ellipsis column to disable the native title", () => {
    const contentColumns: TableColumn<Row>[] = [
      {
        key: "name",
        title: "姓名",
        dataIndex: "name",
        ellipsis: { showTitle: false },
      },
    ];
    const { container } = render(
      <Table rowKey="id" columns={contentColumns} dataSource={data} />,
    );

    expect(container.querySelector(".qizhi-table__cell")).toHaveClass("is-ellipsis");
    expect(container.querySelector(".qizhi-table__cell")).not.toHaveAttribute("title");
  });

  it("cycles sorting and announces the active order", () => {
    const { container } = render(<Table aria-label="人员" rowKey="id" columns={columns} dataSource={data} />);
    expect(container.querySelectorAll(".qizhi-table__sorter-icon")).toHaveLength(2);
    expect(container.querySelectorAll(".qizhi-table__sorter svg path")).toHaveLength(2);
    expect(container.querySelector(".qizhi-table__sorter")).not.toHaveTextContent("↕");
    const sort = screen.getByRole("button", { name: "按薪水升序排序" });
    fireEvent.click(sort);
    expect(screen.getAllByRole("row")[1]).toHaveTextContent("甲");
    expect(screen.getByRole("columnheader", { name: /薪水/ })).toHaveAttribute("aria-sort", "ascending");
    expect(screen.getByRole("columnheader", { name: /薪水/ })).toHaveClass("is-sortable");
    fireEvent.click(screen.getByRole("button", { name: "按薪水降序排序" }));
    expect(screen.getAllByRole("row")[1]).toHaveTextContent("乙");
  });

  it("supports sorter Tooltip targets with column overrides", () => {
    const tooltipColumns: TableColumn<Row>[] = [
      {
        key: "name",
        title: "姓名",
        dataIndex: "name",
        sorter: (a, b) => a.name.localeCompare(b.name),
        showSorterTooltip: { target: "full-header" },
      },
      {
        key: "salary",
        title: "薪水",
        dataIndex: "salary",
        sorter: (a, b) => a.salary - b.salary,
      },
    ];
    const { container } = render(
      <Table
        rowKey="id"
        columns={tooltipColumns}
        dataSource={data}
        showSorterTooltip={{ target: "sorter-icon" }}
      />,
    );

    expect(screen.getByRole("button", { name: "按姓名升序排序" }))
      .toHaveAttribute("aria-expanded", "false");
    expect(container.querySelectorAll(".qizhi-table__sorter-target"))
      .toHaveLength(1);
    expect(container.querySelector(".qizhi-table__sorter-target"))
      .toHaveAttribute("aria-expanded", "false");
  });

  it("respects custom sort directions and reports each transition", () => {
    const changes: TableSortOrder[] = [];
    const customColumns: TableColumn<Row>[] = [
      {
        key: "salary",
        title: "薪水",
        dataIndex: "salary",
        sorter: (a, b) => a.salary - b.salary,
        sortDirections: ["descend"],
      },
    ];
    render(
      <Table
        rowKey="id"
        columns={customColumns}
        dataSource={data}
        onSortChange={(order) => changes.push(order)}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "按薪水降序排序" }));
    expect(screen.getByRole("columnheader", { name: /薪水/ }))
      .toHaveAttribute("aria-sort", "descending");
    fireEvent.click(screen.getByRole("button", { name: "按薪水取消排序" }));
    expect(screen.getByRole("columnheader", { name: /薪水/ }))
      .toHaveAttribute("aria-sort", "none");
    expect(changes).toEqual(["descend", null]);
  });

  it("shows fixed-column edge shadows only after horizontal scrolling", () => {
    const fixedColumns: TableColumn<Row>[] = [
      { key: "name", title: "姓名", dataIndex: "name", fixed: "left" },
      { key: "salary", title: "薪水", dataIndex: "salary", fixed: "right" },
    ];
    const { container } = render(<Table rowKey="id" columns={fixedColumns} dataSource={data} scrollX={600} />);
    const table = container.querySelector(".qizhi-table")!;
    const scroller = container.querySelector(".qizhi-table__scroll")!;
    expect(table).not.toHaveClass("has-left-fixed-shadow", "has-right-fixed-shadow");
    Object.defineProperties(scroller, {
      clientWidth: { configurable: true, value: 300 },
      scrollWidth: { configurable: true, value: 600 },
      scrollLeft: { configurable: true, value: 120 },
    });
    fireEvent.scroll(scroller);
    expect(table).toHaveClass("has-left-fixed-shadow", "has-right-fixed-shadow");
  });

  it("selects enabled rows and reports their records", () => {
    const changes: number[][] = [];
    render(<Table rowKey="id" columns={columns} dataSource={data} rowSelection={{ getCheckboxProps: (row) => ({ disabled: row.id === 2 }), onChange: (keys) => changes.push(keys as number[]) }} />);
    fireEvent.click(screen.getByRole("checkbox", { name: "全选当前数据" }));
    expect(changes.at(-1)).toEqual([1]);
    expect(screen.getByRole("checkbox", { name: "选择乙" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "选择甲" })).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: "选择乙" }).closest("label"))
      .toHaveClass("qizhi-checkbox");
    expect(screen.getByRole("checkbox", { name: "全选当前数据" })
      .closest("label")).toHaveClass("qizhi-checkbox");
    expect(screen.getByRole("checkbox", { name: "全选当前数据" }).closest("th")).toHaveClass("qizhi-table__th");
  });

  it("reuses Radio for single row selection", () => {
    render(
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        rowSelection={{ type: "radio" }}
      />,
    );

    const radio = screen.getByRole("radio", { name: "选择乙" });
    expect(radio.closest("label")).toHaveClass("qizhi-radio");
    fireEvent.click(radio);
    expect(radio).toBeChecked();
  });

  it("does not apply selected fill to a checked disabled row", () => {
    render(<Table rowKey="id" columns={columns} dataSource={data} rowSelection={{ defaultSelectedRowKeys: [2], getCheckboxProps: (row) => ({ disabled: row.id === 2 }) }} />);
    const disabledCheckbox = screen.getByRole("checkbox", { name: "选择甲" });
    expect(disabledCheckbox).toBeChecked();
    expect(disabledCheckbox).toBeDisabled();
    expect(disabledCheckbox.closest("tr")).not.toHaveClass("is-selected");
  });

  it("expands custom content and tree children", () => {
    const tree: Row[] = [{ id: 1, name: "父级", salary: 2, children: [{ id: 3, name: "子级", salary: 1 }] }];
    render(<Table rowKey="id" columns={columns} dataSource={tree} expandable={{ expandedRowRender: (row) => <span>{row.name}详情</span> }} />);
    const expand = screen.getByRole("button", { name: "展开父级" });
    expect(expand.querySelector("svg")).toBeInTheDocument();
    expect(expand).not.toHaveTextContent("+");
    fireEvent.click(expand);
    expect(screen.getByText("父级详情")).toBeVisible();
    expect(screen.getByText("子级")).toBeVisible();
    expect(screen.getByRole("button", { name: "收起父级" }))
      .not.toHaveTextContent("−");
    expect(screen.getByRole("columnheader", { name: "展开操作" })).toHaveClass("qizhi-table__th");
  });

  it("does not render an expand control when expanded content is null", () => {
    render(<Table rowKey="id" columns={columns} dataSource={data} expandable={{ expandedRowRender: () => null }} />);
    expect(screen.queryByRole("button", { name: /展开/ })).not.toBeInTheDocument();
  });

  it("applies cell spans and reorders rows with pointer drag", () => {
    const reordered: number[][] = [];
    const merged: TableColumn<Row>[] = [{ key: "name", title: "姓名", dataIndex: "name", onCell: (row) => row.id === 1 ? { rowSpan: 2 } : { rowSpan: 0 } }, ...columns.slice(1)];
    const { container } = render(<Table rowKey="id" columns={merged} dataSource={data} draggable onRowOrderChange={(rows) => reordered.push(rows.map((row) => row.id))} />);
    expect(screen.getByText("乙").closest("td")).toHaveAttribute("rowspan", "2");
    const rows = container.querySelectorAll("tbody tr[data-row-key]");
    fireEvent.dragStart(rows[0]);
    fireEvent.dragOver(rows[1]);
    fireEvent.drop(rows[1]);
    expect(reordered.at(-1)).toEqual([2, 1]);
  });

  it("reuses Pagination and Empty for composed states", () => {
    const { rerender } = render(<Table rowKey="id" columns={columns} dataSource={data} pagination={{ pageSize: 1, total: 2 }} />);
    expect(screen.getByRole("navigation", { name: "表格分页" })).toBeVisible();
    rerender(<Table rowKey="id" columns={columns} dataSource={[]} />);
    expect(screen.getByRole("status")).toHaveTextContent("暂无数据");
  });
});
