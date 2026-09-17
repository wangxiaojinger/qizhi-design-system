import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyDocsIsland } from "./EmptyDocsIsland";
import { emptyApi } from "./emptyApi";
import { emptyDemos } from "./emptyDocs.registry";

describe("Empty docs", () => {
  it("renders only the approved basic demo and independent API anchor", () => {
    render(<EmptyDocsIsland />);
    expect(screen.getAllByRole("heading", { level: 2 }).map((node) => node.textContent)).toEqual(["基本用法", "API"]);
    expect(document.querySelectorAll("article.codebox-wrapper")).toHaveLength(1);
    expect(document.querySelectorAll(".qizhi-empty")).toHaveLength(1);
    expect(document.getElementById("empty-API")).toBeInTheDocument();
    expect(screen.queryByText(/Demo\.tsx|Demo\.css/)).not.toBeInTheDocument();
  });

  it("uses shared actions and exact raw TSX source", () => {
    render(<EmptyDocsIsland />);
    fireEvent.click(screen.getByRole("button", { name: "查看代码" }));
    expect(document.querySelector("#empty-code-empty-basic code")?.textContent).toBe(emptyDemos[0].source);
    expect(screen.getByRole("button", { name: "复制代码" })).toHaveClass("qizhi-btn");
  });

  it("documents only the approved Empty API", () => {
    expect(emptyApi.map((item) => item.name)).toEqual(["description", "className", "style"]);
    expect(emptyApi.find((item) => item.name === "description")?.defaultValue).toBe('"暂无数据"');
  });
});
