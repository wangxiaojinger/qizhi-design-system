import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  it("renders the greeting through one semantic public component", () => {
    render(
      <PageHeader aria-label="工作区欢迎语">
        Good day，欢迎使用 启智 开启新的一天 😃
      </PageHeader>,
    );

    const header = screen.getByRole("banner", { name: "工作区欢迎语" });
    expect(header).toHaveClass("qizhi-page-header");
    expect(header).toHaveTextContent(
      "Good day，欢迎使用 启智 开启新的一天 😃",
    );
    expect(header.querySelector(".qizhi-page-header__greeting"))
      .toHaveTextContent("Good day，欢迎使用 启智 开启新的一天 😃");
  });

  it("forwards native attributes, class names, and its root ref", () => {
    const ref = createRef<HTMLElement>();
    render(
      <PageHeader
        ref={ref}
        id="workspace-header"
        className="custom-header"
        data-scope="workspace"
      >
        欢迎
      </PageHeader>,
    );

    expect(ref.current).toBe(screen.getByText("欢迎").closest("header"));
    expect(ref.current).toHaveClass("qizhi-page-header", "custom-header");
    expect(ref.current).toHaveAttribute("id", "workspace-header");
    expect(ref.current).toHaveAttribute("data-scope", "workspace");
  });
});
