import { describe, expect, it } from "vitest";
import { editIconManifest, generalIconManifest, interactionIconManifest } from "./catalog-icons.manifest";

describe("catalog icon manifests", () => {
  it("maps time outline and filled names to their visual SVG sources", () => {
    const sourceByName = Object.fromEntries(
      generalIconManifest.map((item) => [item.componentName, item.sourceNodeId]),
    );

    expect(sourceByName).toMatchObject({
      TimeIcon: "0:5374",
      TimeFilledIcon: "0:5378",
    });
  });

  it("adds the complete trademark and general inventories with corrected styles", async () => {
    const manifests = await import("./catalog-icons.manifest") as unknown as Record<string, readonly { style: string }[]>;
    const trademark = manifests.trademarkIconManifest;
    const general = manifests.generalIconManifest;

    expect(trademark).toHaveLength(28);
    expect(general).toHaveLength(185);
    expect(trademark.filter((item) => item.style === "outline")).toHaveLength(13);
    expect(trademark.filter((item) => item.style === "fill")).toHaveLength(15);
    expect(general.filter((item) => item.style === "outline")).toHaveLength(124);
    expect(general.filter((item) => item.style === "fill")).toHaveLength(61);
  });

  it("preserves the complete legacy inventory and corrected style contract", () => {
    expect(interactionIconManifest).toHaveLength(71);
    expect(editIconManifest).toHaveLength(53);
    expect(interactionIconManifest.filter((item) => item.style === "outline")).toHaveLength(50);
    expect(interactionIconManifest.filter((item) => item.style === "fill")).toHaveLength(21);
    expect(editIconManifest.filter((item) => item.style === "outline")).toHaveLength(29);
    expect(editIconManifest.filter((item) => item.style === "fill")).toHaveLength(24);
  });

  it("provides unique AI fields and currentColor for every icon", () => {
    const items = [...interactionIconManifest, ...editIconManifest];
    for (const key of ["id", "componentName", "legacyName", "sourceNodeId"] as const) {
      expect(new Set(items.map((item) => item[key])).size, key).toBe(124);
    }
    for (const item of items) {
      expect(item.aliases.length).toBeGreaterThanOrEqual(3);
      expect(item.colorMode).toBe("currentColor");
      expect(item.importPath).toBe("@wangxiaojinger/qizhi-react/icon");
      expect(item.sourceFile).toMatch(/^\.\.\/\.\.\/\.\.\/\.\.\/assets\/icons\/figma-combination\//);
    }
  });

  it("keeps all six-category catalog fields globally unique", async () => {
    const { generalIconManifest, trademarkIconManifest } = await import("./catalog-icons.manifest");
    const items = [...interactionIconManifest, ...editIconManifest, ...trademarkIconManifest, ...generalIconManifest];

    for (const key of ["id", "componentName", "legacyName", "sourceNodeId"] as const) {
      expect(new Set(items.map((item) => item[key])).size, key).toBe(337);
    }
    expect(items.every((item) => item.colorMode === "currentColor")).toBe(true);
    expect(items.every((item) => item.importPath === "@wangxiaojinger/qizhi-react/icon")).toBe(true);
  });
});
