import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { afterEach, vi } from "vitest";
import { Button, Tooltip } from "../index";
import type { TooltipHandle } from "./Tooltip.types";

describe("Tooltip", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("supports the legacy hover, focus, click pin, outside click, and Escape contract", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Tooltip
          content="这是一段文字气泡内容"
          trigger={["hover", "focus", "click"]}
        >
          <Button>触发气泡</Button>
        </Tooltip>
        <button type="button">外部</button>
      </>,
    );
    const trigger = screen.getByRole("button", { name: "触发气泡" });

    await user.hover(trigger);
    expect(screen.getByRole("tooltip")).toBeVisible();
    await user.unhover(trigger);
    await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());

    await user.tab();
    expect(trigger).toHaveFocus();
    expect(screen.getByRole("tooltip")).toBeVisible();
    await user.tab();
    await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("tooltip")).toBeVisible();
    await user.unhover(trigger);
    expect(screen.getByRole("tooltip")).toBeVisible();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "外部" }));
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("defaults to hover and focus without pinning on click", () => {
    render(
      <Tooltip content="默认提示">
        <Button>默认触发</Button>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button", { name: "默认触发" });

    fireEvent.click(trigger);

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("stays open while either hover or focus remains active", async () => {
    const user = userEvent.setup();
    render(<Tooltip content="组合状态"><Button>组合入口</Button></Tooltip>);
    const trigger = screen.getByRole("button", { name: "组合入口" });

    fireEvent.focus(trigger);
    await user.hover(trigger);
    await user.unhover(trigger);
    await waitFor(() => expect(screen.getByRole("tooltip")).toBeVisible());
  });

  it("dismisses a default hover tooltip with Escape", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Escape 关闭">
        <Button>Escape 触发</Button>
      </Tooltip>,
    );

    await user.hover(screen.getByRole("button", { name: "Escape 触发" }));
    expect(screen.getByRole("tooltip")).toBeVisible();
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("uses configurable enter and leave delays", () => {
    vi.useFakeTimers();
    render(
      <Tooltip
        content="延迟提示"
        mouseEnterDelay={0.12}
        mouseLeaveDelay={0.24}
      >
        <Button>延迟触发</Button>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button", { name: "延迟触发" });

    fireEvent.mouseEnter(trigger);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(120));
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    fireEvent.mouseLeave(trigger);
    act(() => vi.advanceTimersByTime(239));
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("does not open for empty content but preserves numeric zero", () => {
    const { rerender } = render(
      <Tooltip content="">
        <Button>空内容</Button>
      </Tooltip>,
    );
    fireEvent.mouseEnter(screen.getByRole("button", { name: "空内容" }));
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    rerender(
      <Tooltip content={0}>
        <Button>数字内容</Button>
      </Tooltip>,
    );
    fireEvent.mouseEnter(screen.getByRole("button", { name: "数字内容" }));
    expect(screen.getByRole("tooltip")).toHaveTextContent("0");
  });

  it("supports arrow visibility, z-index, and semantic classes and styles", () => {
    render(
      <Tooltip
        content="自定义"
        defaultPopupVisible
        arrow={false}
        zIndex={1400}
        classNames={{ root: "custom-root", container: "custom-container" }}
        styles={{
          root: { marginLeft: 3 },
          container: { color: "rgb(255, 0, 0)" },
        }}
      >
        <Button>自定义触发</Button>
      </Tooltip>,
    );
    const popup = screen.getByRole("tooltip");

    expect(popup).toHaveClass("custom-root");
    expect(popup).toHaveStyle({ zIndex: 1400, marginLeft: 3 });
    expect(popup.querySelector(".custom-container")).toHaveStyle({
      color: "rgb(255, 0, 0)",
    });
    expect(popup.querySelector(".qizhi-tooltip__arrow")).toBeNull();
  });

  it("flips placement when the requested side overflows", () => {
    const rectSpy = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function getRect(this: HTMLElement) {
        if (this.classList.contains("qizhi-tooltip")) {
          return new DOMRect(0, 0, 80, 32);
        }
        return new DOMRect(100, 2, 40, 20);
      });

    render(
      <Tooltip content="自动翻转" position="top" defaultPopupVisible>
        <Button>边缘触发</Button>
      </Tooltip>,
    );

    expect(screen.getByRole("tooltip"))
      .toHaveAttribute("data-tooltip-position", "bottom");
    rectSpy.mockRestore();
  });

  it("exposes forceAlign and observes trigger and popup size changes", () => {
    const observed: Element[] = [];
    const disconnect = vi.fn();
    class ResizeObserverStub {
      observe(element: Element) { observed.push(element); }
      disconnect() { disconnect(); }
    }
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
    const ref = createRef<TooltipHandle>();

    render(
      <Tooltip ref={ref} content="重新定位" defaultPopupVisible>
        <Button>布局变化</Button>
      </Tooltip>,
    );

    expect(observed).toHaveLength(2);
    expect(() => ref.current?.forceAlign()).not.toThrow();
    vi.unstubAllGlobals();
  });

  it("supports controlled visibility, mini size, color, position, and custom container", async () => {
    const user = userEvent.setup();
    const container = document.createElement("div");
    document.body.append(container);

    function ControlledTooltip() {
      const [visible, setVisible] = useState(true);
      return (
        <>
          <button type="button" onClick={() => setVisible(false)}>
            切换
          </button>
          <Tooltip
            content="123456789"
            mini
            color="rgb(51, 102, 255)"
            position="bottomRight"
            popupVisible={visible}
            onVisibleChange={setVisible}
            getPopupContainer={() => container}
          >
            <Button>受控气泡</Button>
          </Tooltip>
        </>
      );
    }

    render(<ControlledTooltip />);
    const popup = screen.getByRole("tooltip");
    expect(popup).toHaveClass("qizhi-tooltip-mini");
    expect(popup).toHaveAttribute("data-tooltip-position", "bottomRight");
    expect(popup).not.toHaveStyle({ backgroundColor: "rgb(51, 102, 255)" });
    expect(popup.querySelector(".qizhi-tooltip__container"))
      .toHaveStyle({ backgroundColor: "rgb(51, 102, 255)" });
    expect(popup.parentElement).toBe(container);
    await user.click(screen.getByRole("button", { name: "切换" }));
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("does not close a passive controlled tooltip for another instance Escape", async () => {
    const user = userEvent.setup();
    const changes = vi.fn();
    render(
      <>
        <Tooltip content="受控常驻" popupVisible onVisibleChange={changes}>
          <Button>受控触发</Button>
        </Tooltip>
        <Tooltip content="临时提示">
          <Button>临时触发</Button>
        </Tooltip>
      </>,
    );

    await user.hover(screen.getByRole("button", { name: "临时触发" }));
    expect(screen.getAllByRole("tooltip")).toHaveLength(2);
    await user.keyboard("{Escape}");

    expect(screen.getByRole("tooltip")).toHaveTextContent("受控常驻");
    expect(changes).not.toHaveBeenCalled();
  });

  it("受控弹层的触发器无布局时不显示在视口左上角", () => {
    render(
      <div style={{ display: "none" }}>
        <Tooltip content="隐藏路由的气泡" popupVisible>
          <Button>隐藏触发器</Button>
        </Tooltip>
      </div>,
    );

    expect(screen.getByRole("tooltip", { hidden: true }))
      .toHaveStyle({ visibility: "hidden" });
  });

  it("路由显示隐藏挂载的触发器后重新定位受控弹层", async () => {
    const { container } = render(
      <div data-route-panel style={{ display: "none" }}>
        <Tooltip content="路由恢复后的气泡" popupVisible>
          <Button>路由触发器</Button>
        </Tooltip>
      </div>,
    );
    expect(screen.getByRole("tooltip", { hidden: true }))
      .toHaveStyle({ visibility: "hidden" });
    const panel = container.querySelector<HTMLElement>("[data-route-panel]");
    if (!panel) throw new Error("Route panel is missing");
    panel.style.display = "block";
    document.dispatchEvent(new CustomEvent("qizhi:route-rendered"));
    await waitFor(() => expect(screen.getByRole("tooltip")).toBeVisible());
  });
});
