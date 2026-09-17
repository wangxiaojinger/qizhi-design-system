import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { editIconManifest, generalIconManifest, interactionIconManifest, trademarkIconManifest } from "../src/icon/catalog-icons.manifest";
import { transformPromptSvgMarkup } from "./build-prompt-icons.mjs";

describe("catalog icon SVG generator", () => {
  it("safely transforms every interaction and edit source into currentColor markup", async () => {
    for (const item of [...interactionIconManifest, ...editIconManifest, ...trademarkIconManifest, ...generalIconManifest]) {
      const sourcePath = resolve("packages/qizhi-react/src/icon", item.sourceFile);
      const source = (await readFile(sourcePath, "utf8")).replace(/#(?:8C8C8C|818181)/gi, "black");
      const { markup, viewBox } = transformPromptSvgMarkup(source, item);

      expect(viewBox, item.componentName).toBeTruthy();
      expect(markup, item.componentName).not.toMatch(/<(?:script|foreignObject|style)\b/i);
      expect(markup, item.componentName).not.toMatch(/\son[a-z]+=/i);
      expect(markup, item.componentName).not.toContain("#8C8C8C");
      expect(markup, item.componentName).toContain("currentColor");
    }
  });
});
