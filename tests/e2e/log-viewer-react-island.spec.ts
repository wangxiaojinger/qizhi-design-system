import { expect, test } from "@playwright/test";

test("LogViewer 日志查看器在三档视口完成刷新和筛选", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/#component-log-viewer");
  const section = page.locator("#component-log-viewer");
  await expect(section.getByRole("heading", { name: "日志查看器 LogViewer" })).toBeVisible();
  await expect(section.locator("article.codebox-wrapper")).toHaveCount(5);
  await expect(section.getByRole("table", { name: "LogViewer API" })).toBeVisible();

  const refreshDemo = page.locator("#log-viewer-refresh");
  const refresh = refreshDemo.getByRole("button", { name: "刷新日志" });
  await refresh.click();
  await expect(refreshDemo.getByRole("button", { name: "正在刷新日志" })).toBeDisabled();
  await expect(refreshDemo.getByRole("button", { name: "刷新日志" })).toBeEnabled({ timeout: 2_000 });

  const filterDemo = page.locator("#log-viewer-filter");
  await filterDemo.getByRole("textbox", { name: "搜索日志" }).fill("failed");
  await expect(filterDemo.locator(".qizhi-log-viewer__line")).toHaveCount(1);
  await expect(filterDemo).toContainText("Dataset connection failed");
  await filterDemo.getByRole("textbox", { name: "搜索日志" }).fill("");
  await filterDemo.getByRole("combobox", { name: "筛选日志等级" }).click();
  await page.getByRole("option", { name: "错误" }).click();
  const levelSelect = filterDemo.getByRole("combobox", { name: "筛选日志等级" });
  await levelSelect.focus();
  await levelSelect.press("Escape");
  await expect(levelSelect).toHaveAttribute("aria-expanded", "false");
  await expect(filterDemo.locator(".qizhi-log-viewer__line")).toHaveCount(1);

  const demos = await section.locator(".codebox-wrapper > .demo").evaluateAll((nodes) => nodes.map((node) => ({ clientWidth: node.clientWidth, scrollWidth: node.scrollWidth })));
  expect(demos.filter((demo) => demo.scrollWidth > demo.clientWidth + 1)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  expect(errors).toEqual([]);
  await section.screenshot({ path: testInfo.outputPath(`log-viewer-${testInfo.project.name}.png`) });
});
