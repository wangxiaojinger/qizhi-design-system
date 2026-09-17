import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { Button } from "../button/Button";
import { Drawer } from "./Drawer";

function DrawerHarness() {
  const [open, setOpen] = useState(false);
  return <>
    <Button onClick={() => setOpen(true)}>打开抽屉</Button>
    <Drawer
      open={open}
      title="基础信息"
      onClose={() => setOpen(false)}
      footer={<Button onClick={() => setOpen(false)}>取消</Button>}
    >
      <Button>正文操作</Button>
    </Drawer>
  </>;
}

test("renders in a Portal with the default width and locks document scrolling", async () => {
  const user = userEvent.setup();
  render(<DrawerHarness />);
  await user.click(screen.getByRole("button", { name: "打开抽屉" }));
  const dialog = screen.getByRole("dialog", { name: "基础信息" });
  expect(dialog.parentElement).toBe(document.body.lastElementChild);
  expect(dialog).toHaveStyle({ width: "760px" });
  expect(document.body).toHaveStyle({ overflow: "hidden" });
  await waitFor(() => expect(screen.getByRole("button", { name: "关闭抽屉" })).toHaveFocus());
  await user.click(screen.getByRole("button", { name: "取消" }));
  expect(screen.queryByRole("dialog", { name: "基础信息" })).not.toBeInTheDocument();
  expect(document.body.style.overflow).toBe("");
  await waitFor(() => expect(screen.getByRole("button", { name: "打开抽屉" })).toHaveFocus());
});

test("mask, close button, and Escape report close through the public contract", async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();
  const { rerender } = render(<Drawer open title="基础信息" onClose={onClose}>正文</Drawer>);
  await user.click(screen.getByRole("button", { name: "关闭抽屉遮罩" }));
  expect(onClose).toHaveBeenCalledTimes(1);
  await user.click(screen.getByRole("button", { name: "关闭抽屉" }));
  expect(onClose).toHaveBeenCalledTimes(2);
  await user.keyboard("{Escape}");
  expect(onClose).toHaveBeenCalledTimes(3);
  rerender(<Drawer open title="基础信息" onClose={onClose} maskClosable={false} escToClose={false} closable={false}>正文</Drawer>);
  expect(screen.queryByRole("button", { name: "关闭抽屉" })).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "关闭抽屉遮罩" }));
  await user.keyboard("{Escape}");
  expect(onClose).toHaveBeenCalledTimes(3);
});

test("contains Tab focus within the open drawer", async () => {
  const user = userEvent.setup();
  render(<Drawer open title="基础信息" onClose={() => undefined} footer={<Button>确定</Button>}>
    <Button>正文操作</Button>
  </Drawer>);
  const close = screen.getByRole("button", { name: "关闭抽屉" });
  const confirm = screen.getByRole("button", { name: "确定" });
  await waitFor(() => expect(close).toHaveFocus());
  await user.keyboard("{Shift>}{Tab}{/Shift}");
  expect(confirm).toHaveFocus();
  await user.keyboard("{Tab}");
  expect(close).toHaveFocus();
});

test("restores the original trigger after an open drawer rerenders", async () => {
  const trigger = document.createElement("button");
  document.body.append(trigger);
  trigger.focus();
  const { rerender } = render(
    <Drawer open title="基础信息" onClose={() => undefined}>正文</Drawer>,
  );

  rerender(
    <Drawer open title="基础信息" onClose={() => undefined}>更新后的正文</Drawer>,
  );
  rerender(
    <Drawer open={false} title="基础信息" onClose={() => undefined}>正文</Drawer>,
  );

  await waitFor(() => expect(trigger).toHaveFocus());
  trigger.remove();
});
