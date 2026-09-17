import { fireEvent, render, screen } from "@testing-library/react";
import { TableDocsIsland } from "./TableDocsIsland";
import { tableApi } from "./tableApi";
import { tableDemos } from "./tableDocs.registry";

describe("Table docs", () => {
  it("renders the ten approved demos without unsupported sticky or grouped headers", () => {
    render(<TableDocsIsland />);
    expect(screen.getAllByRole("heading", { level: 2 }).map((node) => node.textContent)).toEqual(["基础用法", "排序", "固定列", "开启选择", "展开行", "嵌套子表格", "树形数据展示", "表格属性", "单元格合并", "拖拽排序", "API"]);
    expect(document.querySelectorAll("article.codebox-wrapper")).toHaveLength(10);
    expect(screen.queryByRole("heading", { name: "表头吸顶" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "表头分组" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Demo\.tsx|Demo\.css/)).not.toBeInTheDocument();
  });

  it("renders formal Table, Pagination and Empty and copies exact source", () => {
    render(<TableDocsIsland />);
    expect(document.querySelectorAll(".qizhi-table").length).toBeGreaterThanOrEqual(10);
    expect(document.querySelector(".qizhi-pagination")).toBeInTheDocument();
    expect(screen.getAllByRole("switch").every((node) =>
      node.classList.contains("qizhi-switch"))).toBe(true);
    expect(document.querySelector(".table-demo-switch")).not.toBeInTheDocument();
    expect(screen.getAllByRole("radiogroup")).toHaveLength(3);
    expect(screen.getAllByRole("radio").every((node) =>
      node.classList.contains("qizhi-segmented-item"))).toBe(true);
    fireEvent.click(screen.getByRole("switch", { name: "无数据" }));
    expect(document.querySelector(".qizhi-empty")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "查看代码" })[0]);
    expect(document.querySelector("#table-code-table-basic code")?.textContent).toBe(tableDemos[0].source);
  });

  it("moves the props demo pagination with its segmented control", () => {
    render(<TableDocsIsland />);
    const propsDemo = document.querySelector("#table-props")!;
    const pagination = propsDemo.querySelector<HTMLElement>(".qizhi-pagination")!;

    expect(pagination).toHaveClass("is-bottomRight");
    fireEvent.click(screen.getByRole("radio", { name: "底部居中" }));
    expect(pagination).toHaveClass("is-bottomCenter");
  });

  it("reuses the Button docs action structure", () => {
    render(<TableDocsIsland />);
    const actions = document.querySelectorAll(
      ".component-example-actions .qizhi-btn",
    );

    expect(actions).toHaveLength(20);
    expect([...actions].every((node) =>
      node.classList.contains("qizhi-code-action"))).toBe(true);
  });

  it("matches the Button docs spacing around code actions", () => {
    render(<TableDocsIsland />);
    expect(document.querySelectorAll(".table-docs-actions")).toHaveLength(10);
  });

  it("documents only the approved Table v1 API", () => {
    expect(tableApi.map((item) => item.name)).toEqual(["columns", "dataSource", "rowKey", "size", "border", "borderCell", "hover", "stripe", "showHeader", "loading", "scrollX", "rowSelection", "expandable", "childrenColumnName", "pagination", "empty", "draggable", "onSortChange", "onRowOrderChange"]);
    expect(tableApi.find((item) => item.name === "border")?.defaultValue).toBe("false");
  });

  it("keeps interactive demo source readable instead of collapsing JSX into one line", () => {
    const propsSource = tableDemos.find((demo) => demo.id === "table-props")!.source;
    expect(propsSource).toContain("\n      <Table\n");
    expect(propsSource).toContain("\n        pagination={{ pageSize: 3, position }}\n");
  });

  it("keeps every displayed and copied demo source readable", () => {
    const longestLines = tableDemos.map((demo) => ({
      id: demo.id,
      length: Math.max(...demo.source.split("\n").map((line) => line.length)),
    }));

    expect(longestLines.filter((line) => line.length > 100)).toEqual([]);
  });
});
