import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { HomeIcon } from "../icon";
import { SideNavigation } from "./SideNavigation";

describe("SideNavigation", () => {
  it("preserves the current default copy, groups and selection", () => {
    render(<SideNavigation />);

    expect(screen.getByRole("button", { name: /切换空间/ }))
      .toHaveTextContent("AI4S_DEV_public_workspace");
    expect(screen.getByRole("menuitem", { name: "交互式建模" }))
      .toHaveAttribute("aria-current", "page");
    expect(screen.getAllByRole("group").map((group) => (
      group.getAttribute("aria-labelledby")
        ? group.querySelector("[id]")?.textContent
        : null
    ))).toEqual([
      "模型开发与训练",
      "模型评测",
      "AI资产管理",
      "空间管理",
    ]);
    expect(screen.getByRole("menuitem", { name: "可视化建模" }))
      .toBeDisabled();
  });

  it("supports controlled selection without changing it internally", async () => {
    const onSelect = vi.fn();
    render(
      <SideNavigation
        selectedKey="overview"
        onSelect={onSelect}
      />,
    );

    await userEvent.click(
      screen.getByRole("menuitem", { name: "交互式建模" }),
    );
    expect(onSelect).toHaveBeenCalledWith("interactive");
    expect(screen.getByRole("menuitem", { name: "空间概览" }))
      .toHaveAttribute("aria-current", "page");
  });

  it("supports uncontrolled workspace selection and reports changes", async () => {
    const onWorkspaceChange = vi.fn();
    render(<SideNavigation onWorkspaceChange={onWorkspaceChange} />);

    await userEvent.click(screen.getByRole("button", { name: /切换空间/ }));
    await userEvent.click(screen.getByRole("menuitemradio", {
      name: "上海人工智能实验室-模型研发空间",
    }));

    expect(screen.getByRole("button", { name: /切换空间/ }))
      .toHaveTextContent("上海人工智能实验室-模型研发空间");
    expect(onWorkspaceChange)
      .toHaveBeenCalledWith("上海人工智能实验室-模型研发空间");
  });

  it("renders caller-supplied groups and disabled items", () => {
    render(
      <SideNavigation
        groups={[{
          title: "自定义分组",
          items: [
            { key: "home", label: "自定义入口", icon: <HomeIcon /> },
            { key: "disabled", label: "不可用入口", disabled: true },
          ],
        }]}
        defaultSelectedKey="home"
      />,
    );

    const navigation = screen.getByRole("navigation", { name: "空间导航" });
    expect(within(navigation).getByText("自定义分组")).toBeInTheDocument();
    expect(within(navigation).getByRole("menuitem", { name: "自定义入口" }))
      .toHaveAttribute("aria-current", "page");
    expect(within(navigation).getByRole("menuitem", { name: "不可用入口" }))
      .toBeDisabled();
  });

  it("does not select disabled items", () => {
    const onSelect = vi.fn();
    render(<SideNavigation onSelect={onSelect} />);

    fireEvent.click(screen.getByRole("menuitem", { name: "可视化建模" }));
    expect(onSelect).not.toHaveBeenCalled();
  });
});
