import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { descriptionsDemos } from "./descriptionsDocs.registry";

describe("Descriptions docs registry", () => {
  it("keeps the two approved legacy demos in order with exact copy", () => {
    expect(descriptionsDemos.map(({ id, title, description }) => ({ id, title, description }))).toEqual([
      {
        id: "descriptions-basic",
        title: "基本用法",
        description: "简单地成组展示多个只读字段，一般用于详情页的信息。",
      },
      {
        id: "descriptions-label-align",
        title: "标签文本对齐",
        description: "标签文本可以设置左对齐右对齐，也可以设置垂直的排列方式。",
      },
    ]);
  });

  it("renders three formal Descriptions groups, twelve items and the existing green Tag", () => {
    descriptionsDemos.forEach(({ component: Demo }) => render(<Demo />));

    expect(document.querySelectorAll(".qizhi-descriptions")).toHaveLength(3);
    expect(document.querySelectorAll(".qizhi-descriptions__item")).toHaveLength(12);
    expect(screen.getByText("运行中").closest(".qizhi-tag")).toHaveClass("qizhi-tag-green", "qizhi-tag-size-default");
    expect(screen.getByText("运行中").closest(".qizhi-tag")).not.toHaveAttribute("style");
  });

  it("uses each demo file as the preview and copy source", () => {
    descriptionsDemos.forEach(({ source }) => {
      expect(source).toContain('from "@wangxiaojinger/qizhi-react"');
      expect(source).toContain("Descriptions.Item");
      expect(source).not.toMatch(/Demo\.tsx|Demo\.css|arco-|ri-/i);
    });
    expect(descriptionsDemos[0].source).toContain("<Tag color=\"green\">运行中</Tag>");
    expect(descriptionsDemos[0].source).not.toMatch(/descriptions-demo__status|style=|className=/);
  });
});
