import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { Button } from "../button/Button";
import { Notification, useNotification } from "./Notification";

afterEach(() => {
  Notification.clear();
  vi.useRealTimers();
});

test("renders five public types with title, content and close controls", () => {
  Notification.info({ title: "信息通知", content: "这里是一条信息通知。" });
  Notification.success({ title: "操作成功", content: "你的操作已经成功完成。" });
  Notification.warning({ title: "风险提示", content: "请检查当前配置后再继续。" });
  Notification.error({ title: "操作失败", content: "操作未完成，请稍后重试。" });
  Notification.normal({ title: "普通通知", content: "这里是一条普通通知。" });
  expect(screen.getAllByRole("status")).toHaveLength(4);
  expect(screen.getByRole("alert")).toHaveTextContent("操作失败");
  expect(screen.getAllByRole("button", { name: "关闭通知" })).toHaveLength(5);
});

test("exposes the closable state used by every notification stylesheet", () => {
  act(() => {
    Notification.info({ id: "closable", title: "可关闭", duration: 0 });
    Notification.info({ id: "fixed", title: "不可关闭", duration: 0,
      closable: false });
  });
  expect(screen.getByText("可关闭").closest(".qizhi-notification"))
    .toHaveClass("is-closable");
  expect(screen.getByText("不可关闭").closest(".qizhi-notification"))
    .not.toHaveClass("is-closable");
});

test("same id updates the same node and restarts duration", () => {
  vi.useFakeTimers();
  Notification.info({ id: "progress", title: "准备更新", duration: 0 });
  const node = screen.getByRole("status");
  Notification.success({ id: "progress", title: "更新成功", duration: 3000 });
  expect(screen.getByRole("status")).toBe(node);
  expect(node).toHaveTextContent("更新成功");
  act(() => vi.advanceTimersByTime(2999));
  expect(node).toBeInTheDocument();
  act(() => vi.advanceTimersByTime(200));
  expect(node).not.toBeInTheDocument();
});

test("remove, clear, maxCount, actions and onClose affect real notices", async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();
  act(() => {
    Notification.config({ maxCount: 2 });
    Notification.info({ id: "one", title: "一", duration: 0, onClose });
    Notification.info({ id: "two", title: "二", duration: 0 });
    Notification.info({ id: "three", title: "三", duration: 0,
      btn: <Button>好的</Button> });
  });
  expect(screen.queryByText("一")).not.toBeInTheDocument();
  expect(onClose).toHaveBeenCalledOnce();
  await user.click(screen.getByRole("button", { name: "好的" }));
  await waitFor(() => expect(screen.queryByText("三")).not.toBeInTheDocument());
  act(() => Notification.remove("two"));
  expect(screen.queryByText("二")).not.toBeInTheDocument();
});

function HookExample() {
  const [notification, holder] = useNotification();
  return <>{holder}<Button onClick={() => notification.info({
    title: "个人资料", content: "当前用户：启智用户", duration: 0,
  })}>信息</Button></>;
}

test("hook renders through its context holder", async () => {
  const user = userEvent.setup();
  render(<HookExample />);
  await user.click(screen.getByRole("button", { name: "信息" }));
  expect(screen.getByRole("status")).toHaveTextContent("当前用户：启智用户");
  expect(screen.getByRole("status").parentElement).toHaveClass("qizhi-notification-context-layer");
});
