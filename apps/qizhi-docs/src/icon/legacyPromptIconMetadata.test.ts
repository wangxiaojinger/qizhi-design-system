import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const html = readFileSync(resolve(process.cwd(), "index.html"), "utf8");

const getCategory = (legacyName: string) => {
  const escapedName = legacyName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return html.match(
    new RegExp(`data-icon-name="${escapedName} [^\"]*"[^>]*data-icon-category="([^\"]+)"`),
  )?.[1];
};

describe("旧站提示建议类图标元数据", () => {
  it.each([
    ["icon-态度-赞同-面性", "fill"],
    ["icon-态度-反对-面性", "fill"],
    ["icon-态度-不可用-面性", "fill"],
    ["icon-态度-赞同", "outline"],
    ["icon-态度-反对", "outline"],
    ["icon-态度-不可用", "outline"],
  ])("将 %s 归入 %s", (legacyName, category) => {
    expect(getCategory(legacyName)).toBe(category);
  });
});
