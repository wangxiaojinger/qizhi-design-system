import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { Button, Popover } from "../index";

describe("Popover", () => {
  it("opens by hover and keeps the portal content interactive", async () => {
    const user = userEvent.setup();
    render(<Popover title="标题" content={<button type="button">浮层操作</button>}><Button>悬停提示</Button></Popover>);
    const trigger = screen.getByRole("button", { name: "悬停提示" });
    await user.hover(trigger);
    expect(screen.getByRole("tooltip")).toBeVisible();
    expect(screen.getByText("标题")).toBeVisible();
    await user.unhover(trigger);
    await user.hover(screen.getByRole("button", { name: "浮层操作" }));
    expect(screen.getByRole("tooltip")).toBeVisible();
  });

  it("opens by click, closes outside, and reports visibility", async () => {
    const user = userEvent.setup();
    const changes: boolean[] = [];
    render(<><Popover trigger="click" role="dialog" content="内容" onVisibleChange={(visible) => changes.push(visible)}><Button>点击</Button></Popover><button type="button">外部</button></>);
    const trigger = screen.getByRole("button", { name: "点击" });
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("dialog")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "外部" }));
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(changes).toEqual([true, false]);
  });

  it("opens by focus and closes after focus leaves trigger and popup", async () => {
    const user = userEvent.setup();
    render(<Popover trigger="focus" content={<button type="button">内部</button>}><Button>聚焦</Button></Popover>);
    await user.tab();
    expect(screen.getByRole("button", { name: "聚焦" })).toHaveFocus();
    expect(screen.getByRole("tooltip")).toBeVisible();
    await user.tab();
    expect(screen.getByRole("button", { name: "内部" })).toHaveFocus();
    expect(screen.getByRole("tooltip")).toBeVisible();
    await user.tab();
    await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
  });

  it("opens from context menu and Escape restores trigger focus", async () => {
    const user = userEvent.setup();
    render(<Popover trigger="contextMenu" role="menu" content="右键菜单"><Button>右键</Button></Popover>);
    const trigger = screen.getByRole("button", { name: "右键" });
    fireEvent.contextMenu(trigger);
    expect(screen.getByRole("menu")).toBeVisible();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("supports controlled visibility and preserves the trigger ref and click", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLButtonElement>();
    let clicked = 0;
    const { rerender } = render(<Popover trigger="click" popupVisible={false} content="内容"><Button ref={ref} onClick={() => { clicked += 1; }}>受控</Button></Popover>);
    await user.click(screen.getByRole("button", { name: "受控" }));
    expect(clicked).toBe(1);
    expect(ref.current).toBe(screen.getByRole("button", { name: "受控" }));
    rerender(<Popover trigger="click" popupVisible content="内容"><Button ref={ref}>受控</Button></Popover>);
    expect(screen.getByRole("tooltip")).toBeVisible();
  });

  it("renders every approved position", () => {
    const positions = ["topLeft", "top", "topRight", "bottomLeft", "bottom", "bottomRight", "leftTop", "left", "leftBottom", "rightTop", "right", "rightBottom"] as const;
    render(<>{positions.map((position) => <Popover key={position} position={position} defaultPopupVisible content={position}><Button>{position}</Button></Popover>)}</>);
    positions.forEach((position) => expect(document.querySelector(`[data-popover-position="${position}"]`)).toBeInTheDocument());
  });

  it("mounts the popup in the container resolved from the trigger", async () => {
    const container = document.createElement("div");
    document.body.append(container);

    render(
      <Popover
        defaultPopupVisible
        content="自定义容器"
        getPopupContainer={(trigger) => {
          expect(trigger).toBe(screen.getByRole("button", { name: "容器触发器" }));
          return container;
        }}
      >
        <Button>容器触发器</Button>
      </Popover>,
    );

    await waitFor(() => expect(screen.getByRole("tooltip").parentElement).toBe(container));
  });
});
