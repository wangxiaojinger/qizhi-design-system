import { expect, test } from "@playwright/test";

test("CodePreview 代码预览在三档视口保持可用", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/#component-code-preview");
  const section = page.locator("#component-code-preview");
  await expect(section.getByRole("heading", { name: "代码预览 CodePreview" })).toBeVisible();
  await expect(section.locator("article.codebox-wrapper")).toHaveCount(4);
  await expect(section.getByRole("table", { name: "CodePreview API" })).toBeVisible();

  const languageDemo = page.locator("#code-preview-languages");
  const languageSelect = languageDemo.getByRole("combobox", { name: "代码语言" });
  await languageSelect.focus();
  await languageSelect.press("ArrowUp");
  await languageSelect.press("Enter");
  await expect(languageSelect).toHaveValue("python");
  await expect(languageDemo.locator(".qizhi-code-preview__line-content").nth(0)).toContainText('platform = "QIZHI"');
  await expect(languageDemo.locator(".qizhi-code-preview__line-content").nth(1)).toContainText("print(platform)");

  const firstCopy = page.locator("#code-preview-basic .qizhi-code-preview").getByRole("button", { name: "复制代码" });
  await firstCopy.focus();
  await expect(firstCopy).toBeFocused();
  await expect(page.locator("#code-preview-long-content .qizhi-content-viewer")).toHaveCSS("overflow", /auto/);

  const demos = await section.locator(".codebox-wrapper > .demo").evaluateAll((nodes) => nodes.map((node) => ({ clientWidth: node.clientWidth, scrollWidth: node.scrollWidth })));
  expect(demos.filter((demo) => demo.scrollWidth > demo.clientWidth + 1)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  expect(errors).toEqual([]);
  await section.screenshot({ path: testInfo.outputPath(`code-preview-${testInfo.project.name}.png`) });
});
