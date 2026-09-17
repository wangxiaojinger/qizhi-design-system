import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as publicIcons from "./index";
import { promptIconManifest } from "./prompt-icons.manifest";
import {
  CustomDeploymentColorIcon,
  InfLogoColorIcon,
  OtherModelColorIcon,
  SkillServiceIcon,
  StatusFailureIcon,
  StatusLoadingWhiteIcon,
  StatusNotStartedIcon,
  StatusSuccessIcon,
} from "./generated";

describe("fixed palette prompt icons", () => {
  it("exports the two status components from the public icon entry", () => {
    for (const item of promptIconManifest) {
      expect(publicIcons).toHaveProperty(item.componentName);
    }
  });

  it("keeps semantic status colors while supporting the shared icon props", () => {
    const { container } = render(
      <>
        <StatusSuccessIcon size={24} color="rebeccapurple" title="完成" />
        <StatusFailureIcon size={32} color="rebeccapurple" title="失败" />
      </>,
    );
    const svgs = [...container.querySelectorAll("svg")];

    expect(svgs[0]).toHaveAttribute("width", "24");
    expect(svgs[0]?.querySelector("path")).toHaveAttribute("fill", "#52C41A");
    expect(svgs[1]).toHaveAttribute("width", "32");
    expect(svgs[1]?.querySelector("path")).toHaveAttribute("fill", "#F5222D");
    expect(svgs[0]?.querySelector("path")).not.toHaveAttribute("fill", "currentColor");
    expect(svgs[1]?.querySelector("path")).not.toHaveAttribute("fill", "currentColor");
  });

  it("uses unique internal gradient ids for repeated multicolor instances", () => {
    const { container } = render(<><CustomDeploymentColorIcon /><CustomDeploymentColorIcon /></>);
    const svgs = [...container.querySelectorAll("svg")];
    const ids = svgs.map((svg) => svg.querySelector("linearGradient")?.id);
    const fills = svgs.map((svg) => svg.querySelector('path[fill^="url"]')?.getAttribute("fill"));
    expect(ids[0]).toBeTruthy();
    expect(ids[0]).not.toBe(ids[1]);
    expect(fills).toEqual(ids.map((id) => `url(#${id})`));
    expect(container.querySelector("foreignObject")).toBeNull();
    expect(ids.every((id) => Boolean(id && /^[A-Za-z][A-Za-z0-9_-]*$/.test(id)))).toBe(true);
  });

  it("keeps the not-started status center transparent", () => {
    const { container } = render(<StatusNotStartedIcon />);
    const circles = container.querySelectorAll("circle");

    expect(circles).toHaveLength(2);
    expect(circles[1]).toHaveAttribute("fill", "none");
  });

  it("does not introduce default black fills in outlined multicolor geometry", () => {
    const { container } = render(<><OtherModelColorIcon /><StatusLoadingWhiteIcon /></>);
    const svgs = container.querySelectorAll("svg");

    expect(svgs[0]?.querySelector('rect[stroke^="url"]')).toHaveAttribute("fill", "none");
    expect(svgs[1]?.querySelector("path")).toHaveAttribute("fill", "none");
  });

  it("renders the provided Skill service fixed-palette artwork", () => {
    const { container } = render(<SkillServiceIcon size={41} />);
    const svg = container.querySelector("svg");

    expect(svg).toHaveAttribute("viewBox", "0 0 41 39");
    expect(svg).toHaveAttribute("width", "41");
    expect(svg?.querySelector('[fill="#3366FF"]')).toBeInTheDocument();
    expect(svg?.querySelector('[fill="#FFC94D"]')).toBeInTheDocument();
    expect(svg?.querySelectorAll('path[stroke][fill="none"]'))
      .toHaveLength(2);
    expect([...svg!.querySelectorAll("filter")].map((filter) => (
      [...filter.children].map((node) => node.localName.toLowerCase())
    ))).toEqual([
      ["fedropshadow", "femerge"],
      ["fedropshadow", "femerge"],
    ]);
    expect(svg?.querySelectorAll("feMergeNode, femergenode"))
      .toHaveLength(4);
    expect(svg?.querySelector("feComposite")).not.toBeInTheDocument();
  });

  it("renders the provided INF logo fixed-palette artwork", () => {
    const { container } = render(<InfLogoColorIcon size={24} />);
    const svg = container.querySelector("svg");

    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    expect(svg).toHaveAttribute("width", "24");
    expect(svg?.querySelectorAll("path")).toHaveLength(2);
    expect(svg?.querySelectorAll("linearGradient")).toHaveLength(2);
    expect(svg?.querySelector('path[fill^="url"]')).toBeInTheDocument();
  });
});
