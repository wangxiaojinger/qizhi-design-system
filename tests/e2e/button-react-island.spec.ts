import { expect, test } from "@playwright/test";

test("Button static fallback keeps component styles when scripts are unavailable", async ({ page }) => {
  await page.route("**/*", async (route) => {
    if (route.request().resourceType() === "script") {
      await route.abort();
      return;
    }
    await route.continue();
  });
  await page.goto("/#components-button");
  const primaryButton = page.locator("#components-button .qizhi-btn-primary").first();
  await expect(primaryButton).toBeVisible();
  await expect(primaryButton).toHaveCSS("display", "inline-flex");
  await expect(primaryButton).toHaveCSS("height", "32px");
  await expect(primaryButton).toHaveCSS("background-color", "rgb(51, 102, 255)");
  await expect(primaryButton).toHaveCSS("color", "rgb(255, 255, 255)");
  await page.addStyleTag({ content: ":root { --primary-6: 80, 120, 255; }" });
  await expect(primaryButton).toHaveCSS("background-color", "rgb(80, 120, 255)");
  await expect(page.locator('[id="图标按钮"] .ri-add-line')).toHaveCount(4);
  await expect(page.locator('[id="图标按钮"] .ri-delete-bin-line')).toHaveCount(1);
  await expect(page.locator('[id="图标按钮"] svg')).toHaveCount(0);
  await expect(page.locator('[id="加载中按钮"] .ri-loader-4-line')).toHaveCount(9);
  await expect(page.locator('[id="加载中按钮"] .ri-add-line')).toHaveCount(1);
  await expect(page.locator('[id="加载中按钮"] svg')).toHaveCount(0);
});

test("Button React Island keeps the legacy shell and exposes callable docs", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#components-button");
  await expect(page.getByRole("heading", { name: "按钮 Button" })).toBeVisible();
  await expect(page.locator("#components-button article")).toHaveCount(8);
  await expect(page.getByRole("heading", { name: "API" })).toBeVisible();
  await expect(page.locator('.nav-link[href="#components-button"]')).toHaveClass(/is-active/);
  await expect.poll(() => page.locator("#基本用法").evaluate((article) => {
    const demo = article.querySelector(".demo")?.getBoundingClientRect();
    const actions = article.querySelector(".component-example-actions")?.getBoundingClientRect();
    return demo && actions ? Math.round(actions.top - demo.bottom) : null;
  })).toBe(12);
  await expect.poll(() => page.locator("#基本用法").evaluate((article) => {
    const demo = article.querySelector(".demo")?.getBoundingClientRect();
    const copyButton = [...article.querySelectorAll(".qizhi-code-action")].at(-1)?.getBoundingClientRect();
    return demo && copyButton ? Math.round(demo.right - copyButton.right) : null;
  })).toBe(0);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await expect.poll(() => page.evaluate(() => [...document.querySelectorAll("#components-button .qizhi-btn")].every((button) => {
    const demo = button.closest(".demo");
    if (!demo) return true;
    const rect = button.getBoundingClientRect();
    return rect.left >= 0 && rect.right <= Math.min(demo.getBoundingClientRect().right + 1, window.innerWidth + 1);
  }))).toBe(true);
  await expect.poll(() => page.evaluate(() => [...document.querySelectorAll("#components-button .qizhi-btn")]
    .every((button) => getComputedStyle(button).fontSize === "14px"))).toBe(true);
  const secondaryButton = page.locator('[id="基本用法"]').getByRole("button", { name: "次要按钮" });
  await expect(secondaryButton).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(secondaryButton).toHaveCSS("border-color", "rgb(229, 230, 235)");
  const disabledDashedButton = page.locator('[id="禁用按钮"]').getByRole("button", { name: "虚线按钮" });
  await expect(disabledDashedButton).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(disabledDashedButton).toHaveCSS("border-style", "dashed");
  const disabledTextButton = page.locator('[id="禁用按钮"]').getByRole("button", { name: "文本按钮" });
  await expect(disabledTextButton).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(disabledTextButton).toHaveCSS("border-color", "rgba(0, 0, 0, 0)");
  const sizeDemo = page.locator('[id="按钮尺寸"]');
  for (const [name, height] of [["迷你", 24], ["小", 28], ["中", 32], ["大", 36]] as const) {
    await expect(sizeDemo.getByRole("button", { name, exact: true })).toHaveCSS("height", `${height}px`);
  }
  const primaryButton = page.locator('[id="基本用法"]').getByRole("button", { name: "主要按钮" });
  await primaryButton.hover();
  await expect(primaryButton).toHaveCSS("background-color", "rgb(87, 135, 255)");
  const primaryBox = await primaryButton.boundingBox();
  if (!primaryBox) throw new Error("Primary button is not measurable");
  await page.mouse.move(primaryBox.x + primaryBox.width / 2, primaryBox.y + primaryBox.height / 2);
  await page.mouse.down();
  await expect(primaryButton).toHaveCSS("background-color", "rgb(32, 70, 210)");
  await page.mouse.up();
  await page.mouse.move(0, 0);
  await page.keyboard.press("Tab");
  await primaryButton.focus();
  await expect(primaryButton).toBeFocused();
  await expect(primaryButton).toHaveCSS("outline-width", "2px");
  await expect.poll(() => page.locator('[id="加载中按钮"] .button-loading-grid').evaluate((grid) => {
    const buttons = [...grid.querySelectorAll(".qizhi-btn")];
    const columnCount = getComputedStyle(grid).gridTemplateColumns.split(" ").length;
    return buttons.length > columnCount
      ? Math.round(buttons[0].getBoundingClientRect().left - buttons[columnCount].getBoundingClientRect().left)
      : null;
  })).toBe(0);
  const iconLabel = page.locator('[id="图标按钮"] .qizhi-btn__label').first();
  await expect(iconLabel).toHaveCSS("margin-left", "0px");
  await expect(iconLabel.locator("..")).toHaveCSS("column-gap", "8px");
  const squareIconButton = page.locator('[id="按钮形状"]').getByRole("button", { name: "添加" });
  await expect(squareIconButton).toHaveCSS("border-radius", "4px");
  await expect(squareIconButton.locator(".ri-add-line")).toHaveCount(1);
  await expect.poll(async () => {
    const box = await squareIconButton.boundingBox();
    return box ? Math.round(box.width) === Math.round(box.height) : false;
  }).toBe(true);
  await expect(page.getByRole("button", { name: "查看代码" }).first().locator(".ri-code-s-slash-line")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "复制代码" }).first().locator(".ri-file-copy-line")).toHaveCount(1);
  await expect(page.locator("#components-button .qizhi-btn svg")).toHaveCount(0);
  const loadingIcon = page.locator('[id="加载中按钮"] .qizhi-btn__loading-icon').first();
  await expect(loadingIcon.locator(".ri-loader-4-line")).toBeVisible();
  await expect(loadingIcon).toHaveCSS("animation-name", "qizhi-button-loading-spin");
  const loadingTrigger = page.locator('[id="加载中按钮"] .button-loading-actions').getByRole("button", { name: "点击加载" }).first();
  await loadingTrigger.click();
  await expect(loadingTrigger).toHaveAttribute("aria-busy", "true");
  await expect(loadingTrigger.locator(".ri-loader-4-line")).toBeVisible();
  await expect(loadingTrigger.locator(".qizhi-btn__loading-icon")).toHaveCSS("animation-name", "qizhi-button-loading-spin");
  await page.getByRole("button", { name: "查看代码" }).first().click();
  await expect(page.locator("#button-code-基本用法 code")).toContainText('import { Button, Space } from "@wangxiaojinger/qizhi-react";');
  await expect(page.locator("#button-code-基本用法 .qizhi-code-token--keyword").first()).toBeVisible();
  await expect(page.locator("#button-code-基本用法 code")).toHaveCSS("font-size", "13px");
  await expect(page.locator("#button-code-基本用法 code")).toHaveCSS("color", "rgb(78, 89, 105)");
  const apiDescription = page.getByRole("row", { name: /^disabled 是否禁用 boolean false$/ }).locator("td").nth(1);
  await expect(apiDescription).toHaveCSS("font-size", "14px");
  const apiType = page.getByRole("row", { name: /^disabled 是否禁用 boolean false$/ }).locator("code").nth(1);
  await expect.poll(() => apiType.evaluate((element) => getComputedStyle(element).fontFamily.startsWith("Inter"))).toBe(true);
  await expect(apiType).toHaveCSS("font-size", "14px");
  await expect(apiType).toHaveCSS("color", "rgb(245, 49, 157)");
  const apiName = page.getByRole("row", { name: /^disabled 是否禁用 boolean false$/ }).locator("code").nth(0);
  await expect(apiName).toHaveCSS("color", "rgb(29, 33, 41)");
  await expect(apiName).toHaveCSS("font-size", "14px");
  await expect(apiName).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect.poll(() => apiName.evaluate((element) => getComputedStyle(element).fontFamily.startsWith("Inter"))).toBe(true);
  await expect(apiType).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  const apiDefault = page.getByRole("row", { name: /^disabled 是否禁用 boolean false$/ }).locator("code").nth(2);
  await expect(apiDefault).toHaveCSS("color", "rgb(245, 49, 157)");
  await expect(apiDefault).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  const iconOnlyDescription = page.getByRole("row", { name: /iconOnly.*只有图标/ }).locator("td").nth(1);
  await expect(iconOnlyDescription.locator("code")).toHaveText(["icon", "iconOnly"]);
  await expect(iconOnlyDescription.locator("code").first()).toHaveCSS("background-color", "rgb(242, 243, 245)");
  await expect(iconOnlyDescription.locator("code").first()).toHaveCSS("font-size", "12px");
  await expect.poll(() => iconOnlyDescription.locator("code").first().evaluate((element) => getComputedStyle(element).fontFamily.startsWith("Menlo"))).toBe(true);
  await expect.poll(() => iconOnlyDescription.evaluate((element) => getComputedStyle(element).fontFamily.startsWith("Inter"))).toBe(true);
  const typeDescription = page.getByRole("row", { name: /^type 按钮支持五种类型值/ }).locator("td").nth(1);
  await expect(typeDescription.locator("code")).toHaveText(["default"]);
  const htmlTypeDescription = page.getByRole("row", { name: /^htmlType 按钮原生的 html type/ }).locator("td").nth(1);
  await expect(htmlTypeDescription.locator("code")).toHaveCount(0);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `test-results/button-react-island-${testInfo.project.name}.png`, fullPage: true });
  expect(errors).toEqual([]);
});
