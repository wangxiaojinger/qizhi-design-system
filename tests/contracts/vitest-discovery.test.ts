import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("root Vitest discovery boundary", () => {
  it("does not collect standalone generated pages or their dependencies", () => {
    const config = readFileSync(`${process.cwd()}/vitest.config.ts`, "utf8");

    expect(config).toContain('"generated-react-pages/**"');
  });
});
