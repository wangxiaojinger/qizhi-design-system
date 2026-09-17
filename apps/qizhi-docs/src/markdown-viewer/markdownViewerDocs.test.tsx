import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MarkdownViewerDocsIsland } from "./MarkdownViewerDocsIsland";
import { markdownViewerDemos } from "./markdownViewerDocs.registry";
describe("MarkdownViewer docs", () => {
  it("renders approved demos in order without real embedded HTML", () => {
    const { container } = render(<MarkdownViewerDocsIsland />);
    expect([...container.querySelectorAll(".codebox-wrapper > .qz-description h2, .qizhi-api-section > h2")].map((node) => node.textContent)).toEqual([...markdownViewerDemos.map((demo) => demo.title), "API"]);
    expect(container.querySelector("button[onclick]")).toBeNull();
  });

  it("基础文档通过 QIZHI 多行输入框实时驱动阅读器", async () => {
    const user = userEvent.setup();
    render(<MarkdownViewerDocsIsland />);
    const demo = screen.getByRole("heading", { name: "基础文档" }).closest("article") as HTMLElement;
    const source = within(demo).getByRole("textbox", { name: "基础文档 Markdown 源文" });

    expect(source).toHaveClass("qizhi-textarea__field");
    await user.clear(source);
    await user.type(source, "# 实时标题\n\n新的正文内容");
    expect(within(demo).getByRole("heading", { name: "实时标题" })).toBeInTheDocument();
    expect(demo).toHaveTextContent("新的正文内容");
  });

  it("扩展语法展示可编辑源文和实时渲染结果", () => {
    render(<MarkdownViewerDocsIsland />);
    const demo = screen.getByRole("heading", { name: "扩展语法" }).closest("article") as HTMLElement;

    expect(within(demo).getByRole("textbox", { name: "扩展语法 Markdown 源文" })).toHaveClass("qizhi-textarea__field");
    expect(within(demo).getByRole("region", { name: "扩展语法渲染结果" })).toBeInTheDocument();
    expect(within(demo).getByRole("table")).toBeInTheDocument();
  });
});
