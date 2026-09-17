import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as QizhiReact from "../index";
import { MarkdownViewer } from "./MarkdownViewer";

describe("MarkdownViewer", () => {
  it("renders headings, GFM tables, tasks and fenced code", () => {
    render(
      <MarkdownViewer
        value={'# Skill\n\n- [x] 完成\n\n| 名称 | 状态 |\n| --- | --- |\n| QIZHI | 可用 |\n\n```ts\nconst ready = true;\n```'}
      />,
    );

    expect(screen.getByRole("heading", { name: "Skill" })).toBeInTheDocument();
    expect(screen.getByRole("table")).toHaveTextContent("QIZHI");
    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(screen.getByLabelText("Markdown 代码块")).toHaveTextContent("ready");
  });

  it("shows embedded HTML as text without creating the element", () => {
    const { container } = render(
      <MarkdownViewer value={'<button onclick="alert(1)">危险</button>'} />,
    );

    expect(container.querySelector("button")).toBeNull();
    expect(screen.getByText(/<button onclick="alert\(1\)">危险<\/button>/)).toBeInTheDocument();
  });

  it("secures links opened in a new tab", () => {
    render(
      <MarkdownViewer
        value="[QIZHI](https://example.com)"
        openLinksInNewTab
      />,
    );

    expect(screen.getByRole("link", { name: "QIZHI" })).toHaveAttribute(
      "rel",
      "noreferrer noopener",
    );
  });

  it("renders loading and empty states", () => {
    const { rerender } = render(<MarkdownViewer value="" loading />);
    expect(screen.getByLabelText("正在加载 Markdown")).toBeInTheDocument();

    rerender(<MarkdownViewer value="" emptyText="暂无文档" />);
    expect(screen.getByText("暂无文档")).toBeInTheDocument();
  });

  it("exports MarkdownViewer from the package root", () => {
    expect(QizhiReact.MarkdownViewer).toBe(MarkdownViewer);
  });
});
