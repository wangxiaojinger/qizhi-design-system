import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { directionIconManifest } from "../src/icon/direction-icons.manifest";
import { renderDirectionIconComponent } from "./build-direction-icons.mjs";

describe("direction icon visual source parity", () => {
  it("keeps all 38 generated components byte-equal to the approved transformation", async () => {
    for (const item of directionIconManifest) {
      const svg = await readFile(
        join(process.cwd(), "packages/qizhi-react/src/icon", item.sourceFile),
        "utf8",
      );
      const generated = await readFile(
        join(
          process.cwd(),
          "packages/qizhi-react/src/icon/generated",
          `${item.componentName}.tsx`,
        ),
        "utf8",
      );

      expect(generated, item.componentName).toBe(
        renderDirectionIconComponent({
          componentName: item.componentName,
          sourceFile: item.sourceFile,
          svg,
        }),
      );
    }
  });
});
