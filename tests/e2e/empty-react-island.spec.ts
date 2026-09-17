import { expect, test } from "@playwright/test";

test("Empty 保持单个旧站 Demo、指定 SVG 与三档响应式几何", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#component-empty");

  await expect(page.getByRole("heading", { name: "空状态 Empty" })).toBeVisible();
  await expect(page.locator("#component-empty article.codebox-wrapper")).toHaveCount(1);
  await expect(page.locator("#component-empty .qizhi-empty")).toHaveCount(1);
  await expect(page.locator("#empty-API")).toBeVisible();

  const demo = page.locator("#empty-basic .demo");
  const empty = demo.locator(".qizhi-empty");
  const image = empty.locator(".qizhi-empty__image");
  await expect(empty).toHaveAttribute("role", "status");
  await expect(empty.locator(".qizhi-empty__description")).toHaveText("暂无数据");
  await expect(image).toHaveAttribute("width", "64");
  await expect(image).toHaveAttribute("height", "40");
  await expect(image).toHaveCSS("width", "64px");
  await expect(image).toHaveCSS("height", "40px");
  await expect(empty).toHaveCSS("row-gap", "8px");
  expect(await demo.evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThanOrEqual(254);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  expect(await demo.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);

  await page.locator("#component-empty").screenshot({ path: testInfo.outputPath(`empty-${testInfo.project.name}.png`) });
  expect(errors).toEqual([]);
});

test("Empty 文档操作复用正式组件且复制源码与预览同源", async ({ page }, testInfo) => {
  await page.goto("/#component-empty");
  const demo = page.locator("#empty-basic");
  const toggle = demo.getByRole("button", { name: "查看代码" });

  await toggle.focus();
  await expect(toggle).toBeFocused();
  await toggle.press("Enter");
  await expect(demo.getByRole("button", { name: "收起代码" })).toHaveAttribute("aria-expanded", "true");
  await expect(demo.locator(".qizhi-code-wrapper code")).toContainText('import { Empty } from "@wangxiaojinger/qizhi-react"');
  await expect(demo.locator(".qizhi-code-wrapper")).not.toContainText("BasicDemo.tsx");
  await expect(demo.getByRole("button", { name: "复制代码" })).toHaveClass(/qizhi-btn/);

  await demo.evaluate((element) => { element.scrollIntoView(); window.scrollBy(0, -96); });
  await page.screenshot({ path: testInfo.outputPath(`empty-code-${testInfo.project.name}.png`) });
});
