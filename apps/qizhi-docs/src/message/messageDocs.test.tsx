import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { Message } from "@wangxiaojinger/qizhi-react";
import { MessageDocsIsland } from "./MessageDocsIsland";
import { messageDemos } from "./messageDocs.registry";

const titles = [
  "基础用法",
  "不同类型",
  "自定义图标",
  "更新全局提醒内容",
  "手动控制关闭",
  "显示关闭按钮",
  "Hooks 用法",
];

describe("Message legacy contract", () => {
  test("keeps all seven demos in exact order with original copy", () => {
    expect(messageDemos.map((demo) => demo.title)).toEqual(titles);
    expect(messageDemos[0].descriptionText).toBe("最简单的例子。");
    expect(messageDemos[1].descriptionText).toBe("全局提示有 5 种不同的类型，分别为：info、success、warning、error、normal。");
    expect(messageDemos[4].descriptionText).toBe("Message.xxx() 会返回一个函数，调用此函数能手动关闭通知。");
    expect(messageDemos[6].descriptionText).toContain("useMessage（2.40.0）");
    expect(messageDemos[6].descriptionText).toContain("无法通过 getContainer() 修改容器。");
  });

  test("keeps formatted demo TSX as the runtime, display, and copy source", () => {
    for (const demo of messageDemos) {
      expect(demo.tsxSource).toContain('from "@wangxiaojinger/qizhi-react"');
      expect(demo.tsxSource).not.toMatch(/<(button|input|select|textarea)\b/);
      expect(demo.tsxSource).not.toContain("ri-");
      expect(demo.tsxSource).not.toContain("style={{");
    }
  });

  test("renders the complete shared codebox and approved API metadata", () => {
    render(<MessageDocsIsland />);
    expect(screen.getAllByRole("article")).toHaveLength(7);
    expect(screen.getAllByRole("button", { name: "查看代码" })).toHaveLength(7);
    expect(screen.getAllByRole("button", { name: "复制代码" })).toHaveLength(7);
    expect(screen.queryByRole("button", { name: "复制样式" })).not.toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Message API" })).toBeVisible();
    expect(screen.getByRole("table", { name: "Message.config API" })).toBeVisible();
  });

  test("runs the basic, closable, update, manual close, and hook demos", () => {
    vi.useFakeTimers();
    render(<MessageDocsIsland />);
    fireEvent.click(within(document.getElementById("全局提示-基础用法")!).getByRole("button", { name: "Open Message" }));
    expect(screen.getByText("This is an info message!")).toBeInTheDocument();
    Message.clear();
    vi.advanceTimersByTime(180);

    const closable = document.getElementById("全局提示-显示关闭按钮")!;
    fireEvent.click(within(closable).getByRole("button", { name: "Open Message" }));
    expect(screen.getByRole("button", { name: "关闭全局提示" })).toBeInTheDocument();

    fireEvent.click(within(document.getElementById("全局提示-更新全局提醒内容")!).getByRole("button", { name: "Update message" }));
    expect(screen.getByText("Will update after 2 seconds...")).toBeInTheDocument();
    vi.advanceTimersByTime(2000);
    expect(screen.getByText("Update success!")).toBeInTheDocument();

    fireEvent.click(within(document.getElementById("全局提示-hooks-用法")!).getByRole("button", { name: "Success" }));
    const local = screen.getByText("Current user: PJY").closest<HTMLElement>("[role=status]")!;
    expect(document.querySelector(".qizhi-message-context-holder")).toContainElement(local);
    Message.clear();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });
});
