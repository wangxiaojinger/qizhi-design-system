import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as publicIcons from "./index";
import { editIconManifest, generalIconManifest, interactionIconManifest, trademarkIconManifest } from "./catalog-icons.manifest";

describe("interaction and edit icons", () => {
  it("exports all 337 catalog manifest components", () => {
    for (const item of [...interactionIconManifest, ...editIconManifest, ...trademarkIconManifest, ...generalIconManifest]) {
      expect(publicIcons).toHaveProperty(item.componentName);
    }
  });

  it("exports the provided linear Upload icon with the shared API", () => {
    const item = interactionIconManifest.find(
      (icon) => icon.componentName === "UploadIcon",
    );

    expect(item).toMatchObject({
      id: "interaction.upload",
      displayName: "上传",
      semantic: "interaction",
      family: "upload",
      style: "outline",
      colorMode: "currentColor",
    });
    expect(publicIcons).toHaveProperty("UploadIcon");
  });

  it("exports the provided model experience icons with the shared API", () => {
    const quick = interactionIconManifest.find(
      (icon) => icon.componentName === "QuickExperienceIcon",
    );
    const inference = generalIconManifest.find(
      (icon) => icon.componentName === "OnlineInferenceIcon",
    );

    expect(quick).toMatchObject({
      displayName: "快速体验",
      style: "outline",
      colorMode: "currentColor",
      sourceNodeId: "provided:快速体验.svg",
    });
    expect(inference).toMatchObject({
      displayName: "在线推理",
      style: "outline",
      colorMode: "currentColor",
      sourceNodeId: "provided:在线推理.svg",
    });
    expect(publicIcons).toHaveProperty("QuickExperienceIcon");
    expect(publicIcons).toHaveProperty("OnlineInferenceIcon");
  });

  it("renders generated icons with the shared API and no fixed gray paint", () => {
    const CircleCloseFilledIcon = publicIcons.CircleCloseFilledIcon;
    const CommandManagementIcon = publicIcons.CommandManagementIcon;
    const { container } = render(<><CircleCloseFilledIcon size={24} title="关闭" /><CommandManagementIcon color="rebeccapurple" /></>);
    const svgs = container.querySelectorAll("svg");

    expect(svgs[0]).toHaveAttribute("width", "24");
    expect(svgs[0]).toHaveAttribute("role", "img");
    expect(svgs[1]?.querySelector("path")).toHaveAttribute("fill", "currentColor");
    expect(container.innerHTML).not.toContain("#8C8C8C");
  });

  it("keeps the shared API and compatibility marker on reused public icons", () => {
    const CopyIcon = publicIcons.CopyIcon;
    const { container } = render(<CopyIcon size={22} title="复制" />);
    const svg = container.querySelector("svg");

    expect(svg).toHaveAttribute("width", "22");
    expect(svg).toHaveAttribute("role", "img");
    expect(svg).toHaveAttribute("data-icon", "icon-复制");
  });
});
