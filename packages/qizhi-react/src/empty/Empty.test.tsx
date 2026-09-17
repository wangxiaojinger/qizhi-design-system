import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Empty } from "./Empty";

describe("Empty", () => {
  it("renders the approved default illustration and description", () => {
    render(<Empty />);
    const root = screen.getByRole("status");
    const image = root.querySelector("img");

    expect(root).toHaveClass("qizhi-empty");
    expect(image).toHaveClass("qizhi-empty__image");
    expect(image).toHaveAttribute("width", "64");
    expect(image).toHaveAttribute("height", "40");
    expect(image).toHaveAttribute("alt", "");
    expect(image).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("暂无数据")).toHaveClass("qizhi-empty__description");
  });

  it("supports a custom description and hides it only when null", () => {
    const { rerender } = render(<Empty description="暂无搜索结果" />);
    expect(screen.getByText("暂无搜索结果")).toBeInTheDocument();

    rerender(<Empty description={null} />);
    expect(document.querySelector(".qizhi-empty__description")).not.toBeInTheDocument();
  });

  it("forwards native attributes, className, style and ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Empty ref={ref} role="region" aria-label="空结果" className="业务空态" style={{ minHeight: 120 }} />);
    const root = screen.getByRole("region", { name: "空结果" });
    expect(root).toHaveClass("qizhi-empty", "业务空态");
    expect(root).toHaveStyle({ minHeight: "120px" });
    expect(ref.current).toBe(root);
  });
});
