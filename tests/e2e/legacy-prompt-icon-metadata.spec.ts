import { expect, test } from "@playwright/test";

test("旧站态度图标按线性和面性正确筛选", async ({ page }, testInfo) => {
  await page.route("**/apps/qizhi-docs/src/icon/main.tsx*", (route) => route.abort());
  await page.goto("/#components-icon");

  const section = page.locator('[data-icon-semantic-section="prompt"]');
  const search = page.getByRole("searchbox", { name: "搜索图标" });
  await search.fill("态度");

  await page.getByRole("radio", { name: "面性图标" }).click();
  await expect(section.locator('[data-icon-component$="-面性"]:visible')).toHaveCount(3);
  await expect(section.locator('[data-icon-component="icon-态度-赞同"]:visible')).toHaveCount(0);

  await page.getByRole("radio", { name: "线性图标" }).click();
  await expect(section.locator('[data-icon-component$="-面性"]:visible')).toHaveCount(0);
  await expect(section.locator('[data-icon-component^="icon-态度-"]:visible')).toHaveCount(3);
  await section.screenshot({ path: testInfo.outputPath(`legacy-prompt-attitude-${testInfo.project.name}.png`) });
});
