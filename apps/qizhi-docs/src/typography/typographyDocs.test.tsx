import { render, screen, waitFor } from "@testing-library/react";
import { TypographyDocsIsland } from "./TypographyDocsIsland";
import { typographyApi } from "./typographyApi";
import { typographyDemos } from "./typographyDocs.registry";

describe("Typography docs", () => {
  it("notifies the document shell to rebuild the table of contents after mounting", async () => {
    let readyCount = 0;
    const handleReady = () => { readyCount += 1; };
    window.addEventListener("qizhi:react-island-ready", handleReady);

    render(<TypographyDocsIsland />);

    await waitFor(() => expect(readyCount).toBe(1));
    window.removeEventListener("qizhi:react-island-ready", handleReady);
  });

  it("keeps the approved demo order", () => {
    expect(typographyDemos.map((demo) => demo.id)).toEqual(["组合使用", "标题", "文本", "段落", "超出省略"]);
  });

  it("uses raw TSX from the same demo modules shown in previews", () => {
    expect(typographyDemos.every((demo) => demo.source.includes('from "@wangxiaojinger/qizhi-react"'))).toBe(true);
  });

  it("renders the approved sections and grouped API tables", () => {
    render(<TypographyDocsIsland />);
    expect(screen.getByRole("heading", { name: "排版 Typography" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "组合使用" })).toBeInTheDocument();
    expect(screen.getAllByText("Architectural blueprints", { selector: "li" })).toHaveLength(3);
    expect(screen.getByText("A design is a plan or specification for the construction of an object or system.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "API" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Typography API" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Typography.Title API" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Typography.Text API" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Typography.Paragraph API" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "超出省略" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Typography.Ellipsis API" })).toBeInTheDocument();
  });

  it("publishes only approved v1 API names", () => {
    const names = typographyApi.flatMap((group) => group.items.map((item) => item.name));
    expect(names).toContain("heading");
    expect(names).toContain("spacing");
    expect(names).toContain("blockquote");
    expect(names).not.toContain("copyable");
    expect(names).not.toContain("editable");
    const ellipsisGroup = typographyApi.find((group) => group.title === "Typography.Ellipsis");
    expect(ellipsisGroup?.items.map((item) => item.name)).toEqual([
      "rows", "disabled", "expandable", "defaultExpanded", "expanded", "className", "style", "onEllipsis", "onExpand",
    ]);
    for (const group of typographyApi.filter((item) => item.title !== "Typography.Ellipsis")) {
      expect(group.items.map((item) => item.name)).not.toContain("ellipsis");
    }
  });
});
