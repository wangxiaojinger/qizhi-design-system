import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

const css = readFileSync(
  "packages/qizhi-react/src/business-objects/businessObjects.css",
  "utf8",
);

test("SkillServiceCard 固定标题、项目和三行摘要的截断规则", () => {
  expect(css).toMatch(
    /\.qizhi-skill-service-card__title-row h4\s*\{[^}]*text-overflow:\s*ellipsis;[^}]*white-space:\s*nowrap;/s,
  );
  expect(css).toMatch(
    /\.qizhi-skill-service-card__identity > p > span:last-child\s*\{[^}]*text-overflow:\s*ellipsis;[^}]*white-space:\s*nowrap;/s,
  );
  expect(css).toMatch(
    /\.qizhi-skill-service-card__summary p > span:last-child\s*\{[^}]*-webkit-line-clamp:\s*3;/s,
  );
});
