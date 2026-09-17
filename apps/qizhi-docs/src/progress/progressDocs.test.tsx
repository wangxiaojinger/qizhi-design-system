import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressDocsIsland } from "./ProgressDocsIsland";
import { progressApi } from "./progressApi";
import { progressDemos } from "./progressDocs.registry";

describe("Progress docs", () => {
  it("保留旧站 9 组 Demo 标题、说明和顺序", () => {
    expect(progressDemos.map((demo) => demo.title)).toEqual([
      "基本用法", "进度条状态", "环形进度条", "微型进度条",
      "不同尺寸", "动画效果", "渐变色进度条", "步骤进度条",
      "剩余进度条",
    ]);
    expect(progressDemos.map((demo) => demo.description)).toEqual([
      "简单的进度条。",
      "可以通过设置 status 显示内置状态样式，color 的优先级高于 status。",
      "type = circle 时，将会展示环形进度条。",
      "size = mini 时，将会展示微型进度条。",
      "设置 size 为 small、default、large，可设置小、中、大三种尺寸。",
      "设置 animation = true 时，将会显示动画效果，仅当 type = line 时生效。",
      "color 传入对象时，会作为 linear-gradient 的属性值设置渐变色。",
      "可以通过设置 steps 展示步骤进度条。",
      "可以通过 trailColor 设置剩余进度条的颜色。",
    ]);
  });

  it("Demo 从同一 TSX 读取预览、展示和复制源码", () => {
    progressDemos.forEach((demo) => {
      expect(demo.source).toContain('from "@wangxiaojinger/qizhi-react"');
      expect(demo.source).not.toContain("Demo.tsx");
      expect(demo.source).not.toMatch(/<(button|input|select|textarea|svg)\b/);
      expect(demo.source).not.toContain("style={{");
      expect(Math.max(...demo.source.split("\n").map((line) => line.length)))
        .toBeLessThanOrEqual(80);
    });
    render(<ProgressDocsIsland />);
    expect(screen.getAllByRole("button", { name: "查看代码" })).toHaveLength(9);
    expect(screen.getAllByRole("button", { name: "复制代码" })).toHaveLength(9);
  });

  it("API 元数据只包含已审定的 v1 能力", () => {
    expect(progressApi.map((item) => item.name)).toEqual([
      "percent", "type", "status", "size", "color", "trailColor",
      "animation", "steps", "stepWidth", "strokeWidth", "className",
      "style", "ref",
    ]);
  });

  it("保留微型、紧凑步骤和剩余进度的粗细证据", () => {
    const sourceByTitle = Object.fromEntries(
      progressDemos.map((demo) => [demo.title, demo.source]),
    );
    expect(sourceByTitle["微型进度条"]).toContain("strokeWidth={2}");
    expect(sourceByTitle["微型进度条"]).toContain("strokeWidth={4}");
    expect(sourceByTitle["步骤进度条"]).toContain("strokeWidth={8}");
    expect(sourceByTitle["步骤进度条"]).toContain("stepWidth={16}");
    expect(sourceByTitle["剩余进度条"].match(/strokeWidth=\{4\}/g))
      .toHaveLength(3);
  });
});
