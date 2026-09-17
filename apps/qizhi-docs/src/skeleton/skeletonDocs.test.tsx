import { fireEvent, render, screen, within } from "@testing-library/react";
import { SkeletonDocsIsland } from "./SkeletonDocsIsland";
import { skeletonApi } from "./skeletonApi";
import { skeletonDemos } from "./skeletonDocs.registry";

describe("Skeleton docs", () => {
  it("locks the three legacy demos in exact order and copy", () => {
    expect(skeletonDemos.map((demo) => [demo.id, demo.title, demo.description]))
      .toEqual([
        ["Skeleton-基础用法", "基础用法", "骨架屏的基本使用。"],
        [
          "Skeleton-文本行数和宽度",
          "文本行数和宽度",
          "设置文本行数及文本宽度。",
        ],
        ["Skeleton-动画", "动画", "骨架屏显示动画效果。"],
      ]);
  });

  it("preserves exact geometry and the complete animation toggle path", () => {
    render(<SkeletonDocsIsland />);

    expect(screen.getByRole("heading", { name: "骨架屏 Skeleton" }))
      .toBeInTheDocument();
    expect(screen.getByText("将加载中的数据用灰色占位。"))
      .toBeInTheDocument();
    const animationDemo = document.getElementById("Skeleton-动画")!;
    const toggle = within(animationDemo).getByRole("switch", {
      name: "切换骨架屏动画",
    });
    const skeleton = within(animationDemo).getByRole("status", {
      name: "内容加载中，动画已开启",
    });
    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(skeleton).toHaveClass("qizhi-skeleton--animated");
    expect(skeleton).toHaveAccessibleName("内容加载中，动画已开启");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(skeleton).not.toHaveClass("qizhi-skeleton--animated");
    expect(skeleton).toHaveAccessibleName("内容加载中，动画已关闭");
  });

  it("keeps preview, displayed code and copied code on one TSX source", () => {
    for (const demo of skeletonDemos) {
      expect(demo.source).toContain('from "@wangxiaojinger/qizhi-react"');
      expect(demo.source).not.toMatch(/<(button|input|select|textarea)\b/);
      expect(demo.source).not.toContain("<svg");
      expect(demo.source).not.toContain("style={{");
      expect(demo.source).not.toMatch(/qizhi-[\w-]+__/);
      expect(Math.max(...demo.source.split("\n").map((line) => line.length)))
        .toBeLessThanOrEqual(80);
    }

    render(<SkeletonDocsIsland />);
    expect(screen.getAllByRole("button", { name: "查看代码" }))
      .toHaveLength(3);
    expect(screen.getAllByRole("button", { name: "复制代码" }))
      .toHaveLength(3);
    expect(screen.queryByText("Demo.tsx")).not.toBeInTheDocument();
  });

  it("publishes only implemented public Skeleton properties", () => {
    expect(skeletonApi.map((item) => item.name)).toEqual([
      "animation",
      "image",
      "text",
      "className",
      "style",
      "ref",
    ]);
    render(<SkeletonDocsIsland />);
    expect(screen.getByRole("table", { name: "Skeleton API" }))
      .toBeInTheDocument();
  });
});
