import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { Button } from "../button/Button";
import { Modal } from "./Modal";

test("renders public actions and reports cancel and confirm", async () => {
  const user = userEvent.setup();
  const onCancel = vi.fn();
  const onOk = vi.fn();
  render(<Modal open title="beforeUpload" onCancel={onCancel} onOk={onOk}>
    确认上传 ice.png
  </Modal>);
  expect(screen.getByRole("dialog", { name: "beforeUpload" })).toBeVisible();
  await user.click(screen.getByRole("button", { name: "取消" }));
  await user.click(screen.getByRole("button", { name: "确定" }));
  expect(onCancel).toHaveBeenCalledOnce();
  expect(onOk).toHaveBeenCalledOnce();
});

test("Escape closes and restores the trigger focus", async () => {
  const user = userEvent.setup();
  const onCancel = vi.fn();
  const { rerender } = render(<button type="button">打开</button>);
  const trigger = screen.getByRole("button", { name: "打开" });
  trigger.focus();
  rerender(<><button type="button">打开</button><Modal open title="裁剪图片" onCancel={onCancel} /></>);
  await waitFor(() => expect(screen.getByRole("button", { name: "确定" })).toHaveFocus());
  await user.keyboard("{Escape}");
  expect(onCancel).toHaveBeenCalledOnce();
  rerender(<button type="button">打开</button>);
  await waitFor(() => expect(screen.getByRole("button", { name: "打开" })).toHaveFocus());
});

test("renders the legacy structure and default 520px geometry", async () => {
  const user = userEvent.setup();
  const onCancel = vi.fn();
  render(<Modal open title="对话框标题" onCancel={onCancel} onOk={() => undefined}>
    正文
  </Modal>);
  const dialog = screen.getByRole("dialog", { name: "对话框标题" });
  expect(dialog).toHaveStyle({ width: "520px" });
  expect(dialog.querySelector(".qizhi-modal__header")).toBeInTheDocument();
  expect(dialog.querySelector(".qizhi-modal__footer")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "关闭对话框" }));
  expect(onCancel).toHaveBeenCalledOnce();
});

test("supports custom and hidden footer without inventing actions", () => {
  const { rerender } = render(
    <Modal open title="自定义" footer={<Button>提交</Button>}>正文</Modal>,
  );
  expect(screen.getByRole("button", { name: "提交" })).toBeVisible();
  expect(screen.queryByRole("button", { name: "确定" })).not.toBeInTheDocument();
  rerender(<Modal open title="无页脚" footer={null}>正文</Modal>);
  expect(screen.queryByText("确定")).not.toBeInTheDocument();
  expect(screen.getByRole("dialog", { name: "无页脚" }).querySelector(".qizhi-modal__footer"))
    .not.toBeInTheDocument();
});

test("applies bodyClassName to the public body region", () => {
  render(<Modal open title="正文样式" bodyClassName="custom-modal-body">正文</Modal>);
  expect(screen.getByRole("dialog", { name: "正文样式" }).querySelector(".qizhi-modal__body"))
    .toHaveClass("custom-modal-body");
});

test("a promised onOk exposes loading and ignores duplicate submission", async () => {
  const user = userEvent.setup();
  let resolve!: () => void;
  const onOk = vi.fn(() => new Promise<void>((done) => { resolve = done; }));
  render(<Modal open title="异步关闭" onOk={onOk}>正文</Modal>);
  const ok = screen.getByRole("button", { name: "确定" });
  await user.click(ok);
  expect(ok).toBeDisabled();
  expect(ok).toHaveAttribute("aria-busy", "true");
  await user.click(ok);
  expect(onOk).toHaveBeenCalledOnce();
  await act(async () => { resolve(); });
  expect(ok).not.toBeDisabled();
});

test("respects maskClosable and escToExit", async () => {
  const user = userEvent.setup();
  const onCancel = vi.fn();
  render(
    <Modal open title="受控关闭" maskClosable={false} escToExit={false} onCancel={onCancel}>
      正文
    </Modal>,
  );
  await user.click(document.querySelector<HTMLElement>(".qizhi-modal__mask")!);
  await user.keyboard("{Escape}");
  expect(onCancel).not.toHaveBeenCalled();
});

test("Modal.confirm updates the same dialog and closes imperatively", async () => {
  let handle!: ReturnType<typeof Modal.confirm>;
  act(() => {
    handle = Modal.confirm({
      title: "提交中...",
      content: "对话框将在 1.5 秒后更新为成功状态。",
    });
  });
  const dialog = screen.getByRole("dialog", { name: "提交中..." });
  act(() => handle.update({
    title: "提交成功",
    content: "对话框将在 1.5 秒后自动关闭。",
  }));
  expect(screen.getByRole("dialog", { name: "提交成功" })).toBe(dialog);
  act(() => handle.close());
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("Modal.confirm can preserve the legacy no-footer state", () => {
  let handle!: ReturnType<typeof Modal.confirm>;
  act(() => {
    handle = Modal.confirm({ title: "提交中...", content: "状态", footer: null });
  });
  const dialog = screen.getByRole("dialog", { name: "提交中..." });
  expect(dialog.querySelector(".qizhi-modal__footer")).not.toBeInTheDocument();
  act(() => handle.close());
});
