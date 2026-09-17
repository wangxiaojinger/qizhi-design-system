import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Button, Tooltip } from "../index";

describe("Tooltip", () => {
  it("supports the legacy hover, focus, click pin, outside click, and Escape contract", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Tooltip content="这是一段文字气泡内容">
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
    expect(popup).toHaveStyle({ backgroundColor: "rgb(51, 102, 255)" });
    expect(popup.parentElement).toBe(container);
    await user.click(screen.getByRole("button", { name: "切换" }));
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
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
