import { expect, test } from "@playwright/test";

test("Link React Island exposes the approved component contract", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/#components-link");
  await expect(page.getByRole("heading", { name: "链接 Link" })).toBeVisible();
  await expect(page.locator("#components-link article")).toHaveCount(5);
  await expect(page.locator("#link-API")).toHaveCount(1);
  await expect(page.locator('#components-link [id="API"]')).toHaveCount(0);
  await expect(page.locator('.nav-link[href="#components-link"]')).toHaveClass(/is-active/);

  const componentLinks = page.locator("#components-link .demo .qizhi-link");
  await expect.poll(() => componentLinks.evaluateAll((links) => links.every((link) => getComputedStyle(link).fontSize === "14px"))).toBe(true);
  await expect.poll(() => page.locator('[id="图标"] .qizhi-link').first().evaluate((link) => getComputedStyle(link).columnGap)).toBe("6px");
  await expect(page.locator('[id="图标"] .qizhi-link__icon svg')).toHaveCount(4);

  const basicLinks = page.locator('[id="基础用法"] .demo .qizhi-link');
  await expect(basicLinks).toHaveCount(2);
  await expect(basicLinks.first()).toHaveAttribute("href", "#components-link");
  const disabledAnchor = basicLinks.nth(1);
  await expect(disabledAnchor).toHaveAttribute("aria-disabled", "true");
  await expect(disabledAnchor).not.toHaveAttribute("href");
  await expect(disabledAnchor).toHaveAttribute("tabindex", "-1");
  const errorLink = page.locator('[id="其他状态"] .qizhi-link--error').first();
  const defaultColor = await errorLink.evaluate((link) => getComputedStyle(link).color);
  await errorLink.hover();
  await expect(errorLink).toHaveCSS("background-color", "rgb(242, 243, 245)");
  await expect.poll(() => errorLink.evaluate((link) => getComputedStyle(link).color)).not.toBe(defaultColor);

  const hoverless = page.getByText("隐藏悬浮底色", { exact: true });
  await hoverless.hover();
  await expect(hoverless).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");

  const operation = page.locator('[id="配合 Dropdown 使用"] .demo').getByRole("button", { name: "City" }).first();
  await operation.focus();
  await expect(operation).toBeFocused();
  await operation.press("Space");

  await page.getByRole("button", { name: "查看代码" }).first().click();
  await expect(page.locator("#link-code-基础用法 code")).toContainText('import { Link, Space } from "@wangxiaojinger/qizhi-react";');
  await expect(page.locator("#link-code-基础用法 code")).toHaveCSS("font-size", "14px");

  const apiType = page.getByRole("row", { name: /^disabled 是否禁用/ }).locator("code").nth(1);
  await expect(apiType).toHaveCSS("color", "rgb(245, 49, 157)");
  await expect(apiType).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  const descriptionIdentifier = page.getByRole("row", { name: /^icon 设置为 true/ }).locator("td").nth(1).locator("code");
  await expect(descriptionIdentifier).toHaveText("true");
  await expect(descriptionIdentifier).toHaveCSS("font-size", "12px");

  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.screenshot({ path: `test-results/link-react-island-${testInfo.project.name}.png`, fullPage: true });
  expect(errors).toEqual([]);
});
