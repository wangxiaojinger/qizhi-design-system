import { describe, expect, it } from "vitest";
import { findIcons } from "./findIcon";

describe("findIcons", () => {
  it("finds a unique icon by structured AI constraints", () => {
    const result = findIcons({
      semantic: "direction",
      family: "arrow",
      direction: "down",
      style: "fill",
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("direction.arrow.down.fill");
    expect(result[0]?.componentName).toBe("ArrowDownFilledIcon");
  });

  it("matches Chinese aliases and English component names", () => {
    expect(findIcons({ query: "向下实心箭头" }).map((item) => item.id)).toContain(
      "direction.arrow.down.fill",
    );
    expect(findIcons({ query: "ArrowRightAltIcon" }).map((item) => item.id)).toEqual([
      "direction.arrow.right.alt",
    ]);
  });

  it("returns candidates instead of choosing the first ambiguous match", () => {
    const result = findIcons({ query: "全屏" });

    expect(result.length).toBeGreaterThan(1);
    expect(result.map((item) => item.id)).toContain("direction.fullscreen.default");
    expect(result.map((item) => item.id)).toContain("direction.fullscreen.selected");
  });

  it("returns an empty list when no manifest item matches", () => {
    expect(findIcons({ query: "不存在的旋转火箭图标" })).toEqual([]);
  });

  it("finds fixed-palette status icons for AI by semantic meaning", () => {
    expect(findIcons({ semantic: "prompt", family: "status", state: "success" }).map((item) => item.id)).toEqual([
      "prompt.status.success.fixed",
    ]);
    expect(findIcons({ query: "失败状态" }).map((item) => item.componentName)).toContain(
      "StatusFailureIcon",
    );
  });

  it("finds interaction and edit icons through semantic and family fields", () => {
    expect(findIcons({ semantic: "interaction", family: "circleAction", style: "fill" })).toHaveLength(4);
    expect(findIcons({ query: "指令管理" }).map((item) => item.componentName)).toEqual(["CommandManagementIcon"]);
    expect(findIcons({ semantic: "edit", family: "tag" })).toHaveLength(4);
  });

  it("finds trademark and general icons through stable AI families", () => {
    expect(findIcons({ semantic: "trademark", family: "programmingLanguage" })).toHaveLength(7);
    expect(findIcons({ query: "机器人类型一" }).map((item) => item.componentName)).toEqual([
      "RobotType1Icon",
      "RobotType1FilledIcon",
    ]);
    expect(findIcons({ semantic: "general", family: "device", query: "云下载" })).toHaveLength(2);
  });
});
