import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { NotificationDocsIsland } from "./NotificationDocsIsland";
import { notificationDemos } from "./notificationDocs.registry";

const titles = ["基础用法", "不同类型的通知", "更新通知内容", "更新延迟",
  "自定义操作按钮", "自定义图标", "Hooks 用法"];

test("locks seven legacy demos and nineteen triggers", () => {
  expect(notificationDemos.map((demo) => demo.title)).toEqual(titles);
  expect(notificationDemos.map((demo) => demo.description)).toEqual([
    "最简单的例子。",
    "通知提醒框有 5 种不同的类型，分别为：info、success、warning、error、normal。",
    "通过指定参数 id，可以更新已经存在的通知提醒框。",
    "更新通知时可以重新设置自动关闭时间。",
    "通过指定 btn 字段，可以添加多个操作按钮。",
    "设置 icon 来自定义图标。",
    "可以通过 useNotification（2.40.0） 创建可以读取 context 的通知提醒框。",
  ]);
  render(<NotificationDocsIsland />);
  expect(screen.getAllByRole("article")).toHaveLength(7);
  expect(screen.getAllByTestId("notification-trigger")).toHaveLength(19);
});

test("uses public QIZHI source and same-source code actions", () => {
  for (const demo of notificationDemos) {
    expect(demo.tsxSource).toContain('from "@wangxiaojinger/qizhi-react"');
    expect(demo.tsxSource).not.toMatch(/<(button|input|select|table)\b/);
    expect(demo.tsxSource).not.toContain("ri-");
    expect(demo.tsxSource).not.toContain("style={{");
    expect(Math.max(...demo.tsxSource.split("\n").map((line) => line.length)))
      .toBeLessThanOrEqual(100);
  }
  render(<NotificationDocsIsland />);
  expect(screen.getByRole("table", { name: "Notification API" })).toBeVisible();
  expect(screen.queryByRole("button", { name: "复制样式" })).not.toBeInTheDocument();
});
