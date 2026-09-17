import { expect, test } from "@playwright/test";

test("Descriptions 保持两组旧站 Demo、三组列表和三档响应式几何", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#component-descriptions");

  await expect(page.getByRole("heading", { name: "描述列表 Descriptions" })).toBeVisible();
  await expect(page.locator("#component-descriptions article.codebox-wrapper")).toHaveCount(2);
  await expect(page.locator("#component-descriptions .qizhi-descriptions")).toHaveCount(3);
  await expect(page.locator("#component-descriptions .qizhi-descriptions__item")).toHaveCount(12);
  await expect(page.locator("#descriptions-API")).toBeVisible();

  const groups = page.locator("#component-descriptions .qizhi-descriptions");
  const expectedColumns = testInfo.project.name === "mobile-375" ? 1 : 3;
  for (let index = 0; index < 3; index += 1) {
    const root = groups.nth(index);
    const body = root.locator(".qizhi-descriptions__body");
    expect((await body.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length))).toBe(expectedColumns);
    expect(await root.evaluate((element) => element.getBoundingClientRect().width)).toBeLessThanOrEqual(720);
  }

  const firstTitle = groups.first().locator(".qizhi-descriptions__title");
  await expect(firstTitle).toHaveCSS("font-size", "16px");
  await expect(firstTitle).toHaveCSS("line-height", "24px");
  await expect(groups.first().locator(".qizhi-descriptions__label").first()).toHaveCSS("font-size", "14px");
  await expect(groups.first().locator(".qizhi-descriptions__value").first()).toHaveCSS("line-height", "22px");

  const rightItem = groups.nth(1).locator(".qizhi-descriptions__item").first();
  expect((await rightItem.evaluate((element) => getComputedStyle(element).gridTemplateColumns)).split(" ")[0]).toBe("72px");
  await expect(rightItem.locator(".qizhi-descriptions__label")).toHaveCSS("text-align", "right");

  const verticalItem = groups.nth(2).locator(".qizhi-descriptions__item").first();
  await expect(verticalItem).toHaveCSS("row-gap", "6px");
  expect(await verticalItem.locator(".qizhi-descriptions__label").evaluate((element) => getComputedStyle(element, "::after").content)).toBe('""');

  const status = page.locator("#descriptions-basic .qizhi-tag", { hasText: "运行中" });
  await expect(status).toHaveClass(/qizhi-tag-green/);
  await expect(status).toHaveCSS("height", "24px");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  await page.locator("#component-descriptions").screenshot({ path: testInfo.outputPath(`descriptions-${testInfo.project.name}.png`) });
  expect(errors).toEqual([]);
});

test("Descriptions 文档代码操作保持同源且可键盘使用", async ({ page }, testInfo) => {
  await page.goto("/#component-descriptions");
  const demo = page.locator("#descriptions-basic");
  const toggle = demo.getByRole("button", { name: "查看代码" });

  await toggle.focus();
  await expect(toggle).toBeFocused();
  await toggle.press("Enter");
  await expect(demo.getByRole("button", { name: "收起代码" })).toHaveAttribute("aria-expanded", "true");
  await expect(demo.locator(".qizhi-code-wrapper code")).toContainText('import { Descriptions, Tag } from "@wangxiaojinger/qizhi-react"');
  await expect(demo.locator(".qizhi-code-wrapper")).not.toContainText("BasicDemo.tsx");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  await demo.evaluate((element) => {
    element.scrollIntoView();
    window.scrollBy(0, -96);
  });
  await page.screenshot({ path: testInfo.outputPath(`descriptions-code-${testInfo.project.name}.png`) });
});
