import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TableCellText } from "./TableCellText";

type Geometry = {
  clientWidth: number;
  scrollWidth: number;
  clientHeight: number;
  scrollHeight: number;
};

const setGeometry = (element: HTMLElement, geometry: Geometry) => {
  Object.entries(geometry).forEach(([key, value]) => {
    Object.defineProperty(element, key, { configurable: true, get: () => value });
  });
};

const installResizeObserver = () => {
  const callbacks: ResizeObserverCallback[] = [];
  const targets: Element[] = [];

  vi.stubGlobal("ResizeObserver", class {
    constructor(callback: ResizeObserverCallback) {
      callbacks.push(callback);
    }

    observe(target: Element) {
      targets.push(target);
    }

    disconnect() {}

    unobserve() {}
  });

  return {
    resize: () => act(() => callbacks.forEach((callback) => callback([], {} as ResizeObserver))),
    targets,
  };
};

const getTextLeaf = (container: HTMLElement) => {
  const leaf = container.querySelector<HTMLSpanElement>(".qizhi-table__text");
  if (!leaf) throw new Error("TableCellText leaf was not rendered");
  return leaf;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("TableCellText", () => {
  it("dismisses pinned text on Escape after focus leaves the trigger without closing its host", () => {
    const observer = installResizeObserver();
    const hostEscape = vi.fn();
    document.addEventListener("keydown", hostEscape);
    try {
      const { container } = render(<div>
        <TableCellText rows={1} tooltip>仍需展示的长文本</TableCellText>
        <button>其他操作</button>
      </div>);
      setGeometry(getTextLeaf(container), {
        clientWidth: 80, scrollWidth: 160, clientHeight: 22, scrollHeight: 22,
      });
      observer.resize();
      fireEvent.click(getTextLeaf(container));
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
      fireEvent.focus(screen.getByRole("button", { name: "其他操作" }));
      fireEvent.keyDown(screen.getByRole("button", { name: "其他操作" }), { key: "Escape" });
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
      expect(hostEscape).not.toHaveBeenCalled();
      fireEvent.click(getTextLeaf(container));
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    } finally {
      document.removeEventListener("keydown", hostEscape);
    }
  });
  it("keeps a one-line value as a plain, non-focusable text leaf until it overflows", () => {
    const observer = installResizeObserver();
    const { container } = render(<TableCellText rows={1} tooltip>很长的表格文本</TableCellText>);
    const leaf = getTextLeaf(container);
    setGeometry(leaf, { clientWidth: 120, scrollWidth: 120, clientHeight: 22, scrollHeight: 22 });

    observer.resize();

    expect(leaf).toHaveClass("is-rows-1");
    expect(leaf).not.toHaveAttribute("role");
    expect(leaf).not.toHaveAttribute("tabindex");
    expect(leaf).not.toHaveAttribute("aria-expanded");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(observer.targets).toContain(leaf.parentElement);
  });

  it("opens the full value with the real Tooltip for a horizontally truncated one-line value", () => {
    const observer = installResizeObserver();
    const { container } = render(<TableCellText rows={1} tooltip>很长的表格文本</TableCellText>);
    const leaf = getTextLeaf(container);
    setGeometry(leaf, { clientWidth: 80, scrollWidth: 160, clientHeight: 22, scrollHeight: 22 });

    observer.resize();

    const trigger = getTextLeaf(container);
    expect(trigger).toHaveAttribute("role", "button");
    expect(trigger).toHaveAttribute("tabindex", "0");
    fireEvent.click(trigger);
    expect(screen.getByRole("tooltip")).toHaveTextContent("很长的表格文本");

    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("uses vertical overflow to detect a truncated two-line value", () => {
    const observer = installResizeObserver();
    const { container } = render(<TableCellText rows={2} tooltip>可以换成三行的表格文本</TableCellText>);
    const leaf = getTextLeaf(container);
    setGeometry(leaf, { clientWidth: 120, scrollWidth: 120, clientHeight: 44, scrollHeight: 66 });

    observer.resize();

    const trigger = getTextLeaf(container);
    expect(trigger).toHaveClass("is-rows-2");
    expect(trigger).toHaveAttribute("role", "button");
    expect(trigger).toHaveAttribute("tabindex", "0");
  });

  it("opens again after Escape closes a clicked tooltip without closing its dialog", () => {
    const observer = installResizeObserver();
    const dialogEscape = vi.fn();
    document.addEventListener("keydown", dialogEscape);
    try {
      const { container } = render(<TableCellText rows={1} tooltip>可重复打开的表格文本</TableCellText>);
      setGeometry(getTextLeaf(container), { clientWidth: 80, scrollWidth: 160, clientHeight: 22, scrollHeight: 22 });
      observer.resize();
      const trigger = getTextLeaf(container);

      fireEvent.click(trigger);
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
      fireEvent.keyDown(trigger, { key: "Escape" });
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
      expect(dialogEscape).not.toHaveBeenCalled();

      fireEvent.click(trigger);
      expect(screen.getByRole("tooltip")).toHaveTextContent("可重复打开的表格文本");
    } finally {
      document.removeEventListener("keydown", dialogEscape);
    }
  });

  it("removes an opened tooltip and its focus affordance after resize eliminates truncation", () => {
    const observer = installResizeObserver();
    const { container } = render(<TableCellText rows={1} tooltip>会变化宽度的表格文本</TableCellText>);
    const leaf = getTextLeaf(container);
    setGeometry(leaf, { clientWidth: 80, scrollWidth: 160, clientHeight: 22, scrollHeight: 22 });
    observer.resize();
    fireEvent.click(getTextLeaf(container));
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    setGeometry(getTextLeaf(container), { clientWidth: 160, scrollWidth: 160, clientHeight: 22, scrollHeight: 22 });
    observer.resize();

    const plainLeaf = getTextLeaf(container);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(plainLeaf).not.toHaveAttribute("role");
    expect(plainLeaf).not.toHaveAttribute("tabindex");
    expect(plainLeaf).not.toHaveAttribute("aria-expanded");
  });

  it("remeasures changed content and never exposes a tooltip when tooltip is disabled", () => {
    const observer = installResizeObserver();
    const { container, rerender } = render(<TableCellText rows={1} tooltip>初始长文本</TableCellText>);
    setGeometry(getTextLeaf(container), { clientWidth: 80, scrollWidth: 160, clientHeight: 22, scrollHeight: 22 });
    observer.resize();
    setGeometry(getTextLeaf(container), { clientWidth: 80, scrollWidth: 160, clientHeight: 22, scrollHeight: 22 });
    fireEvent.click(getTextLeaf(container));
    expect(screen.getByRole("tooltip")).toHaveTextContent("初始长文本");

    rerender(<TableCellText rows={1} tooltip>更新后的完整文本</TableCellText>);
    expect(screen.getByRole("tooltip")).toHaveTextContent("更新后的完整文本");

    setGeometry(getTextLeaf(container), { clientWidth: 160, scrollWidth: 160, clientHeight: 22, scrollHeight: 22 });
    rerender(<TableCellText rows={1} tooltip>短文本</TableCellText>);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    rerender(<TableCellText rows={1} tooltip={false}>禁用 Tooltip 的长文本</TableCellText>);
    setGeometry(getTextLeaf(container), { clientWidth: 80, scrollWidth: 160, clientHeight: 22, scrollHeight: 22 });
    observer.resize();
    expect(getTextLeaf(container)).not.toHaveAttribute("role");
    expect(getTextLeaf(container)).not.toHaveAttribute("tabindex");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
});
