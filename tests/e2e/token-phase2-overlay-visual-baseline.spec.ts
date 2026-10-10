import { expect, test } from "@playwright/test";

const prepare = async (
  page: import("@playwright/test").Page,
  hash: string,
) => {
  await page.goto(`/${hash}`);
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({
    content: "*, *::before, *::after { caret-color: transparent !important; transition: none !important; }",
  });
};

test("Tooltip basic open state matches the pre-migration baseline", async ({ page }) => {
  await prepare(page, "#component-tooltip");
  const demo = page.locator("#文字气泡-基础用法 .demo");
  await demo.locator(".qizhi-typography-text").first().hover();
  const tooltip = page.getByRole("tooltip");
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveScreenshot("tooltip-basic-open.png");
});

test("Tooltip mini open state matches the pre-migration baseline", async ({ page }) => {
  await prepare(page, "#component-tooltip");
  await page.locator("#文字气泡-迷你尺寸 .qizhi-typography-text").hover();
  const tooltip = page.getByRole("tooltip", { name: "123456789" });
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveScreenshot("tooltip-mini-open.png");
});

test("Popover basic open state matches the pre-migration baseline", async ({ page }) => {
  await prepare(page, "#component-popover");
  await page.locator("#popover-basic .popover-demo-trigger").hover();
  const popover = page.locator("body > .qizhi-popover");
  await expect(popover).toBeVisible();
  await expect(popover).toHaveScreenshot("popover-basic-open.png");
});

test("Popover directional arrow matches the pre-migration baseline", async ({ page }) => {
  await prepare(page, "#component-popover");
  const trigger = page.locator("#popover-position").getByRole("button", {
    name: "右下",
    exact: true,
  });
  await trigger.focus();
  const popupId = await trigger.getAttribute("aria-controls");
  expect(popupId).not.toBeNull();
  const popover = page.locator(`#${popupId}`);
  await expect(popover).toBeVisible();
  await expect(popover).toHaveScreenshot("popover-right-bottom-open.png");
});

test("Dropdown basic open state matches the pre-migration baseline", async ({ page }) => {
  await prepare(page, "#component-dropdown");
  const dropdown = page.locator("#下拉菜单-基础用法 .qizhi-dropdown");
  await dropdown.locator(".qizhi-dropdown__trigger").hover();
  await expect(dropdown.getByRole("menu")).toBeVisible();
  await expect(dropdown).toHaveScreenshot("dropdown-basic-open.png");
});

test("Dropdown cascade open state matches the pre-migration baseline", async ({ page }) => {
  await prepare(page, "#component-dropdown");
  const demo = page.locator("#下拉菜单-多级菜单 .demo");
  await expect(demo.locator(".qizhi-dropdown__submenu-trigger[data-item-key]")).toHaveCount(4);
  await demo.getByRole("button", { name: "Click" }).click();
  await demo.locator(".qizhi-dropdown__submenu-trigger").first().hover();
  await expect(demo.locator(".qizhi-dropdown__submenu-popup").first()).toBeVisible();
  await expect(demo).toHaveScreenshot("dropdown-cascade-open.png");
});

test("Dropdown.Button states match the pre-migration baseline", async ({ page }) => {
  await prepare(page, "#component-dropdown");
  const demo = page.locator("#下拉菜单-按钮下拉框 .demo");
  await expect(demo.locator(".qizhi-dropdown-button")).toHaveCount(4);
  await expect(demo.locator(".qizhi-dropdown-button--loading")).toHaveCount(1);
  await expect(demo).toHaveScreenshot("dropdown-button-states.png");
});
