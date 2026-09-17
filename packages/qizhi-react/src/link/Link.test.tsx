import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { EditIcon, LinkIcon } from "../icon";
import { Link } from "./Link";

describe("Link", () => {
  it("renders as a native button by default and forwards button attributes", () => {
    render(<Link name="preview">预览</Link>);
    const button = screen.getByRole("button", { name: "预览" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("name", "preview");
    expect(button).toHaveClass("qizhi-link");
    expect(button.className).not.toContain("qizhi-link--default");
  });

  it("renders href mode as an anchor and forwards anchor attributes", () => {
    render(<Link href="/detail" target="_blank" download="报告.pdf">查看详情</Link>);
    const link = screen.getByRole("link", { name: "查看详情" });
    expect(link).toHaveAttribute("href", "/detail");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("download", "报告.pdf");
  });

  it.each(["default", "error", "success", "warning"] as const)("renders %s status", (status) => {
    render(<Link status={status}>{status}</Link>);
    const button = screen.getByRole("button");
    if (status === "default") expect(button.className).not.toContain("qizhi-link--default");
    else expect(button).toHaveClass(`qizhi-link--${status}`);
  });

  it("supports hoverable false and className arrays", () => {
    render(<Link hoverable={false} className={["custom-one", "custom-two"]}>预览</Link>);
    expect(screen.getByRole("button")).toHaveClass(
      "qizhi-link--hoverless",
      "custom-one",
      "custom-two",
    );
  });

  it("renders the default link icon for icon=true", () => {
    const { container } = render(<Link icon>链接</Link>);
    expect(container.querySelector(".qizhi-link__icon svg")).toBeInTheDocument();
    expect(container.querySelector(".qizhi-link__icon svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("renders a custom icon node", () => {
    const { container } = render(<Link icon={<EditIcon data-testid="edit-icon" />}>编辑</Link>);
    expect(screen.getByTestId("edit-icon")).toBeInTheDocument();
    expect(container.querySelector(".qizhi-link__icon")).toHaveAttribute("aria-hidden", "true");
  });

  it("exports decorative currentColor Link and Edit icons", () => {
    const { rerender } = render(<LinkIcon data-testid="link-icon" />);
    expect(screen.getByTestId("link-icon")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTestId("link-icon").querySelector("path")).toHaveAttribute("fill", "currentColor");

    rerender(<EditIcon data-testid="edit-icon" />);
    expect(screen.getByTestId("edit-icon")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTestId("edit-icon").querySelector("path")).toHaveAttribute("fill", "currentColor");
  });

  it("blocks disabled button clicks", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Link disabled onClick={onClick}>删除</Link>);
    const button = screen.getByRole("button", { name: "删除" });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("makes a disabled anchor non-focusable and non-interactive", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Link href="/detail" disabled onClick={onClick}>查看详情</Link>);
    const link = screen.getByText("查看详情").closest("a");
    expect(link).not.toBeNull();
    expect(link).not.toHaveAttribute("href");
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("tabindex", "-1");
    await user.click(link!);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("forwards refs to the rendered button or anchor", () => {
    const ref = createRef<HTMLButtonElement | HTMLAnchorElement>();
    const { rerender } = render(<Link ref={ref}>操作</Link>);
    expect(ref.current?.tagName).toBe("BUTTON");
    rerender(<Link ref={ref} href="/detail">详情</Link>);
    expect(ref.current?.tagName).toBe("A");
  });
});
