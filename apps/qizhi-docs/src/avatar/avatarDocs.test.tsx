import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AvatarDocsIsland } from "./AvatarDocsIsland";
import { avatarApi, avatarGroupApi } from "./avatarApi";

describe("Avatar docs", () => {
  it("renders the five approved demos, shared code actions and independent API anchor", () => {
    render(<AvatarDocsIsland />);

    expect(screen.getAllByRole("heading", { level: 2 }).map((node) => node.textContent)).toEqual([
      "基础用法", "大小和形状", "头像组", "交互按钮", "自动调整字体大小", "API",
    ]);
    expect(screen.getAllByRole("button", { name: "查看代码" })).toHaveLength(5);
    expect(screen.getAllByRole("button", { name: "复制代码" })).toHaveLength(5);
    expect(document.getElementById("avatar-API")).toBeInTheDocument();
    expect(screen.queryByText(/Demo\.tsx|Demo\.css/)).not.toBeInTheDocument();
  });

  it("keeps every legacy Avatar instance count and approved initial layout state", () => {
    render(<AvatarDocsIsland />);

    expect(document.querySelectorAll("#avatar-basic .qizhi-avatar")).toHaveLength(5);
    expect(document.querySelectorAll("#avatar-size-shape .qizhi-avatar")).toHaveLength(8);
    expect(document.querySelectorAll("#avatar-group .qizhi-avatar")).toHaveLength(8);
    expect(document.querySelectorAll("#avatar-trigger .qizhi-avatar")).toHaveLength(2);
    expect(document.querySelectorAll("#avatar-auto-fit .qizhi-avatar")).toHaveLength(4);
    expect(document.querySelectorAll("#avatar-size-shape .qizhi-avatar-shape-square")).toHaveLength(4);
  });

  it("exposes observable Chinese feedback for both approved trigger modes", () => {
    render(<AvatarDocsIsland />);
    const demo = document.getElementById("avatar-trigger")!;
    const status = demo.querySelector(".avatar-docs-trigger-status");

    fireEvent.click(within(demo).getByRole("button", { name: "拍摄头像" }));
    expect(status).toHaveTextContent("已触发拍摄头像操作");
    fireEvent.click(within(demo).getByRole("button", { name: "编辑头像" }));
    expect(status).toHaveTextContent("已触发编辑头像操作");
  });

  it("documents only the approved Avatar and Avatar.Group public API", () => {
    expect(avatarApi.map((item) => item.name)).toEqual([
      "children", "size", "shape", "triggerIcon", "triggerType", "onTriggerClick", "triggerAriaLabel", "className", "style",
    ]);
    expect(avatarGroupApi.map((item) => item.name)).toEqual(["children", "size", "className", "style"]);
    expect(avatarApi.find((item) => item.name === "size")?.defaultValue).toBe('"default"');
    expect(avatarApi.find((item) => item.name === "triggerAriaLabel")?.defaultValue).toBe('"操作头像"');
  });
});
