import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { Button, HappyFilledIcon, Popconfirm } from "../index";

describe("Popconfirm", () => {
  it("renders the default warning icon at the semantic solid color", () => {
    render(
      <Popconfirm title="确认删除" defaultPopupVisible>
        <Button>删除</Button>
      </Popconfirm>,
    );
    expect(document.querySelector(".qizhi-popconfirm__default-icon"))
      .toBeInTheDocument();
  });

  it("opens on click with alertdialog semantics and focuses cancel", async () => {
    const user = userEvent.setup();
    render(
      <Popconfirm title="确认删除" content="确定要删除这条内容吗？">
        <Button>删除</Button>
      </Popconfirm>,
    );

    const trigger = screen.getByRole("button", { name: "删除" });
    await user.click(trigger);

    const popup = screen.getByRole("alertdialog");
    expect(popup).toHaveAccessibleName("确认删除");
    expect(popup).toHaveAccessibleDescription("确定要删除这条内容吗？");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "取消" })).toHaveFocus();
    });
  });

  it("closes through cancel, confirm, Escape, and outside click", async () => {
    const user = userEvent.setup();
    const events: string[] = [];
    render(
      <>
        <Popconfirm
          title="放弃更改"
          content="确定要放弃当前未保存的更改吗？"
          cancelText="保留"
          okText="放弃"
          onCancel={() => { events.push("cancel"); }}
          onOk={() => { events.push("ok"); }}
        >
          <Button>放弃</Button>
        </Popconfirm>
        <Button>外部</Button>
      </>,
    );

    const trigger = screen.getByRole("button", { name: "放弃" });
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "保留" }));
    expect(events).toEqual(["cancel"]);
    expect(trigger).toHaveFocus();

    await user.click(trigger);
    await user.click(
      screen.getByRole("alertdialog").querySelectorAll("button")[1],
    );
    expect(events).toEqual(["cancel", "ok"]);
    expect(trigger).toHaveFocus();

    await user.click(trigger);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();

    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "外部" }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("locks every close path until an async confirmation resolves", async () => {
    const user = userEvent.setup();
    let resolve: (() => void) | undefined;
    const pending = new Promise<void>((done) => { resolve = done; });
    render(
      <>
        <Popconfirm title="确认删除" content="确定要删除这条内容吗？" onOk={() => pending}>
          <Button>异步关闭</Button>
        </Popconfirm>
        <Button>外部</Button>
      </>,
    );

    await user.click(screen.getByRole("button", { name: "异步关闭" }));
    await user.click(screen.getByRole("button", { name: "确定" }));
    expect(screen.getByRole("button", { name: "处理中" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "取消" })).toBeDisabled();

    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: "外部" }));
    expect(screen.getByRole("alertdialog")).toBeVisible();

    await act(async () => { resolve?.(); await pending; });
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "异步关闭" })).toHaveFocus();
  });

  it("supports custom and hidden icons without replacing public controls", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <Popconfirm title="确认删除" content="内容" icon={<HappyFilledIcon data-testid="happy-icon" />}>
        <Button>自定义图标</Button>
      </Popconfirm>,
    );
    await user.click(screen.getByRole("button", { name: "自定义图标" }));
    expect(screen.getByTestId("happy-icon")).toBeInTheDocument();
    expect(document.querySelectorAll(".qizhi-popconfirm__actions .qizhi-btn")).toHaveLength(2);

    rerender(
      <Popconfirm title="确认删除" content="内容" icon={null} defaultPopupVisible>
        <Button>无图标</Button>
      </Popconfirm>,
    );
    expect(document.querySelector(".qizhi-popconfirm__icon")).not.toBeInTheDocument();
  });

  it("supports controlled visibility, disabled triggers, positions, refs, and containers", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLButtonElement>();
    const container = document.createElement("div");
    document.body.append(container);
    const changes: boolean[] = [];
    const { rerender } = render(
      <Popconfirm
        title="标题"
        content="内容"
        popupVisible={false}
        position="bottomRight"
        getPopupContainer={() => container}
        onVisibleChange={(visible) => changes.push(visible)}
      >
        <Button ref={ref}>受控</Button>
      </Popconfirm>,
    );
    await user.click(screen.getByRole("button", { name: "受控" }));
    expect(changes).toEqual([true]);
    expect(ref.current).toBe(screen.getByRole("button", { name: "受控" }));

    rerender(
      <Popconfirm title="标题" content="内容" popupVisible position="bottomRight" getPopupContainer={() => container}>
        <Button ref={ref}>受控</Button>
      </Popconfirm>,
    );
    const popup = screen.getByRole("alertdialog");
    expect(popup.parentElement).toBe(container);
    expect(popup).toHaveAttribute("data-popconfirm-position", "bottomRight");

    rerender(
      <Popconfirm title="标题" content="内容" disabled>
        <Button>禁用触发</Button>
      </Popconfirm>,
    );
    await user.click(screen.getByRole("button", { name: "禁用触发" }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
});
