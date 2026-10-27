import { fireEvent, render, screen, within } from "@testing-library/react";
import { TableDocsIsland } from "./TableDocsIsland";
import { tableApi, tableApiDefaultBehaviors, tableColumnApi } from "./tableApi";
import { tableDemos } from "./tableDocs.registry";

describe("Table docs", () => {
  it("centralizes feature controls in the catalog props demo rather than business tooling", () => {
    render(<TableDocsIsland />);
    const props = document.querySelector<HTMLElement>("#table-props")!;
    const business = document.querySelector<HTMLElement>("#table-customization")!;
    for (const label of ["列移动", "列调宽", "列显隐", "列设置入口"]) {
      expect(within(props).getByRole("switch", { name: label })).toBeChecked();
    }
    expect(within(props).queryByRole("switch", { name: "斑马纹" })).toBeNull();
    expect(within(props).getByRole("table")).toHaveTextContent("Qways");
    expect(within(business).queryByRole("switch")).toBeNull();
    expect(within(business).queryByRole("button", { name: /试用/ })).toBeNull();
  });
  it("demonstrates explicit engineering options while retaining the twelve existing demos", () => {
    render(<TableDocsIsland />);
    const enhanced = screen.getByRole("table", { name: "工程规范增强列表" });
    expect(within(enhanced).getByText("0")).toBeInTheDocument();
    expect(within(enhanced).getByText("-")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("switch", { name: "数据区加载" }));
    expect(enhanced.closest(".qizhi-table")).toHaveAttribute("aria-busy", "true");
    expect(within(enhanced).getByRole("columnheader", { name: "名称" })).toBeInTheDocument();
    expect(tableApi.map((item) => item.name)).toEqual(expect.arrayContaining([
      "emptyCell", "emptyPadding", "fixedBreakpoint",
    ]));
    expect(tableColumnApi.map((item) => item.name)).toEqual(expect.arrayContaining([
      "shrink", "shrinkPriority", "growPriority",
    ]));
  });
  it("keeps update-time headers and cells left aligned in every layout demo", () => {
    render(<TableDocsIsland />);
    const tables = document.querySelectorAll("#table-layout table");
    let dateColumns = 0;
    tables.forEach((table) => {
      const headers = [...table.querySelectorAll("thead th")];
      const index = headers.findIndex((header) => header.textContent === "更新时间");
      if (index < 0) return;
      dateColumns += 1;
      expect(headers[index]).toHaveAttribute("data-align", "left");
      table.querySelectorAll("tbody tr").forEach((row) => {
        expect(row.children[index]).toHaveAttribute("data-align", "left");
      });
    });
    expect(dateColumns).toBe(4);
  });

  it("preserves the twelve demos and adds the business column-layout demo", () => {
    render(<TableDocsIsland />);
    expect(screen.getAllByRole("heading", { level: 2 }).map((node) => node.textContent)).toEqual(["基础用法", "多行与省略", "排序", "固定列", "开启选择", "展开行", "嵌套子表格", "树形数据展示", "表格属性", "单元格合并", "拖拽排序", "列宽与自适应", "Qways 模型目录与用户列布局", "API"]);
    expect(document.querySelectorAll("article.codebox-wrapper")).toHaveLength(13);
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
    expect(screen.getAllByRole("radiogroup")).toHaveLength(2);
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

    expect(tableLinks.length).toBeGreaterThanOrEqual(13);
    expect([...tableLinks].every((link) =>
      link.classList.contains("qizhi-link--hoverless"))).toBe(true);
    expect([...tableTags].every((tag) =>
      ![...tag.classList].some((className) =>
        /^qizhi-tag-(?:red|orangered|orange|gold|lime|green|cyan|blue|qizhiblue|purple|pinkpurple|magenta|gray)$/.test(className),
      ))).toBe(true);
    expect(fixedTable).not.toHaveClass("is-hoverable");
  });

  it("keeps props pagination at the bottom right without a position selector", () => {
    render(<TableDocsIsland />);
    const propsDemo = document.querySelector<HTMLElement>("#table-props")!;
    const pagination = propsDemo.querySelector<HTMLElement>(".qizhi-pagination")!;

    expect(pagination).toHaveClass("is-bottomRight");
    expect(within(propsDemo).queryByRole("radiogroup", { name: "分页位置" })).toBeNull();
  });

  it("reuses the Button docs action structure", () => {
    render(<TableDocsIsland />);
    const actions = document.querySelectorAll(
      ".component-example-actions .qizhi-btn",
    );

    expect(actions).toHaveLength(26);
    expect([...actions].every((node) =>
      node.classList.contains("qizhi-code-action"))).toBe(true);
  });

  it("matches the Button docs spacing around code actions", () => {
    render(<TableDocsIsland />);
    expect(document.querySelectorAll(".table-docs-actions")).toHaveLength(13);
  });

  it("documents only the approved Table v1 API", () => {
    render(<TableDocsIsland />);
    expect(tableApi.map((item) => item.name)).toEqual(expect.arrayContaining(["columns", "dataSource", "rowKey", "size", "border", "borderCell", "hover", "stripe", "showHeader", "loading", "scrollX", "rowSelection", "expandable", "childrenColumnName", "pagination", "empty", "draggable", "showSorterTooltip", "onSortChange", "onRowOrderChange", "tableLayout", "layoutMode"]));
    expect(tableColumnApi.map((item) => item.name)).toEqual(expect.arrayContaining(["key", "title", "dataIndex", "width", "fixed", "ellipsis", "render", "sorter", "sortDirections", "defaultSortOrder", "showSorterTooltip", "onCell", "minWidth", "maxWidth", "grow", "align"]));
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
    expect(propsSource).toMatch(/\n\s+<Table\n/);
    expect(propsSource).toContain("pageSize: 3,");
    expect(propsSource).not.toContain('aria-label="分页位置"');
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
