import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const sourceDirectory = join(
  process.cwd(),
  "packages/qizhi-react/src/icon/source/direction",
);

const readDirectionSources = async () => {
  const fileNames = (await readdir(sourceDirectory))
    .filter((fileName) => fileName.endsWith(".svg"))
    .sort();

  return Promise.all(
    fileNames.map(async (fileName) => ({
      fileName,
      source: await readFile(join(sourceDirectory, fileName), "utf8"),
    })),
  );
};

describe("direction icon source evidence", () => {
  it("contains exactly the 38 confirmed legacy direction SVGs", async () => {
    const sources = await readDirectionSources();

    expect(sources).toHaveLength(38);
  });

  it("keeps every source self-contained and traceable", async () => {
    const sources = await readDirectionSources();

    for (const { fileName, source } of sources) {
      expect(fileName).toMatch(/^\d{3}--[a-z0-9-]+--\d+-\d+\.svg$/);
      expect(source).toMatch(/<svg\b/);
      expect(source).toMatch(/viewBox="[^"]+"/);
      expect(source).not.toMatch(/<script\b/i);
      expect(source).not.toMatch(/(?:href|src)="https?:\/\//i);
    }
  });
});
