import { render, screen, waitFor } from "@testing-library/react";
import { DividerDocsIsland } from "./DividerDocsIsland";
import { dividerApi } from "./dividerApi";
import { dividerDemos } from "./dividerDocs.registry";

describe("Divider docs", () => {
  it("notifies the document shell after mounting", async () => {
    let readyCount = 0;
    const handleReady = () => { readyCount += 1; };
    window.addEventListener("qizhi:react-island-ready", handleReady);
    render(<DividerDocsIsland />);
    await waitFor(() => expect(readyCount).toBe(1));
    window.removeEventListener("qizhi:react-island-ready", handleReady);
  });

  it("keeps all approved static-site demos in order", () => {
    expect(dividerDemos.map((demo) => demo.id)).toEqual([
      "divider-basic",
      "divider-with-text",
      "divider-vertical",
    ]);
  });

  it("uses raw TSX from the same demo modules shown in previews", () => {
    expect(dividerDemos.every((demo) => demo.source.includes('from "@wangxiaojinger/qizhi-react"'))).toBe(true);
  });

  it("renders the approved demos and an isolated Divider API anchor", () => {
    render(<DividerDocsIsland />);
    expect(screen.getByRole("heading", { name: "分割线 Divider" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "基本用法" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "带有文字的分割线" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "竖直分割线" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Divider API" })).toBeInTheDocument();
    expect(document.querySelectorAll("#divider-API")).toHaveLength(1);
  });

  it("publishes only the approved v1 API names", () => {
    expect(dividerApi.map((item) => item.name)).toEqual([
      "children",
      "type",
      "lineStyle",
      "orientation",
      "className",
      "style",
    ]);
  });
});
