import { describe, expect, it } from "vitest";
import { promptIconManifest } from "./prompt-icons.manifest";

describe("promptIconManifest", () => {
  it("maps attitude outline and filled names to their visual SVG sources", () => {
    const sourceByName = Object.fromEntries(
      promptIconManifest.map((item) => [item.componentName, item.sourceNodeId]),
    );

    expect(sourceByName).toMatchObject({
      AttitudeLikeIcon: "0:5434",
      AttitudeLikeFilledIcon: "0:5440",
      AttitudeDislikeIcon: "0:5436",
      AttitudeDislikeFilledIcon: "0:5442",
      AttitudeUnavailableIcon: "0:5438",
      AttitudeUnavailableFilledIcon: "0:5444",
    });
  });

  it("registers all 44 prompt icons with unique AI identities", () => {
    expect(promptIconManifest).toHaveLength(44);
    for (const key of ["id", "componentName", "legacyName", "sourceNodeId"] as const) {
      expect(new Set(promptIconManifest.map((item) => item[key])).size, key).toBe(44);
    }
    expect(promptIconManifest.filter((item) => item.style === "outline")).toHaveLength(20);
    expect(promptIconManifest.filter((item) => item.style === "fill")).toHaveLength(13);
    expect(promptIconManifest.filter((item) => item.style === "color")).toHaveLength(11);

    for (const item of promptIconManifest) {
      expect(item.semantic).toBe("prompt");
      expect(item.importPath).toBe("@wangxiaojinger/qizhi-react/icon");
      expect(item.aliases.length).toBeGreaterThan(0);
      if (item.colorMode === "fixedPalette") {
        expect(item.fixedColors.length).toBeGreaterThan(0);
      } else {
        expect(item.style).not.toBe("color");
      }
    }
  });

  it("registers the provided Skill service artwork as a fixed-palette icon", () => {
    expect(promptIconManifest.find((item) => (
      item.componentName === "SkillServiceIcon"
    ))).toMatchObject({
      id: "prompt.skill.service.color",
      displayName: "Skill 服务",
      style: "color",
      colorMode: "fixedPalette",
      sourceNodeId: "provided:Group 2036084050.svg",
    });
  });

  it("registers the provided INF logo artwork as a fixed-palette icon", () => {
    expect(promptIconManifest.find((item) => item.componentName === "InfLogoColorIcon")).toMatchObject({
      id: "prompt.inf.logo.color",
      displayName: "INF Logo",
      style: "color",
      colorMode: "fixedPalette",
      sourceNodeId: "provided:INFlogo.svg",
    });
  });
});
