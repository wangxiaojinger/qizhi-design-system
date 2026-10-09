import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, vi } from "vitest";
import { Button, Popover } from "../index";
import type { PopoverHandle } from "./Popover.types";

describe("Popover", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("uses dialog semantics and labels the popup from its title by default", async () => {
    const user = userEvent.setup();
    render(
      <Popover title="语义标题" content="语义内容">
        <Button>语义触发</Button>
      </Popover>,
    );

    await user.hover(screen.getByRole("button", { name: "语义触发" }));
    const popup = screen.getByRole("dialog", { name: "语义标题" });
    expect(popup).toBeVisible();
    expect(screen.getByRole("button", { name: "语义触发" }))
      .toHaveAttribute("aria-haspopup", "dialog");
  });

  it("supports combined hover and focus triggers", async () => {
    const user = userEvent.setup();
    render(
      <Popover trigger={["hover", "focus"]} content="组合触发">
        <Button>组合入口</Button>
      </Popover>,
    );
    const trigger = screen.getByRole("button", { name: "组合入口" });

    await user.hover(trigger);
    expect(screen.getByRole("dialog")).toBeVisible();
    await user.unhover(trigger);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    fireEvent.focus(trigger);
    expect(screen.getByRole("dialog")).toBeVisible();
    await user.hover(trigger);
    await user.unhover(trigger);
    await new Promise((resolve) => window.setTimeout(resolve, 100));
    expect(screen.getByRole("dialog")).toBeVisible();
  });

  it("moves Tab from an open dialog trigger into its first interactive control", async () => {
    const user = userEvent.setup();
    render(<>
      <Popover trigger="click" content={<button type="button">复制</button>}>
        <Button>复制账号</Button>
      </Popover>
      <Button>页面后续操作</Button>
    </>);
    const trigger = screen.getByRole("button", { name: "复制账号" });
    await user.click(trigger);

    await user.tab();

    expect(screen.getByRole("button", { name: "复制" })).toHaveFocus();
  });

  it("uses configurable enter and leave delays", () => {
    vi.useFakeTimers();
    render(
      <Popover
        content="延迟内容"
        mouseEnterDelay={0.12}
        mouseLeaveDelay={0.24}
      >
        <Button>延迟触发</Button>
      </Popover>,
    );
    const trigger = screen.getByRole("button", { name: "延迟触发" });

    fireEvent.mouseEnter(trigger);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(120));
    expect(screen.getByRole("dialog")).toBeVisible();
    fireEvent.mouseLeave(trigger);
    act(() => vi.advanceTimersByTime(239));
    expect(screen.getByRole("dialog")).toBeVisible();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not open for empty content but preserves numeric zero", () => {
    const { rerender } = render(
      <Popover content=""><Button>空内容</Button></Popover>,
    );
    fireEvent.mouseEnter(screen.getByRole("button", { name: "空内容" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    rerender(<Popover content={0}><Button>数字内容</Button></Popover>);
    fireEvent.mouseEnter(screen.getByRole("button", { name: "数字内容" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("0");
  });

  it("supports arrow visibility, z-index, and semantic classes and styles", () => {
    render(
      <Popover
        content="自定义"
        defaultPopupVisible
        arrow={false}
        zIndex={1400}
        classNames={{ root: "custom-root", content: "custom-content" }}
        styles={{
          root: { marginLeft: 3 },
          content: { color: "rgb(255, 0, 0)" },
        }}
      >
        <Button>自定义触发</Button>
      </Popover>,
    );
    const popup = screen.getByRole("dialog");

    expect(popup).toHaveClass("custom-root");
    expect(popup).toHaveStyle({ zIndex: 1400, marginLeft: 3 });
    expect(popup.querySelector(".custom-content")).toHaveStyle({
      color: "rgb(255, 0, 0)",
    });
    expect(popup.querySelector(".qizhi-popover__arrow")).toBeNull();
  });

  it("applies the dark variant while keeping interactive content inheritable", () => {
    render(
      <Popover
        variant="dark"
        defaultPopupVisible
        ariaLabel="复制信息"
        content={<button className="copy-action" type="button">复制</button>}
      >
        <Button>深色气泡</Button>
      </Popover>,
    );

    const popup = screen.getByRole("dialog", { name: "复制信息" });
    expect(popup).toHaveClass("qizhi-popover--dark");
    expect(popup.querySelector(".qizhi-popover__content"))
      .toHaveAttribute("style", "color: inherit;");
  });

  it("flips placement when the requested side overflows", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function getRect(this: HTMLElement) {
        if (this.classList.contains("qizhi-popover")) {
          return new DOMRect(0, 0, 248, 80);
        }
        return new DOMRect(100, 2, 40, 20);
      });

    render(
      <Popover content="自动翻转" position="top" defaultPopupVisible>
        <Button>边缘触发</Button>
      </Popover>,
    );

    expect(screen.getByRole("dialog"))
      .toHaveAttribute("data-popover-position", "bottom");
  });

  it("exposes forceAlign and observes trigger and popup size changes", () => {
    const observed: Element[] = [];
    class ResizeObserverStub {
      observe(element: Element) { observed.push(element); }
      disconnect() {}
    }
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
    const ref = createRef<PopoverHandle>();

    render(
      <Popover ref={ref} content="重新定位" defaultPopupVisible>
        <Button>布局变化</Button>
      </Popover>,
    );

    expect(observed).toHaveLength(2);
    expect(ref.current).not.toBeNull();
    expect(() => ref.current?.forceAlign()).not.toThrow();
  });

  it("does not close a passive controlled popup for another instance Escape", async () => {
    const user = userEvent.setup();
    const changes = vi.fn();
    render(
      <>
        <Popover content="受控常驻" popupVisible onVisibleChange={changes}>
          <Button>受控触发</Button>
        </Popover>
        <Popover content="临时内容">
          <Button>临时触发</Button>
        </Popover>
      </>,
    );

    await user.hover(screen.getByRole("button", { name: "临时触发" }));
    expect(screen.getAllByRole("dialog")).toHaveLength(2);
    await user.keyboard("{Escape}");

    expect(screen.getByRole("dialog")).toHaveTextContent("受控常驻");
    expect(changes).not.toHaveBeenCalled();
  });

  it("opens by hover and keeps the portal content interactive", async () => {
    const user = userEvent.setup();
    render(<Popover title="标题" content={<button type="button">浮层操作</button>}><Button>悬停提示</Button></Popover>);
    const trigger = screen.getByRole("button", { name: "悬停提示" });
    await user.hover(trigger);
    expect(screen.getByRole("dialog")).toBeVisible();
    expect(screen.getByText("标题")).toBeVisible();
    await user.unhover(trigger);
    await user.hover(screen.getByRole("button", { name: "浮层操作" }));
    expect(screen.getByRole("dialog")).toBeVisible();
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
    expect(screen.getByRole("dialog")).toBeVisible();
    await user.tab();
    expect(screen.getByRole("button", { name: "内部" })).toHaveFocus();
    expect(screen.getByRole("dialog")).toBeVisible();
    await user.tab();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
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
    expect(screen.getByRole("dialog")).toBeVisible();
  });

  it("renders every approved position", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function getRect(this: HTMLElement) {
        return this.classList.contains("qizhi-popover")
          ? new DOMRect(0, 0, 100, 50)
          : new DOMRect(500, 300, 80, 40);
      });
    const positions = ["topLeft", "top", "topRight", "bottomLeft", "bottom", "bottomRight", "leftTop", "left", "leftBottom", "rightTop", "right", "rightBottom"] as const;
    render(<>{positions.map((position) => <Popover key={position} position={position} defaultPopupVisible content={position}><Button>{position}</Button></Popover>)}</>);
    positions.forEach((position) => expect(document.querySelector(`[data-popover-position="${position}"]`)).toBeInTheDocument());
  });

  it("keeps the arrow axis in the clamped CSS variable instead of overriding it inline", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function getRect(this: HTMLElement) {
        return this.classList.contains("qizhi-popover")
          ? new DOMRect(0, 0, 248, 104)
          : new DOMRect(500, 300, 104, 32);
      });

    render(
      <Popover position="leftTop" defaultPopupVisible content="左上内容">
        <Button>左上触发</Button>
      </Popover>,
    );

    const popup = screen.getByRole("dialog");
    const arrow = popup.querySelector<HTMLElement>(".qizhi-popover__arrow")!;
    expect(popup.style.getPropertyValue("--qizhi-popover-arrow-offset")).toBe("16px");
    expect(arrow.style.top).toBe("");
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

    await waitFor(() => expect(screen.getByRole("dialog").parentElement).toBe(container));
  });
});
