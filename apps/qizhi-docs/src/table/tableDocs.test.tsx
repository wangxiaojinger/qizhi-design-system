import { fireEvent, render, screen, within } from "@testing-library/react";
import { TableDocsIsland } from "./TableDocsIsland";
import { tableApi, tableApiDefaultBehaviors, tableColumnApi } from "./tableApi";
import { tableDemos } from "./tableDocs.registry";

describe("Table docs", () => {
  it("renders the eleven approved demos without unsupported sticky or grouped headers", () => {
    render(<TableDocsIsland />);
    expect(screen.getAllByRole("heading", { level: 2 }).map((node) => node.textContent)).toEqual(["基础用法", "多行与省略", "排序", "固定列", "开启选择", "展开行", "嵌套子表格", "树形数据展示", "表格属性", "单元格合并", "拖拽排序", "API"]);
    expect(document.querySelectorAll("article.codebox-wrapper")).toHaveLength(11);
    expect(screen.queryByRole("heading", { name: "表头吸顶" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "表头分组" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Demo\.tsx|Demo\.css/)).not.toBeInTheDocument();
  });

  it("renders formal Table, Pagination and Empty and copies exact source", () => {
    render(<TableDocsIsland />);
    expect(document.querySelectorAll(".qizhi-table").length).toBeGreaterThanOrEqual(11);
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

  it("keeps the basic demo self-contained and composes formal QIZHI components", () => {
    render(<TableDocsIsland />);
    const basicDemo = document.querySelector<HTMLElement>("#table-basic")!;
    const basicSource = tableDemos.find((demo) => demo.id === "table-basic")!.source;

    expect(basicSource).not.toContain('from "./shared"');
    expect(basicSource).toContain("TableColumn");
    expect(basicSource).toContain("Link");
    expect(basicSource).toContain("Space");
    expect(basicSource).toContain("Tag");
    expect(basicSource).toContain("Tooltip");
    expect(basicDemo.querySelectorAll(".qizhi-tag")).toHaveLength(6);
    expect(
      [...basicDemo.querySelectorAll(".qizhi-tag")].every((tag) =>
        ![...tag.classList].some((className) => className.startsWith("qizhi-tag-gray")),
      ),
    ).toBe(true);
    const overflowTag = within(basicDemo).getByText("+2");
    fireEvent.mouseEnter(overflowTag);
    expect(screen.getByRole("tooltip")).toHaveTextContent("设计系统");
    expect(screen.getByRole("tooltip")).toHaveTextContent("可访问性");
    expect(basicDemo.querySelectorAll(".qizhi-link").length).toBeGreaterThanOrEqual(9);
    expect(basicDemo.querySelector("[aria-live='polite']")).toBeInTheDocument();

    const nameLink = within(basicDemo).getByRole("button", { name: "约翰·布朗" });
    const deleteLink = within(basicDemo).getByRole("button", { name: "删除 约翰·布朗" });
    expect(basicDemo.querySelectorAll(".qizhi-link--hoverless")).toHaveLength(9);
    expect(nameLink).toHaveStyle("--qizhi-link-color: var(--color-text-1)");
    expect(deleteLink).toHaveStyle("--qizhi-link-color: var(--color-text-3)");
    expect(deleteLink).not.toHaveClass("qizhi-link--error");

    fireEvent.click(within(basicDemo).getByRole("button", { name: "邀请 约翰·布朗" }));
    expect(within(basicDemo).getByText("已邀请 约翰·布朗")).toBeInTheDocument();
    fireEvent.click(within(basicDemo).getByRole("button", { name: "删除 约翰·布朗" }));
    expect(within(basicDemo).getAllByRole("row")).toHaveLength(3);
    expect(within(basicDemo).getByText("已删除 约翰·布朗")).toBeInTheDocument();
  });

  it("applies list link and Tag rules to every relevant demo", () => {
    render(<TableDocsIsland />);
    const tableLinks = document.querySelectorAll(".qizhi-table__td .qizhi-link");
    const tableTags = document.querySelectorAll(".qizhi-table__td .qizhi-tag");
    const fixedTable = document.querySelector("#table-fixed .qizhi-table");

    expect(tableLinks).toHaveLength(13);
    expect([...tableLinks].every((link) =>
      link.classList.contains("qizhi-link--hoverless"))).toBe(true);
    expect([...tableTags].every((tag) =>
      ![...tag.classList].some((className) =>
        /^qizhi-tag-(?:red|orangered|orange|gold|lime|green|cyan|blue|qizhiblue|purple|pinkpurple|magenta|gray)$/.test(className),
      ))).toBe(true);
    expect(fixedTable).not.toHaveClass("is-hoverable");
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

    expect(actions).toHaveLength(22);
    expect([...actions].every((node) =>
      node.classList.contains("qizhi-code-action"))).toBe(true);
  });

  it("matches the Button docs spacing around code actions", () => {
    render(<TableDocsIsland />);
    expect(document.querySelectorAll(".table-docs-actions")).toHaveLength(11);
  });

  it("documents only the approved Table v1 API", () => {
    render(<TableDocsIsland />);
    expect(tableApi.map((item) => item.name)).toEqual(["columns", "dataSource", "rowKey", "size", "border", "borderCell", "hover", "stripe", "showHeader", "loading", "scrollX", "rowSelection", "expandable", "childrenColumnName", "pagination", "empty", "draggable", "showSorterTooltip", "onSortChange", "onRowOrderChange"]);
    expect(tableColumnApi.map((item) => item.name)).toEqual(["key", "title", "dataIndex", "width", "fixed", "ellipsis", "render", "sorter", "sortDirections", "defaultSortOrder", "showSorterTooltip", "onCell"]);
    expect(tableColumnApi.find((item) => item.name === "ellipsis")?.defaultValue).toBe("false");
    expect(tableApi.find((item) => item.name === "border")?.defaultValue).toBe("false");
    expect(tableApi.find((item) => item.name === "showSorterTooltip")?.defaultValue).toBe("true");
    expect(tableApiDefaultBehaviors.some((item) => item.includes("Tag 默认中性色"))).toBe(true);
    expect(tableApiDefaultBehaviors.some((item) => item.includes("其余折叠为 +N"))).toBe(true);
    expect(tableApiDefaultBehaviors.some((item) => item.includes("列表行高不随标签数量增加"))).toBe(true);
    expect(screen.getByText(/标签溢出规范/)).toBeInTheDocument();
  });

  it("keeps interactive demo source readable instead of collapsing JSX into one line", () => {
    const propsSource = tableDemos.find((demo) => demo.id === "table-props")!.source;
    const sortSource = tableDemos.find((demo) => demo.id === "table-sort")!.source;
    expect(propsSource).toContain("\n      <Table\n");
    expect(propsSource).toContain("\n        pagination={{ pageSize: 3, position }}\n");
    expect(sortSource).toContain("sortDirections");
    expect(sortSource).not.toContain("defaultSortOrder");
    expect(sortSource).toContain("showSorterTooltip");
    expect(sortSource).toContain("onSortChange");
    expect(sortSource).not.toContain("aria-live");
    expect(sortSource).not.toContain("useState");
  });

  it("keeps every displayed and copied demo source readable", () => {
    const longestLines = tableDemos.map((demo) => ({
      id: demo.id,
      length: Math.max(...demo.source.split("\n").map((line) => line.length)),
    }));

    expect(longestLines.filter((line) => line.length > 100)).toEqual([]);
  });
});
