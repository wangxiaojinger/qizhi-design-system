import { expect, test } from "@playwright/test";

const readVisualMetrics = async (page: import("@playwright/test").Page) => page.evaluate(() => {
  const section = document.querySelector("#component-dropdown");
  const popup = section?.querySelector<HTMLElement>("#下拉菜单-基础用法 .qizhi-dropdown__popup");
  const item = popup?.querySelector<HTMLElement>(".qizhi-dropdown__item");
  const read = (element?: HTMLElement | null) => {
    if (!element) return null;
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return { width: Math.round(rect.width * 1000) / 1000, height: Math.round(rect.height * 1000) / 1000, fontSize: style.fontSize, lineHeight: style.lineHeight, padding: style.padding, color: style.color, background: style.backgroundColor, border: style.border, borderRadius: style.borderRadius, boxShadow: style.boxShadow };
  };
  return { popup: read(popup), item: read(item) };
});

test("Dropdown React Island preserves the seven approved legacy demos", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#component-dropdown");
  await expect(page.getByRole("heading", { name: "下拉菜单 Dropdown" })).toBeVisible();
  await expect(page.locator("#component-dropdown article.codebox-wrapper")).toHaveCount(7);
  await expect(page.locator("#dropdown-API")).toHaveCount(1);
  await expect(page.locator('.nav-link[href="#component-dropdown"]')).toHaveClass(/is-active/);

  const basic = page.locator("#下拉菜单-基础用法 .qizhi-dropdown");
  await basic.hover();
  await expect(basic.getByRole("menu")).toBeVisible();
  await expect(basic.getByRole("menuitem")).toHaveCount(3);
  const basicGap = await basic.evaluate((root) => {
    const trigger = root.querySelector<HTMLElement>(".qizhi-dropdown__trigger");
    const popup = root.querySelector<HTMLElement>(":scope > .qizhi-dropdown__popup");
    if (!trigger || !popup) return null;
    return popup.getBoundingClientRect().top - trigger.getBoundingClientRect().bottom;
  });
  expect(basicGap).toBe(4);
  if (basicGap === null) throw new Error("Dropdown trigger or popup is missing");
  const triggerBox = await basic.locator(".qizhi-dropdown__trigger").boundingBox();
  const popupBox = await basic.locator(":scope > .qizhi-dropdown__popup").boundingBox();
  const firstItemBox = await basic.getByRole("menuitem", { name: "北京" }).boundingBox();
  expect(triggerBox).not.toBeNull();
  expect(popupBox).not.toBeNull();
  expect(firstItemBox).not.toBeNull();
  if (triggerBox && popupBox && firstItemBox) {
    await page.mouse.move(triggerBox.x + triggerBox.width / 2, triggerBox.y + triggerBox.height / 2);
    await page.mouse.move(popupBox.x + popupBox.width / 2, triggerBox.y + triggerBox.height + basicGap / 2);
    await page.waitForTimeout(30);
    await page.mouse.move(firstItemBox.x + firstItemBox.width / 2, firstItemBox.y + firstItemBox.height / 2);
    await expect(basic.getByRole("menu")).toBeVisible();

    await page.mouse.move(popupBox.x + popupBox.width + 24, popupBox.y + popupBox.height + 24);
    await page.waitForTimeout(50);
    await expect(basic.getByRole("menu")).toBeVisible();
    await expect(basic.getByRole("menu")).toBeHidden({ timeout: 250 });
  }
  const firstCodeAction = page.locator("#下拉菜单-基础用法").getByRole("button", { name: "查看代码" });
  await expect(firstCodeAction).toHaveClass(/qizhi-btn-secondary/);
  await firstCodeAction.click();
  await expect(page.locator("#下拉菜单-基础用法 .qizhi-code-wrapper pre")).toBeVisible();
  await expect(page.locator("#下拉菜单-基础用法 .dropdown-demo__tool")).toHaveCount(0);

  const clickTrigger = page.locator("#下拉菜单-触发方式").getByRole("button", { name: "Click" });
  await clickTrigger.click();
  await expect(clickTrigger).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(clickTrigger).toBeFocused();
  await expect(clickTrigger).toHaveAttribute("aria-expanded", "false");
  const clickMenuId = await clickTrigger.getAttribute("aria-controls");
  const clickMenuFirstItem = page.locator(`#${clickMenuId} [role=menuitem]`).first();
  await clickTrigger.press("ArrowDown");
  await expect(clickMenuFirstItem).toBeFocused();
  await clickMenuFirstItem.click();
  await expect(clickTrigger).toBeFocused();

  await expect(page.locator("#下拉菜单-弹出方向 .qizhi-dropdown")).toHaveCount(6);
  for (const position of ["top", "tl", "tr", "bottom", "bl", "br"]) await expect(page.locator(`#下拉菜单-弹出方向 .qizhi-dropdown--${position}`)).toHaveCount(1);

  const cascadeTrigger = page.locator("#下拉菜单-多级菜单").getByRole("button", { name: "Click" });
  await cascadeTrigger.click();
  const beijing = page.locator("#下拉菜单-多级菜单 .qizhi-dropdown__submenu-trigger").first();
  await beijing.hover();
  await expect(page.locator("#下拉菜单-多级菜单 .qizhi-dropdown__submenu-popup").first()).toBeVisible();

  await expect(page.locator("#下拉菜单-按钮下拉框 .qizhi-dropdown-button")).toHaveCount(4);
  await expect(page.locator("#下拉菜单-按钮下拉框").getByRole("button", { name: "已禁用", exact: true })).toBeDisabled();
  await expect(page.locator("#下拉菜单-按钮下拉框").getByRole("button", { name: "发布菜单已禁用" })).toBeDisabled();
  await expect(page.locator("#下拉菜单-按钮下拉框 .qizhi-dropdown-button--loading")).toHaveCount(1);
  await expect(page.locator("#下拉菜单-带图标的菜单 .qizhi-dropdown__item--icon svg")).toHaveCount(3);

  const openPopup = page.locator("#下拉菜单-多级菜单 > .demo .qizhi-dropdown > .qizhi-dropdown__popup");
  const clipping = await openPopup.evaluate((popup) => {
    const popupRect = popup.getBoundingClientRect();
    const chain: Array<{ tag: string; className: string; overflowX: string; overflowY: string; clipPath: string; contain: string; clipsPopup: boolean }> = [];
    let node: HTMLElement | null = popup.parentElement;
    while (node) {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      const clipsX = ["hidden", "clip"].includes(style.overflowX) && (popupRect.left < rect.left || popupRect.right > rect.right);
      const clipsY = ["hidden", "clip"].includes(style.overflowY) && (popupRect.top < rect.top || popupRect.bottom > rect.bottom);
      chain.push({ tag: node.tagName, className: node.className, overflowX: style.overflowX, overflowY: style.overflowY, clipPath: style.clipPath, contain: style.contain, clipsPopup: clipsX || clipsY || style.clipPath !== "none" });
      node = node.parentElement;
    }
    const clipped = chain.some((item) => item.clipsPopup);
    return { clipped, chain, rect: popupRect.toJSON() };
  });
  expect(clipping.clipped, JSON.stringify(clipping.chain, null, 2)).toBe(false);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("dropdown-open.png"), fullPage: true });
  expect(errors).toEqual([]);
});

test("Dropdown visual metrics match the frozen legacy implementation", async ({ page }, testInfo) => {
  await page.route("**/apps/qizhi-docs/src/dropdown/main.tsx*", (route) => route.abort());
  await page.goto("/#component-dropdown");
  const legacyTrigger = page.locator("#下拉菜单-基础用法 .qizhi-dropdown__trigger").first();
  await legacyTrigger.focus();
  await expect(page.locator("#下拉菜单-基础用法 .qizhi-dropdown__popup").first()).toBeVisible();
  const legacy = await readVisualMetrics(page);
  await page.screenshot({ path: testInfo.outputPath("dropdown-legacy.png"), fullPage: true });

  await page.unroute("**/apps/qizhi-docs/src/dropdown/main.tsx*");
  await page.goto("/?react-dropdown=1#component-dropdown");
  const reactTrigger = page.locator("#下拉菜单-基础用法 .qizhi-dropdown__trigger").first();
  await reactTrigger.focus();
  await expect(page.locator("#下拉菜单-基础用法 .qizhi-dropdown__popup").first()).toBeVisible();
  const react = await readVisualMetrics(page);
  await page.screenshot({ path: testInfo.outputPath("dropdown-react.png"), fullPage: true });

  expect(react).toEqual(legacy);
});

test("Dropdown API follows the shared documentation visual baseline", async ({ page }) => {
  await page.goto("/?react-dropdown=1#component-dropdown");
  const api = page.locator("#dropdown-API");
  const table = api.getByRole("table", { name: "Dropdown API" });
  await expect(api).toHaveClass(/qizhi-dropdown-api/);
  await expect(table).toBeVisible();

  const metrics = await api.evaluate((section) => {
    const table = section.querySelector("table");
    const heading = section.querySelector("h3");
    const header = section.querySelector("th");
    const cell = section.querySelector("td");
    const typeCode = section.querySelector("td:nth-child(3) code");
    if (!table || !heading || !header || !cell || !typeCode) return null;
    return {
      sectionMarginTop: getComputedStyle(section).marginTop,
      headingMargin: getComputedStyle(heading).margin,
      tableMinWidth: getComputedStyle(table).minWidth,
      borderCollapse: getComputedStyle(table).borderCollapse,
      headerBackground: getComputedStyle(header).backgroundColor,
      cellPadding: getComputedStyle(cell).padding,
      cellFontSize: getComputedStyle(cell).fontSize,
      typeColor: getComputedStyle(typeCode).color,
    };
  });

  expect(metrics).toEqual({
    sectionMarginTop: "64px",
    headingMargin: "48px 0px 24px",
    tableMinWidth: "760px",
    borderCollapse: "collapse",
    headerBackground: "rgb(247, 248, 250)",
    cellPadding: "14px 16px",
    cellFontSize: "14px",
    typeColor: "rgb(245, 49, 157)",
  });
});

test("Dropdown component tokens override owned visuals without changing cascade geometry", async ({ page }) => {
  await page.goto("/#component-dropdown");
  await page.evaluate(() => {
    const style = document.documentElement.style;
    const values = {
      "--component-dropdown-popup-background": "rgb(240, 245, 255)",
      "--component-dropdown-popup-border": "rgb(82, 196, 26)",
      "--component-dropdown-popup-min-width": "120px",
      "--component-dropdown-item-min-height": "36px",
      "--component-dropdown-item-padding-block": "7px",
      "--component-dropdown-item-padding-inline": "15px",
      "--component-dropdown-item-hover-background": "rgb(255, 247, 232)",
      "--component-dropdown-item-hover-text": "rgb(245, 63, 63)",
      "--component-dropdown-trigger-gap": "9px",
      "--component-dropdown-icon-size": "18px",
      "--component-dropdown-button-divider": "rgb(255, 0, 0)",
      "--component-dropdown-button-secondary-divider": "rgb(0, 0, 255)",
      "--component-dropdown-button-loading-background": "rgb(1, 2, 3)",
      "--component-dropdown-button-loading-motion-duration": "1200ms",
      "--component-dropdown-button-loading-motion-easing": "ease-in",
    };
    for (const [name, value] of Object.entries(values)) style.setProperty(name, value);
  });

  const buttons = page.locator("#下拉菜单-按钮下拉框 .qizhi-dropdown-button");
  await expect(buttons.nth(0).locator(".qizhi-dropdown-button__toggle")).toHaveCSS("border-left-color", "rgb(0, 0, 255)");
  await expect(buttons.nth(2).locator(".qizhi-dropdown-button__toggle")).toHaveCSS("border-left-color", "rgb(255, 0, 0)");
  const loadingToggle = buttons.nth(3).locator(".qizhi-dropdown-button__loading-toggle");
  await expect(loadingToggle).toHaveCSS("background-color", "rgb(1, 2, 3)");
  await expect(loadingToggle.locator(".qizhi-dropdown-button__loading-icon")).toHaveCSS("animation-duration", "1.2s");

  const cascade = page.locator("#下拉菜单-多级菜单 .demo");
  await cascade.getByRole("button", { name: "Click" }).click();
  const submenuTrigger = cascade.locator(".qizhi-dropdown__submenu-trigger").first();
  await submenuTrigger.hover();
  const submenu = cascade.locator(".qizhi-dropdown__submenu-popup").first();
  await expect(submenu).toBeVisible();
  const geometry = await submenu.evaluate((node) => {
    const parent = node.parentElement!;
    const popupRect = node.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    const opensLeft = parent.classList.contains("qizhi-dropdown__submenu--left");
    const gap = opensLeft ? parentRect.left - popupRect.right : popupRect.left - parentRect.right;
    return { gap: Math.round(gap), left: popupRect.left, right: popupRect.right, viewport: innerWidth };
  });
  expect(geometry.gap).toBe(4);
  expect(geometry.left).toBeGreaterThanOrEqual(0);
  expect(geometry.right).toBeLessThanOrEqual(geometry.viewport);
});
