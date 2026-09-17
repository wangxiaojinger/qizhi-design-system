import { expect, test } from "@playwright/test";

test("Layout preserves legacy geometry and reuses Menu navigation components", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#component-layout");
  const section = page.locator("#component-layout");

  await expect(section.getByRole("heading", { name: "布局 Layout" })).toBeVisible();
  await expect(section.locator("article.codebox-wrapper")).toHaveCount(3);
  await expect(section.locator(".component-example-actions .qizhi-code-action")).toHaveCount(6);
  await expect(section.getByRole("table", { name: "Layout API" })).toBeVisible();

  const shells = section.locator("#layout-basic .layout-basic-demo > .qizhi-layout");
  await expect(shells).toHaveCount(2);
  await expect(shells.first().locator(":scope > .qizhi-layout__header")).toHaveCSS("height", "56px");
  await expect(shells.first().locator(":scope > .qizhi-layout__footer")).toHaveCSS("height", "56px");
  await expect(shells.nth(1).locator(".qizhi-layout__sider")).toHaveCSS(
    "width",
    testInfo.project.name === "mobile-375" ? "96px" : "184px",
  );
  await expect(shells.first().locator(".qizhi-layout__content")).toHaveCSS(
    "min-height",
    testInfo.project.name === "mobile-375" ? "173px" : "304px",
  );

  const framework = section.locator(
    "#layout-framework-preview .qizhi-platform-shell.layout-framework-demo",
  );
  await expect(framework).toHaveCount(1);
  await expect(framework.locator(":scope > .qizhi-platform-shell__header"))
    .toHaveCSS("height", "56px");
  await expect(framework.locator(".qizhi-platform-shell__main"))
    .toHaveCSS("padding-left", "24px");
  await expect(framework.locator(".qizhi-top-navigation")).toHaveCount(1);
  await expect(framework.locator(".qizhi-side-navigation")).toHaveCount(0);
  const frameworkOverflow = framework.getByRole("button", {
    name: /更多导航/,
  });
  if (await frameworkOverflow.isVisible()) {
    await framework.getByRole("menuitem", { name: "探索", exact: true })
      .first().click({ force: true });
    await expect(framework.getByRole("menuitem", { name: "探索", exact: true })
      .first()).toHaveAttribute("aria-current", "page");
    await framework.locator(".qizhi-top-navigation__scroll-area").evaluate((area) => {
      area.scrollLeft = 0;
      area.dispatchEvent(new Event("scroll"));
    });
    await expect(frameworkOverflow).toHaveAttribute("aria-current", "page");
    await page.mouse.move(0, 0);
    await expect(frameworkOverflow).toHaveCSS(
      "background-color",
      "rgba(0, 0, 0, 0)",
    );
    await frameworkOverflow.hover();
    await expect(frameworkOverflow).toHaveCSS(
      "background-color",
      "rgba(0, 0, 0, 0.04)",
    );
    await framework.getByRole("menuitem", { name: "工作台", exact: true })
      .first().click({ force: true });
  }
  await framework.getByRole("menuitem", { name: "定制模型" }).click();
  await expect(framework.locator(".qizhi-platform-shell__main"))
    .toHaveCSS("padding-left", "0px");
  await expect(framework.locator(".qizhi-side-navigation")).toHaveCount(1);
  const frameworkSider = framework.locator(".qizhi-platform-shell__sider");
  if (testInfo.project.name === "mobile-375") {
    await expect(frameworkSider).toHaveCSS("position", "static");
    await expect(frameworkSider).toHaveCSS("min-height", "0px");
    await expect(framework.locator(".qizhi-side-navigation"))
      .toHaveCSS("min-height", "0px");
    await expect.poll(async () => {
      const [siderWidth, bodyWidth] = await Promise.all([
        frameworkSider.evaluate((node) => node.getBoundingClientRect().width),
        framework.locator(":scope > .qizhi-platform-shell__body")
          .evaluate((node) => node.getBoundingClientRect().width),
      ]);
      return Math.abs(siderWidth - bodyWidth);
    }).toBeLessThan(0.5);
  } else {
    await expect(frameworkSider).toHaveCSS("position", "sticky");
    await expect(frameworkSider).toHaveCSS("top", "56px");
    await expect(frameworkSider).toHaveCSS("width", "210px");
    await expect(frameworkSider).toHaveCSS(
      "min-height",
      `${page.viewportSize()!.height - 56}px`,
    );
    await expect.poll(async () => {
      const [siderBox, navigationBox] = await Promise.all([
        frameworkSider.boundingBox(),
        framework.locator(".qizhi-side-navigation").boundingBox(),
      ]);
      return Math.abs(siderBox!.height - navigationBox!.height);
    }).toBeLessThan(0.5);
  }
  await expect(framework.locator(".qizhi-side-navigation")).toHaveCSS("overflow", "visible");
  await expect.poll(() => framework.getByRole("menu", { name: "空间导航" }).evaluate((node) => ({
    overflowY: window.getComputedStyle(node).overflowY,
    standard: window.getComputedStyle(node).scrollbarWidth,
    webkit: window.getComputedStyle(node, "::-webkit-scrollbar").display,
  }))).toEqual({ overflowY: "auto", standard: "none", webkit: "none" });
  const workspace = framework.locator(".qizhi-side-navigation__workspace");
  await workspace.click();
  const workspacePopup = framework.locator(".qizhi-dropdown__popup:not([hidden])");
  await expect(workspacePopup).toBeVisible();
  await expect.poll(() => workspacePopup.evaluate((popup) => {
    const rect = popup.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.right - 2, rect.top + rect.height / 2);
    return Boolean(hit && popup.contains(hit));
  })).toBe(true);
  await framework.screenshot({ path: testInfo.outputPath(`layout-framework-workspace-open-${testInfo.project.name}.png`) });
  await page.keyboard.press("Escape");
  await expect(workspacePopup).toBeHidden();
  await expect(workspace).toBeFocused();
  await expect(framework.getByRole("menu", { name: "空间导航" })).toBeVisible();
  await expect(framework.getByRole("menuitem", { name: "交互式建模" })).toHaveAttribute("aria-current", "page");
  const modeExpectations = [
    ["模型服务", "模型部署"],
    ["Agent", "Skills 工坊"],
    ["探索", "模型广场"],
    ["运营中心", "资源概览"],
  ] as const;
  for (const [topItem, sideItem] of modeExpectations) {
    await framework.getByRole("menuitem", { name: topItem, exact: true }).click();
    await expect(framework.getByRole("menuitem", { name: sideItem, exact: true })).toHaveAttribute("aria-current", "page");
  }
  await framework.getByRole("menuitem", { name: "定制模型" }).click();
  await framework.screenshot({ path: testInfo.outputPath(`layout-framework-sidebar-${testInfo.project.name}.png`) });
  await framework.getByRole("menuitem", { name: "工作台" }).click();
  await expect(framework.locator(".qizhi-side-navigation")).toHaveCount(0);
  await expect(framework.locator(".qizhi-platform-shell__main"))
    .toHaveCSS("padding-left", "24px");

  const overflow = await section.evaluate((node) => ({ client: node.clientWidth, scroll: node.scrollWidth }));
  expect(overflow.scroll).toBeLessThanOrEqual(overflow.client);
  await section.screenshot({ path: testInfo.outputPath(`layout-${testInfo.project.name}.png`) });
  expect(errors).toEqual([]);
});
