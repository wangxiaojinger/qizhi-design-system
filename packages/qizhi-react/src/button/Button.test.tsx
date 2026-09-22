import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { AddIcon } from "../icon";
import { Button } from "./Button";

describe("Button", () => {
  it("renders defaults and forwards native button attributes", () => {
    render(<Button name="save" data-testid="button">保存</Button>);
    const button = screen.getByTestId("button");
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("name", "save");
    expect(button).toHaveClass("qizhi-btn-secondary", "qizhi-btn-size-default");
    expect(button.className).not.toContain("qizhi-btn-shape-");
  });

  it("maps the public default type to the secondary visual treatment", () => {
    render(<Button type="default">默认按钮</Button>);
    expect(screen.getByRole("button")).toHaveClass("qizhi-btn-secondary");
    expect(screen.getByRole("button")).not.toHaveClass("qizhi-btn-default");
  });

  it.each(["primary", "secondary", "dashed", "text"] as const)("renders %s type", (type) => {
    render(<Button type={type}>{type}</Button>);
    expect(screen.getByRole("button")).toHaveClass(`qizhi-btn-${type}`);
  });

  it.each(["mini", "small", "default", "large"] as const)("renders %s size", (size) => {
    render(<Button size={size}>{size}</Button>);
    expect(screen.getByRole("button")).toHaveClass(`qizhi-btn-size-${size}`);
  });

  it.each(["warning", "danger", "success"] as const)("renders %s status over type", (status) => {
    render(<Button type="primary" status={status}>{status}</Button>);
    expect(screen.getByRole("button")).toHaveClass("qizhi-btn-primary", `qizhi-btn-status-${status}`);
  });

  it("renders icon-only and long contracts", () => {
    const { rerender } = render(<Button icon={<AddIcon />} aria-label="添加" />);
    expect(screen.getByRole("button", { name: "添加" })).toHaveClass("qizhi-btn-icon-only");
    rerender(<Button long>主要按钮</Button>);
    expect(screen.getByRole("button")).toHaveClass("qizhi-btn-long");
  });

  it("places an icon after the label when requested", () => {
    render(
      <Button icon={<AddIcon />} iconPosition="after">
        下一步
      </Button>,
    );
    const button = screen.getByRole("button", { name: "下一步" });
    expect(button.lastElementChild).toHaveClass("qizhi-btn__icon");
  });

  it("supports explicit iconOnly, loadingFixedWidth and className arrays", () => {
    render(<Button iconOnly loadingFixedWidth className={["custom-one", "custom-two"]}>操作</Button>);
    expect(screen.getByRole("button")).toHaveClass(
      "qizhi-btn-icon-only",
      "qizhi-btn-loading-fixed-width",
      "custom-one",
      "custom-two",
    );
  });

  it("blocks disabled and loading clicks with correct accessibility state", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(<Button disabled onClick={onClick}>保存</Button>);
    await user.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();

    rerender(<Button loading onClick={onClick}>保存</Button>);
    const button = screen.getByRole("button");
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button.querySelector(".qizhi-btn__loading-icon .ri-loader-4-line")).not.toBeNull();
    expect(button.querySelector(".qizhi-btn__loading-icon svg")).toBeNull();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders href mode as an anchor and forwards anchor attributes", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event) => event.preventDefault());
    render(
      <Button href="/detail" target="_blank" anchorProps={{ download: "报告.pdf" }} onClick={onClick}>
        查看详情
      </Button>,
    );
    const link = screen.getByRole("link", { name: "查看详情" });
    expect(link).toHaveAttribute("href", "/detail");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("download", "报告.pdf");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(link).toHaveAttribute("rel", expect.stringContaining("noreferrer"));
    await user.click(link);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("makes disabled href mode non-focusable and non-interactive", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button href="/detail" disabled onClick={onClick}>查看详情</Button>);
    const disabledLink = screen.getByText("查看详情").closest("a");
    expect(disabledLink).not.toBeNull();
    expect(disabledLink).not.toHaveAttribute("href");
    expect(disabledLink).toHaveAttribute("aria-disabled", "true");
    expect(disabledLink).toHaveAttribute("tabindex", "-1");
    await user.click(disabledLink!);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("forwards refs to the rendered button or anchor", () => {
    const buttonRef = createRef<HTMLButtonElement | HTMLAnchorElement>();
    const { rerender } = render(<Button ref={buttonRef}>保存</Button>);
    expect(buttonRef.current?.tagName).toBe("BUTTON");
    rerender(<Button ref={buttonRef} href="/detail">查看</Button>);
    expect(buttonRef.current?.tagName).toBe("A");
  });

  it("warns in development when an icon-only button has no accessible name", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<Button icon={<AddIcon />} />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("可访问名称"));
    warn.mockRestore();
  });

});
