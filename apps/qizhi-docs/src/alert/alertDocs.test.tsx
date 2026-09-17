import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { AlertDocsIsland } from "./AlertDocsIsland";
import { alertDemos } from "./alertDocs.registry";

const titles = [
  "基本用法",
  "不同尺寸",
  "不同类型",
  "紧凑型 Inline Alert（行内警告提示）",
  "可关闭",
  "自定义关闭元素",
  "含有标题",
  "不含图标",
  "顶部公告",
];

test("locks nine legacy Alert demos and API metadata", () => {
  expect(alertDemos.map((demo) => demo.title)).toEqual(titles);
  render(<AlertDocsIsland />);
  expect(screen.getAllByRole("article")).toHaveLength(9);
  expect(screen.getByRole("table", { name: "Alert API" })).toBeVisible();
});

test("uses public QIZHI components and same-source code actions", () => {
  for (const demo of alertDemos) {
    expect(demo.tsxSource).toContain('from "@wangxiaojinger/qizhi-react"');
    expect(demo.tsxSource).not.toMatch(/<(button|input|select|textarea|svg)\b/);
    expect(demo.tsxSource).not.toContain("ri-");
    expect(demo.tsxSource).not.toContain("style={{");
    expect(Math.max(...demo.tsxSource.split("\n").map((line) => line.length)))
      .toBeLessThanOrEqual(100);
  }
  render(<AlertDocsIsland />);
  expect(screen.queryByRole("button", { name: "复制样式" })).not.toBeInTheDocument();
});
