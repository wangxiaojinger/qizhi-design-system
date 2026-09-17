import { fireEvent, render, screen } from "@testing-library/react";
import { PaginationDocsIsland } from "./PaginationDocsIsland";
import { paginationApi } from "./paginationApi";
import { paginationDemos } from "./paginationDocs.registry";

describe("Pagination docs", () => {
  it("renders the nine approved demos in legacy order", () => {
    render(<PaginationDocsIsland />);
    expect(screen.getAllByRole("heading", { level: 2 }).map((node) => node.textContent)).toEqual(["基础用法", "更多页码", "改变每页展示条目", "跳转", "尺寸", "简洁", "展示总数", "受控的数据总数", "全部展示", "API"]);
    expect(document.querySelectorAll("article.codebox-wrapper")).toHaveLength(9);
    expect(screen.queryByText(/Demo\.tsx|Demo\.css/)).not.toBeInTheDocument();
  });
  it("uses formal controls and exact raw TSX source", () => {
    render(<PaginationDocsIsland />);
    expect(document.querySelectorAll(".qizhi-select").length).toBeGreaterThan(0);
    expect(document.querySelectorAll(".qizhi-input").length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByRole("button", { name: "查看代码" })[0]);
    expect(document.querySelector("#pagination-code-pagination-basic code")?.textContent).toBe(paginationDemos[0].source);
  });
  it("documents only the approved API", () => {
    expect(paginationApi.map((item) => item.name)).toEqual(["total", "current", "defaultCurrent", "pageSize", "defaultPageSize", "pageSizeOptions", "onChange", "onPageSizeChange", "size", "simple", "showTotal", "showPageSize", "showJumper", "disabled"]);
  });
});
