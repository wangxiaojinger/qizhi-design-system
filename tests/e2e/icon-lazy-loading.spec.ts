import { expect, test } from "@playwright/test";

test("普通组件页不加载图标目录，进入图标页后才加载", async ({ page }) => {
  const iconModuleResponses: string[] = [];
  page.on("response", (response) => {
    const url = response.url();
    if (url.includes("/apps/qizhi-docs/src/icon/")) iconModuleResponses.push(url);
  });

  await page.goto("/#component-tag");
  await expect(page.locator("#component-tag").getByRole("heading", { name: "标签 Tag" })).toBeVisible();
  await page.waitForLoadState("networkidle");
  expect(iconModuleResponses).toEqual([]);

  await page.goto("/#components-icon");
  await expect(page.locator("#components-icon").getByRole("heading", { name: "图标 Icon" })).toBeVisible();
  await expect.poll(() => iconModuleResponses.length).toBeGreaterThan(0);
});

test("图标搜索只展示包含命中结果的类目", async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#components-icon");
  const section = page.locator("#components-icon");
  await expect(section.getByRole("heading", { name: "图标 Icon" })).toBeVisible();
  const categoryHeadings = section.locator(
    ".qizhi-icon-docs > section[aria-labelledby] > h2.iconlist-title",
  );
  const search = section.getByRole("searchbox", { name: "搜索图标" });
  const searchControl = search.locator("xpath=ancestor::*[contains(concat(' ', normalize-space(@class), ' '), ' qizhi-icon-docs__search ')][1]");

  await expect(searchControl).toHaveClass(/qizhi-input/);
  await expect(searchControl).toHaveCSS("height", "32px");
  await expect(search).toHaveCSS("color", "rgb(29, 33, 41)");
  const placeholderColor = await search.evaluate((node) => (
    getComputedStyle(node, "::placeholder").color
  ));
  expect(placeholderColor).toBe("rgb(201, 205, 212)");
  await expect(searchControl).toHaveCSS("border-color", "rgb(229, 230, 235)");
  await searchControl.hover();
  await expect(searchControl).toHaveCSS("border-color", "rgb(201, 205, 212)");
  await search.focus();
  await expect(searchControl).toHaveCSS("border-color", "rgb(51, 102, 255)");
  await expect(searchControl).toHaveCSS("box-shadow", /rgb\(232, 242, 255\)/);
  const prefixIcon = searchControl.locator("svg").first();
  const [iconBox, searchBox] = await Promise.all([
    prefixIcon.boundingBox(),
    search.boundingBox(),
  ]);
  expect(iconBox).not.toBeNull();
  expect(searchBox).not.toBeNull();
  expect(iconBox!.x + iconBox!.width).toBeLessThanOrEqual(searchBox!.x);

  await search.fill("向下实心箭头");
  const clear = section.getByRole("button", { name: "清空输入内容" });
  await expect(clear).toBeVisible();
  await expect(categoryHeadings).toHaveCount(1);
  await expect(categoryHeadings).toContainText("方向指示类图标");
  await expect(categoryHeadings).not.toContainText("0 个 React 组件");
  await expect(section.getByRole("button", {
    name: "复制向下箭头（填充）组件代码",
  })).toBeVisible();
  await expect.poll(() => section.evaluate((node) => (
    node.scrollWidth <= node.clientWidth
  ))).toBe(true);
  await section.screenshot({
    path: testInfo.outputPath(`icon-search-match-${testInfo.project.name}.png`),
  });

  await clear.click();
  await expect(search).toBeFocused();
  await expect(search).toHaveValue("");
  await expect(categoryHeadings).toHaveCount(6);

  await search.fill("不存在的旋转火箭图标");
  await expect(categoryHeadings).toHaveCount(0);
  await expect(section.getByText("没有匹配的图标")).toBeVisible();

  await search.fill("");
  await expect(categoryHeadings).toHaveCount(6);
  expect(errors).toEqual([]);
});
