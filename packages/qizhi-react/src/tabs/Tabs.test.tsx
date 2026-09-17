import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Tabs } from "./Tabs";

const items = [
  { key: "one", title: "标签一", content: "内容一" },
  { key: "two", title: "标签二", content: "内容二", disabled: true },
  { key: "three", title: "标签三", content: "内容三" },
] as const;

describe("Tabs", () => {
  it("默认激活首个可用项并切换内容", () => {
    render(<Tabs items={items} />);
    expect(screen.getByRole("tab", { name: "标签一" }))
      .toHaveAttribute("aria-selected", "true");
    fireEvent.click(screen.getByRole("tab", { name: "标签三" }));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("内容三");
  });

  it("每个页签的 aria-controls 都指向存在的内容面板", () => {
    render(<Tabs items={items} />);
    screen.getAllByRole("tab").forEach((tab) => {
      expect(document.getElementById(tab.getAttribute("aria-controls")!))
        .toBeInTheDocument();
    });
  });

  it("受控模式只发出变化事件", () => {
    const onChange = vi.fn();
    render(<Tabs items={items} activeKey="one" onChange={onChange} />);
    fireEvent.click(screen.getByRole("tab", { name: "标签三" }));
    expect(onChange).toHaveBeenCalledWith("three");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("内容一");
  });

  it("只渲染页签导航时不生成失效的内容面板关联", () => {
    render(<Tabs items={items} renderContent={false} />);
    expect(screen.queryByRole("tabpanel")).not.toBeInTheDocument();
    screen.getAllByRole("tab").forEach((tab) => {
      expect(tab).not.toHaveAttribute("aria-controls");
    });
  });

  it("只渲染导航时可关联调用方提供的外部内容面板", () => {
    render(<Tabs
      items={[{ ...items[0], panelId: "external-panel" }]}
      renderContent={false}
    />);
    expect(screen.getByRole("tab", { name: "标签一" }))
      .toHaveAttribute("aria-controls", "external-panel");
  });

  it("方向键跳过禁用项并激活下一项", () => {
    render(<Tabs items={items} />);
    fireEvent.keyDown(screen.getByRole("tab", { name: "标签一" }), {
      key: "ArrowRight",
    });
    expect(screen.getByRole("tab", { name: "标签三" }))
      .toHaveAttribute("aria-selected", "true");
  });

  it("正确暴露位置、类型和尺寸状态", () => {
    const { container } = render(
      <Tabs
        items={items}
        position="right"
        type="card-gutter"
        size="large"
      />,
    );
    expect(container.firstElementChild).toHaveClass(
      "qizhi-tabs--right",
      "qizhi-tabs--card-gutter",
      "qizhi-tabs--large",
    );
  });

  it("可关闭导航底部分割线并保留 line 类型", () => {
    const { container } = render(<Tabs items={items} showDivider={false} />);
    expect(container.firstElementChild).toHaveClass(
      "qizhi-tabs--line",
      "qizhi-tabs--no-divider",
    );
  });

  it("转发根节点 ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Tabs ref={ref} items={items} />);
    expect(ref.current).toHaveClass("qizhi-tabs");
  });
});
