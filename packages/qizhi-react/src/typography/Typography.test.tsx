import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import { Typography } from "./Typography";

class ResizeObserverStub {
  observe = vi.fn();
  disconnect = vi.fn();
}

const originalResizeObserver = globalThis.ResizeObserver;
const originalGetComputedStyle = window.getComputedStyle;

const mockOverflowingText = () => {
  vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(72);
  vi.spyOn(window, "getComputedStyle").mockImplementation((element, pseudoElement) => {
    const style = originalGetComputedStyle(element, pseudoElement);
    Object.defineProperty(style, "lineHeight", { configurable: true, value: "24px" });
    return style;
  });
};

beforeEach(() => {
  Object.defineProperty(globalThis, "ResizeObserver", { configurable: true, value: ResizeObserverStub });
});

afterEach(() => {
  Object.defineProperty(globalThis, "ResizeObserver", { configurable: true, value: originalResizeObserver });
  vi.restoreAllMocks();
});

describe("Typography", () => {
  it("renders a div root and forwards native attributes, class arrays and ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Typography ref={ref} className={["custom-one", "custom-two"]} data-testid="root">内容</Typography>);
    const root = screen.getByTestId("root");
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("qizhi-typography", "custom-one", "custom-two");
    expect(ref.current).toBe(root);
  });

  it.each([1, 2, 3, 4, 5, 6] as const)("renders heading %s as the matching semantic element", (heading) => {
    render(<Typography.Title heading={heading}>标题 {heading}</Typography.Title>);
    expect(screen.getByRole("heading", { level: heading })).toHaveClass(
      "qizhi-typography",
      "qizhi-typography-title",
      `qizhi-typography-title-h${heading}`,
    );
  });

  it("defaults Title to h1", () => {
    render(<Typography.Title>默认标题</Typography.Title>);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it.each(["primary", "secondary", "success", "error", "warning"] as const)(
    "applies the %s semantic text type",
    (type) => {
      render(<Typography.Text type={type}>{type}</Typography.Text>);
      expect(screen.getByText(type)).toHaveClass(`qizhi-typography--${type}`);
    },
  );

  it("renders combined semantic text decorations in a stable order", () => {
    render(<Typography.Text bold mark underline delete code>组合文本</Typography.Text>);
    const root = screen.getByText("组合文本").closest("span.qizhi-typography-text");
    expect(root).not.toBeNull();
    expect(root!.querySelector("strong mark u del code")?.textContent).toBe("组合文本");
  });

  it("makes disabled visual state override semantic type without creating an interactive disabled control", () => {
    render(<Typography.Text type="success" disabled>置灰文本</Typography.Text>);
    const text = screen.getByText("置灰文本");
    expect(text).toHaveClass("qizhi-typography--success", "qizhi-typography--disabled");
    expect(text).not.toHaveAttribute("aria-disabled");
  });

  it("renders Paragraph as p by default and blockquote when requested", () => {
    const { rerender } = render(<Typography.Paragraph data-testid="paragraph">段落</Typography.Paragraph>);
    expect(screen.getByTestId("paragraph").tagName).toBe("P");
    expect(screen.getByTestId("paragraph")).toHaveClass("qizhi-typography-paragraph-spacing-default");

    rerender(<Typography.Paragraph blockquote spacing="close" data-testid="paragraph">引用</Typography.Paragraph>);
    expect(screen.getByTestId("paragraph").tagName).toBe("BLOCKQUOTE");
    expect(screen.getByTestId("paragraph")).toHaveClass("qizhi-typography-paragraph-spacing-close", "qizhi-typography-blockquote");
  });

  it("clamps overflowing text to the requested rows and exposes an accessible expand control", () => {
    mockOverflowingText();

    render(<Typography.Ellipsis rows={2}>需要显示省略状态的长文本内容</Typography.Ellipsis>);

    const content = screen.getByText("需要显示省略状态的长文本内容");
    expect(content).toHaveClass("qizhi-typography-ellipsis__content");
    expect(content).toHaveStyle("--qizhi-typography-ellipsis-rows: 2");
    expect(screen.getByRole("button", { name: "展开" })).toHaveAttribute("aria-expanded", "false");
  });

  it("supports uncontrolled expand and collapse while keeping the full text in the DOM", () => {
    mockOverflowingText();
    const onExpand = vi.fn();

    render(<Typography.Ellipsis onExpand={onExpand}>始终保留在 DOM 中的完整文本</Typography.Ellipsis>);
    fireEvent.click(screen.getByRole("button", { name: "展开" }));

    expect(screen.getByText("始终保留在 DOM 中的完整文本")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "收起" })).toHaveAttribute("aria-expanded", "true");
    expect(onExpand).toHaveBeenLastCalledWith(true, expect.any(Object));

    fireEvent.click(screen.getByRole("button", { name: "收起" }));
    expect(screen.getByRole("button", { name: "展开" })).toHaveAttribute("aria-expanded", "false");
    expect(onExpand).toHaveBeenLastCalledWith(false, expect.any(Object));
  });

  it("keeps controlled expanded state owned by the caller", () => {
    mockOverflowingText();
    const onExpand = vi.fn();

    render(<Typography.Ellipsis expanded={false} onExpand={onExpand}>受控文本</Typography.Ellipsis>);
    fireEvent.click(screen.getByRole("button", { name: "展开" }));

    expect(onExpand).toHaveBeenCalledWith(true, expect.any(Object));
    expect(screen.getByRole("button", { name: "展开" })).toHaveAttribute("aria-expanded", "false");
  });

  it("shows full text without an action when ellipsis is disabled", () => {
    mockOverflowingText();

    render(<Typography.Ellipsis disabled>禁用省略后的完整文本</Typography.Ellipsis>);

    expect(screen.getByText("禁用省略后的完整文本")).toHaveClass("qizhi-typography-ellipsis__content--expanded");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
