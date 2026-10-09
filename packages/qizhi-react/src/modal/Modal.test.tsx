import { createContext, useContext, useEffect } from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { Button } from "../button/Button";
import { Select } from "../select/Select";
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

test("focuses the primary action when an initially closed modal first opens", async () => {
  const { rerender } = render(<Modal open={false} title="首次打开">正文</Modal>);
  rerender(<Modal open title="首次打开">正文</Modal>);
  await waitFor(() => expect(screen.getByRole("button", { name: "确定" })).toHaveFocus());
});

test("falls back to the first enabled control when the primary action is disabled", async () => {
  render(
    <Modal open title="禁用确定" okButtonProps={{ disabled: true }}>正文</Modal>,
  );
  await waitFor(() => expect(screen.getByRole("button", { name: "关闭对话框" })).toHaveFocus());
});

test("focuses and traps Tab on the dialog when it has no focusable descendants", async () => {
  const user = userEvent.setup();
  render(
    <Modal open title="无可聚焦内容" footer={null} closable={false}>正文</Modal>,
  );
  const dialog = screen.getByRole("dialog", { name: "无可聚焦内容" });
  await waitFor(() => expect(dialog).toHaveFocus());
  await user.tab();
  expect(dialog).toHaveFocus();
  await user.tab({ shift: true });
  expect(dialog).toHaveFocus();
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

test("a rejected onOk keeps the modal open and releases loading", async () => {
  const user = userEvent.setup();
  const onOk = vi.fn(() => Promise.reject(new Error("提交失败")));
  render(<Modal open title="提交失败处理" onOk={onOk}>正文</Modal>);
  const ok = screen.getByRole("button", { name: "确定" });
  await user.click(ok);
  await waitFor(() => expect(ok).not.toBeDisabled());
  expect(screen.getByRole("dialog", { name: "提交失败处理" })).toBeVisible();
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
  expect(dialog).toHaveStyle({ width: "416px" });
  expect(dialog.querySelector(".qizhi-modal__header")).not.toBeInTheDocument();
  expect(dialog.querySelector(".qizhi-modal__confirm-icon")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "提交中..." })).toBeInTheDocument();
  act(() => handle.update({
    title: "提交成功",
    content: "对话框将在 1.5 秒后自动关闭。",
  }));
  expect(screen.getByRole("dialog", { name: "提交成功" })).toBe(dialog);
  act(() => handle.close());
  expect(dialog).toBeInTheDocument();
  fireEvent.animationEnd(dialog);
  expect(dialog).not.toBeInTheDocument();
});

test("Modal.confirm cleans up when closed before its first React commit", async () => {
  const before = document.body.childElementCount;
  const afterClose = vi.fn();
  act(() => {
    const handle = Modal.confirm({ title: "立即关闭", afterClose });
    handle.close();
  });
  await waitFor(() => expect(document.body.childElementCount).toBe(before));
  expect(afterClose).toHaveBeenCalledOnce();
});

test("Modal.confirm still destroys its root when afterClose throws", () => {
  const before = document.body.childElementCount;
  let handle!: ReturnType<typeof Modal.confirm>;
  act(() => {
    handle = Modal.confirm({
      title: "异常回调",
      afterClose: () => { throw new Error("afterClose failed"); },
    });
  });
  const dialog = screen.getByRole("dialog", { name: "异常回调" });
  act(() => handle.close());
  const preventExpectedError = (event: ErrorEvent) => event.preventDefault();
  window.addEventListener("error", preventExpectedError);
  fireEvent.animationEnd(dialog);
  window.removeEventListener("error", preventExpectedError);
  expect(document.body.childElementCount).toBe(before);
});

test("Modal.confirm allows overriding the AntD-compatible default width", () => {
  let handle!: ReturnType<typeof Modal.confirm>;
  act(() => {
    handle = Modal.confirm({ title: "自定义宽度", width: "36rem" });
  });
  const dialog = screen.getByRole("dialog", { name: "自定义宽度" });
  expect(dialog.style.width).toBe("36rem");
  act(() => handle.close());
  fireEvent.animationEnd(dialog);
});

test("Modal.confirm preserves an explicit zero width", () => {
  let handle!: ReturnType<typeof Modal.confirm>;
  act(() => {
    handle = Modal.confirm({ title: "零宽度", width: 0 });
  });
  const dialog = screen.getByRole("dialog", { name: "零宽度" });
  const actualWidth = dialog.style.width;
  act(() => handle.close());
  fireEvent.animationEnd(dialog);
  expect(actualWidth).toBe("0px");
});

test("renders numeric zero as regular and confirm content", () => {
  const regular = render(<Modal open title="普通零值">{0}</Modal>);
  expect(screen.getByRole("dialog", { name: "普通零值" }).querySelector(".qizhi-modal__body"))
    .toHaveTextContent("0");
  regular.unmount();

  let handle!: ReturnType<typeof Modal.confirm>;
  act(() => {
    handle = Modal.confirm({ title: "确认零值", content: 0 });
  });
  const dialog = screen.getByRole("dialog", { name: "确认零值" });
  expect(dialog.querySelector(".qizhi-modal__confirm-content")).toHaveTextContent("0");
  act(() => handle.close());
  fireEvent.animationEnd(dialog);
});

test("Modal.confirm can preserve the legacy no-footer state", () => {
  let handle!: ReturnType<typeof Modal.confirm>;
  act(() => {
    handle = Modal.confirm({ title: "提交中...", content: "状态", footer: null });
  });
  const dialog = screen.getByRole("dialog", { name: "提交中..." });
  expect(dialog.querySelector(".qizhi-modal__footer")).not.toBeInTheDocument();
  act(() => handle.close());
  fireEvent.animationEnd(dialog);
});

test("Modal.confirm renders an optional close button and reports cancellation", async () => {
  const user = userEvent.setup();
  const onCancel = vi.fn();
  let handle!: ReturnType<typeof Modal.confirm>;
  act(() => {
    handle = Modal.confirm({ title: "可关闭确认框", closable: true, onCancel });
  });
  const dialog = screen.getByRole("dialog", { name: "可关闭确认框" });
  await user.click(screen.getByRole("button", { name: "关闭对话框" }));
  expect(onCancel).toHaveBeenCalledOnce();
  fireEvent.animationEnd(dialog);
  expect(dialog).not.toBeInTheDocument();
  act(() => handle.close());
});

test("preserves hidden content by default and destroys it only when requested", async () => {
  const user = userEvent.setup();
  const { rerender } = render(
    <Modal open title="保留状态"><input aria-label="名称" defaultValue="初始值" /></Modal>,
  );
  const input = screen.getByRole("textbox", { name: "名称" }) as HTMLInputElement;
  const dialog = screen.getByRole("dialog", { name: "保留状态" });
  await waitFor(() => expect(screen.getByRole("button", { name: "确定" })).toHaveFocus());
  await user.click(input);
  await user.clear(input);
  await user.type(input, "saved");
  expect(input).toHaveValue("saved");
  rerender(<Modal open={false} title="保留状态"><input aria-label="名称" defaultValue="初始值" /></Modal>);
  fireEvent.animationEnd(dialog);
  expect(document.querySelector(".qizhi-modal__mask")).toHaveAttribute("hidden");
  expect(document.querySelector<HTMLInputElement>('[aria-label="名称"]')?.value).toBe("saved");
  rerender(<Modal open title="保留状态"><input aria-label="名称" defaultValue="初始值" /></Modal>);
  expect(screen.getByRole("textbox", { name: "名称" })).toHaveValue("saved");

  rerender(<Modal open={false} destroyOnHidden title="销毁状态"><input aria-label="销毁名称" /></Modal>);
  const destroyingDialog = document.querySelector<HTMLInputElement>('[aria-label="销毁名称"]')
    ?.closest<HTMLElement>('[role="dialog"]')!;
  fireEvent.animationEnd(destroyingDialog);
  expect(document.querySelector('[aria-label="销毁名称"]')).not.toBeInTheDocument();
});

test("only the topmost modal handles Escape", async () => {
  const user = userEvent.setup();
  const lowerCancel = vi.fn();
  const upperCancel = vi.fn();
  render(<>
    <Modal open title="下层弹窗" onCancel={lowerCancel}>下层</Modal>
    <Modal open title="上层弹窗" onCancel={upperCancel}>上层</Modal>
  </>);
  await user.keyboard("{Escape}");
  expect(upperCancel).toHaveBeenCalledOnce();
  expect(lowerCancel).not.toHaveBeenCalled();
});

test("Escape closes an inner Select without also cancelling its Modal", async () => {
  const onCancel = vi.fn();
  render(
    <Modal open title="编辑用户" onCancel={onCancel}>
      <Select defaultOpen options={[{ label: "女", value: "female" }]} aria-label="性别" />
    </Modal>,
  );
  const select = screen.getByRole("combobox", { name: "性别" });

  fireEvent.keyDown(select, { key: "Escape" });

  expect(select).toHaveAttribute("aria-expanded", "false");
  expect(onCancel).not.toHaveBeenCalled();
  expect(screen.getByRole("dialog", { name: "编辑用户" })).toBeVisible();
});

test("focus trap skips hidden and otherwise non-tabbable descendants", async () => {
  const user = userEvent.setup();
  render(
    <Modal open title="焦点过滤">
      <a href="#hidden" hidden>隐藏链接</a>
      <input type="hidden" />
      <button type="button" style={{ display: "none" }}>样式隐藏</button>
    </Modal>,
  );
  const ok = screen.getByRole("button", { name: "确定" });
  await waitFor(() => expect(ok).toHaveFocus());

  await user.tab();

  expect(screen.getByRole("button", { name: "关闭对话框" })).toHaveFocus();
});

test("keeps the dialog mounted through exit motion and calls afterClose once", () => {
  const afterClose = vi.fn();
  const { rerender } = render(
    <Modal open title="退出动画" afterClose={afterClose}>正文</Modal>,
  );
  const dialog = screen.getByRole("dialog", { name: "退出动画" });
  rerender(<Modal open={false} title="退出动画" afterClose={afterClose}>正文</Modal>);
  expect(dialog).toBeInTheDocument();
  expect(dialog.closest(".qizhi-modal__mask")).toHaveClass("is-leaving");
  expect(afterClose).not.toHaveBeenCalled();
  fireEvent.animationEnd(dialog);
  expect(dialog.closest(".qizhi-modal__mask")).toHaveAttribute("hidden");
  expect(afterClose).toHaveBeenCalledOnce();
  fireEvent.animationEnd(dialog);
  expect(afterClose).toHaveBeenCalledOnce();
});

test("destroyOnHidden removes content only after exit motion completes", () => {
  const { rerender } = render(
    <Modal open destroyOnHidden title="退出后销毁"><input aria-label="延迟销毁" /></Modal>,
  );
  const dialog = screen.getByRole("dialog", { name: "退出后销毁" });
  rerender(
    <Modal open={false} destroyOnHidden title="退出后销毁"><input aria-label="延迟销毁" /></Modal>,
  );
  expect(document.querySelector('[aria-label="延迟销毁"]')).toBeInTheDocument();
  fireEvent.animationEnd(dialog);
  expect(document.querySelector('[aria-label="延迟销毁"]')).not.toBeInTheDocument();
});

test("changing destroyOnHidden after close destroys content without replaying close", () => {
  const afterClose = vi.fn();
  const { rerender } = render(
    <Modal open title="动态销毁" afterClose={afterClose}><input aria-label="保留内容" /></Modal>,
  );
  const dialog = screen.getByRole("dialog", { name: "动态销毁" });
  rerender(
    <Modal open={false} title="动态销毁" afterClose={afterClose}>
      <input aria-label="保留内容" />
    </Modal>,
  );
  fireEvent.animationEnd(dialog);
  expect(afterClose).toHaveBeenCalledOnce();
  expect(document.querySelector(".qizhi-modal__mask")).toHaveAttribute("hidden");

  rerender(
    <Modal open={false} destroyOnHidden title="动态销毁" afterClose={afterClose}>
      <input aria-label="保留内容" />
    </Modal>,
  );
  expect(screen.queryByLabelText("保留内容")).not.toBeInTheDocument();
  expect(afterClose).toHaveBeenCalledOnce();
  expect(document.querySelector(".qizhi-modal__mask")).not.toBeInTheDocument();
});

test("renders into the configured container", () => {
  const container = document.createElement("section");
  document.body.append(container);
  const { unmount } = render(
    <Modal open title="指定容器" getContainer={() => container}>正文</Modal>,
  );
  expect(container).toContainElement(screen.getByRole("dialog", { name: "指定容器" }));
  unmount();
  container.remove();
});

test("supports selector containers and inline rendering", () => {
  const target = document.createElement("section");
  target.id = "modal-target";
  document.body.append(target);
  const selectorRender = render(
    <Modal open title="选择器容器" getContainer="#modal-target">正文</Modal>,
  );
  expect(target).toContainElement(screen.getByRole("dialog", { name: "选择器容器" }));
  selectorRender.unmount();

  const inlineRender = render(
    <Modal open title="原地渲染" getContainer={false}>正文</Modal>,
  );
  expect(inlineRender.container).toContainElement(
    screen.getByRole("dialog", { name: "原地渲染" }),
  );
  inlineRender.unmount();
  target.remove();
});

test("Modal.useModal preserves the holder context", async () => {
  const user = userEvent.setup();
  const Context = createContext("默认上下文");
  function ContextContent() {
    return <span>{useContext(Context)}</span>;
  }
  function Harness() {
    const [modal, holder] = Modal.useModal();
    return <>
      <Button onClick={() => modal.confirm({ title: "上下文确认框", content: <ContextContent /> })}>
        打开上下文确认框
      </Button>
      {holder}
    </>;
  }
  render(
    <Context.Provider value="业务上下文">
      <Harness />
    </Context.Provider>,
  );
  await user.click(screen.getByRole("button", { name: "打开上下文确认框" }));
  expect(screen.getByRole("dialog", { name: "上下文确认框" })).toHaveTextContent("业务上下文");
});

test("Modal.useModal cleans up when closed before the holder commits", async () => {
  const user = userEvent.setup();
  const afterClose = vi.fn();
  function Harness() {
    const [modal, holder] = Modal.useModal();
    return <>
      <Button onClick={() => {
        const handle = modal.confirm({ title: "Hook 立即关闭", afterClose });
        handle.close();
      }}>
        创建并关闭
      </Button>
      {holder}
    </>;
  }
  render(<Harness />);
  await user.click(screen.getByRole("button", { name: "创建并关闭" }));
  expect(screen.queryByRole("dialog", { name: "Hook 立即关闭" })).not.toBeInTheDocument();
  expect(afterClose).toHaveBeenCalledOnce();
});

test("Modal.useModal removes its entry when afterClose throws", async () => {
  const user = userEvent.setup();
  const unmounted = vi.fn();
  let handle!: ReturnType<ReturnType<typeof Modal.useModal>[0]["confirm"]>;
  function TrackedContent() {
    useEffect(() => () => unmounted(), []);
    return <>正文</>;
  }
  function Harness() {
    const [modal, holder] = Modal.useModal();
    return <>
      <Button onClick={() => {
        handle = modal.confirm({
          title: "Hook 异常回调",
          content: <TrackedContent />,
          afterClose: () => { throw new Error("hook afterClose failed"); },
        });
      }}>
        打开 Hook 异常回调
      </Button>
      {holder}
    </>;
  }
  render(<Harness />);
  await user.click(screen.getByRole("button", { name: "打开 Hook 异常回调" }));
  const dialog = screen.getByRole("dialog", { name: "Hook 异常回调" });
  act(() => handle.close());
  const preventExpectedError = (event: ErrorEvent) => event.preventDefault();
  window.addEventListener("error", preventExpectedError);
  fireEvent.animationEnd(dialog);
  window.removeEventListener("error", preventExpectedError);
  expect(unmounted).toHaveBeenCalledOnce();
});

test("Modal.useModal preserves an explicit zero width", async () => {
  const user = userEvent.setup();
  let handle!: ReturnType<ReturnType<typeof Modal.useModal>[0]["confirm"]>;
  function Harness() {
    const [modal, holder] = Modal.useModal();
    return <>
      <Button onClick={() => { handle = modal.confirm({ title: "Hook 零宽度", width: 0 }); }}>
        打开 Hook 零宽度
      </Button>
      {holder}
    </>;
  }
  render(<Harness />);
  await user.click(screen.getByRole("button", { name: "打开 Hook 零宽度" }));
  const dialog = screen.getByRole("dialog", { name: "Hook 零宽度" });
  const actualWidth = dialog.style.width;
  act(() => handle.close());
  fireEvent.animationEnd(dialog);
  expect(actualWidth).toBe("0px");
});
