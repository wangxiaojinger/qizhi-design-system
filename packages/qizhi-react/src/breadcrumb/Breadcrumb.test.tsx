import { createRef } from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomeIcon } from "../icon/HomeIcon";
import { Breadcrumb } from "./Breadcrumb";

describe("Breadcrumb", () => {
  it("renders linked, plain, and current items with hidden separators", () => {
    render(
      <Breadcrumb aria-label="基础面包屑">
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item href="#components-navigation">频道</Breadcrumb.Item>
        <Breadcrumb.Item current>消息</Breadcrumb.Item>
      </Breadcrumb>,
    );

    const navigation = screen.getByRole("navigation", {
      name: "基础面包屑",
    });
    expect(within(navigation).getByRole("list")).toBeInTheDocument();
    expect(within(navigation).getByRole("link", { name: "频道" }))
      .toHaveAttribute("href", "#components-navigation");
    expect(within(navigation).getByText("消息").closest("li"))
      .toHaveAttribute("aria-current", "page");
    const separators = navigation.querySelectorAll(
      ".qizhi-breadcrumb__separator",
    );
    expect(separators).toHaveLength(2);
    for (const separator of separators) {
      expect(separator).toHaveTextContent("/");
      expect(separator).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("supports small size, custom separators, icons, attributes, and refs", () => {
    const rootRef = createRef<HTMLElement>();
    const itemRef = createRef<HTMLLIElement>();
    render(
      <Breadcrumb
        ref={rootRef}
        size="small"
        separator="→"
        className="custom-root"
        data-scope="compact"
        aria-label="小尺寸带图标的面包屑"
      >
        <Breadcrumb.Item
          ref={itemRef}
          icon={<HomeIcon data-testid="home-icon" />}
          aria-label="首页"
        />
        <Breadcrumb.Item current>消息</Breadcrumb.Item>
      </Breadcrumb>,
    );

    const navigation = screen.getByRole("navigation", {
      name: "小尺寸带图标的面包屑",
    });
    expect(navigation).toHaveClass(
      "qizhi-breadcrumb",
      "qizhi-breadcrumb--small",
      "custom-root",
    );
    expect(navigation).toHaveAttribute("data-scope", "compact");
    expect(rootRef.current).toBe(navigation);
    expect(itemRef.current).toHaveAttribute("aria-label", "首页");
    expect(screen.getByTestId("home-icon")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(navigation.querySelector(".qizhi-breadcrumb__separator"))
      .toHaveTextContent("→");
  });
});
