import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DescriptionsDocsIsland } from "./DescriptionsDocsIsland";
import { descriptionsApi, descriptionsItemApi } from "./descriptionsApi";
import { descriptionsDemos } from "./descriptionsDocs.registry";

describe("Descriptions docs", () => {
  it("renders the two approved demos, shared actions and independent API anchor", () => {
    render(<DescriptionsDocsIsland />);

    expect(screen.getAllByRole("heading", { level: 2 }).map((node) => node.textContent)).toEqual([
      "基本用法", "标签文本对齐", "API",
    ]);
    expect(screen.getAllByRole("button", { name: "查看代码" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "复制代码" })).toHaveLength(2);
    expect(document.getElementById("descriptions-API")).toBeInTheDocument();
    expect(screen.queryByText(/Demo\.tsx|Demo\.css/)).not.toBeInTheDocument();
  });

  it("keeps three Descriptions groups, twelve items and the formal Tag", () => {
    render(<DescriptionsDocsIsland />);

    expect(document.querySelectorAll(".qizhi-descriptions")).toHaveLength(3);
    expect(document.querySelectorAll(".qizhi-descriptions__item")).toHaveLength(12);
    expect(screen.getByText("运行中").closest(".qizhi-tag")).toHaveClass("qizhi-tag-green", "qizhi-tag-size-default");
  });

  it("expands the exact raw TSX source without a file title", () => {
    render(<DescriptionsDocsIsland />);
    fireEvent.click(screen.getAllByRole("button", { name: "查看代码" })[0]);

    const code = document.querySelector("#descriptions-code-descriptions-basic code");
    expect(code?.textContent).toBe(descriptionsDemos[0].source);
    expect(screen.queryByText(/BasicDemo\.tsx|Demo\.css/)).not.toBeInTheDocument();
  });

  it("documents only the approved Descriptions and Item API", () => {
    expect(descriptionsApi.map((item) => item.name)).toEqual(["children", "title", "layout", "labelAlign", "className", "style"]);
    expect(descriptionsItemApi.map((item) => item.name)).toEqual(["label", "children", "className", "style"]);
    expect(descriptionsApi.find((item) => item.name === "layout")?.defaultValue).toBe('"horizontal"');
    expect(descriptionsApi.find((item) => item.name === "labelAlign")?.defaultValue).toBe('"left"');
  });
});
