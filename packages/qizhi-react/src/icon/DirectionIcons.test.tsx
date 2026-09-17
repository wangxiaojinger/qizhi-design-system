import { render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import * as publicIcons from "./index";
import { directionIconManifest } from "./direction-icons.manifest";
import {
  ArrowDownFilledIcon,
  ArrowDownIcon,
} from "./generated";

describe("generated direction icons", () => {
  it("exports concise names and legacy aliases as the same component", () => {
    expect(publicIcons.ExpandRightDiagonalFilledIcon).toBeDefined();
    expect(publicIcons.ExpandCollapseRightDiagonalExpandedFilledIcon).toBe(
      publicIcons.ExpandRightDiagonalFilledIcon,
    );
  });

  it("exposes all 38 manifest components from the public icon entry", () => {
    for (const item of directionIconManifest) {
      expect(publicIcons).toHaveProperty(item.componentName);
    }
  });

  it("implements size, native SVG props, currentColor and ref", () => {
    const ref = createRef<SVGSVGElement>();
    const { container } = render(
      <ArrowDownFilledIcon
        ref={ref}
        size={24}
        width={30}
        className="custom-icon"
        data-purpose="test"
      />,
    );
    const svg = container.querySelector("svg");

    expect(svg).toHaveAttribute("width", "30");
    expect(svg).toHaveAttribute("height", "24");
    expect(svg).toHaveClass("custom-icon");
    expect(svg).toHaveAttribute("data-purpose", "test");
    expect(svg?.querySelector("path")).toHaveAttribute("fill", "currentColor");
    expect(ref.current).toBe(svg);
  });

  it("defaults to 1em and hides decorative icons", () => {
    const { container } = render(<ArrowDownIcon />);
    const svg = container.querySelector("svg");

    expect(svg).toHaveAttribute("width", "1em");
    expect(svg).toHaveAttribute("height", "1em");
    expect(svg).toHaveAttribute("focusable", "false");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).not.toHaveAttribute("role");
  });

  it("renders the approved 16, 24 and 32 pixel inspection sizes", () => {
    const { container } = render(
      <><ArrowDownIcon size={16} /><ArrowDownIcon size={24} /><ArrowDownIcon size={32} /></>,
    );
    const sizes = [...container.querySelectorAll("svg")].map((svg) => [
      svg.getAttribute("width"),
      svg.getAttribute("height"),
    ]);

    expect(sizes).toEqual([["16", "16"], ["24", "24"], ["32", "32"]]);
  });

  it("uses accessible image semantics and unique title IDs", () => {
    const { container } = render(
      <>
        <ArrowDownIcon title="向下移动" />
        <ArrowDownIcon title="展开内容" />
        <ArrowDownIcon aria-label="下一个" />
      </>,
    );
    const svgs = [...container.querySelectorAll("svg")];
    const titleIds = svgs.slice(0, 2).map((svg) => svg.querySelector("title")?.id);

    expect(svgs[0]).toHaveAttribute("role", "img");
    expect(svgs[0]).not.toHaveAttribute("aria-hidden");
    expect(svgs[0]).toHaveAttribute("aria-labelledby", titleIds[0]);
    expect(titleIds[0]).not.toBe(titleIds[1]);
    expect(svgs[2]).toHaveAttribute("role", "img");
    expect(svgs[2]).toHaveAttribute("aria-label", "下一个");
  });
});
