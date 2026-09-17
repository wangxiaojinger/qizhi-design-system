import { expect, test } from "@playwright/test";

test("TopNavigation shows more only when its own available width overflows", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440");
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.setViewportSize({ width: 1800, height: 1000 });
  await page.goto("/#component-menu");
  const demo = page.locator("#顶部导航菜单 > .demo");
  const navigation = demo.locator(".qizhi-top-navigation");
  const overflow = navigation.getByRole("button", { name: /更多导航/ });

  await demo.evaluate((element) => {
    element.style.width = "1500px";
    element.style.maxWidth = "none";
  });
  await expect(overflow).toBeHidden();
  await navigation.screenshot({
    path: testInfo.outputPath("top-navigation-wide-without-overflow.png"),
  });

  await demo.evaluate((element) => {
    element.style.width = "760px";
  });
  await expect(overflow).toBeVisible();
  await overflow.click();
  const overflowMenu = navigation.getByRole("menu", {
    name: "更多导航菜单",
  });
  await expect(overflowMenu).toBeVisible();
  await expect(overflowMenu.getByRole("menuitem")).not.toHaveCount(0);
  const navigationBox = await navigation.boundingBox();
  const overflowMenuBox = await overflowMenu.boundingBox();
  await page.screenshot({
    path: testInfo.outputPath("top-navigation-narrow-with-overflow-open.png"),
    clip: {
      x: Math.min(navigationBox!.x, overflowMenuBox!.x),
      y: Math.min(navigationBox!.y, overflowMenuBox!.y),
      width: Math.max(
        navigationBox!.x + navigationBox!.width,
        overflowMenuBox!.x + overflowMenuBox!.width,
      ) - Math.min(navigationBox!.x, overflowMenuBox!.x),
      height: Math.max(
        navigationBox!.y + navigationBox!.height,
        overflowMenuBox!.y + overflowMenuBox!.height,
      ) - Math.min(navigationBox!.y, overflowMenuBox!.y),
    },
  });
  await page.keyboard.press("Escape");

  await demo.evaluate((element) => {
    element.style.width = "1500px";
  });
  await expect(overflow).toBeHidden();
  await expect.poll(() => navigation.locator(
    ".qizhi-top-navigation__scroll-area",
  ).evaluate((element) => element.scrollLeft)).toBe(0);
  expect(errors).toEqual([]);
});

test("Menu React Island preserves behavior, geometry, and source", async ({
  context,
  page,
}, testInfo) => {
  test.setTimeout(90_000);
  const screenshotName = (name: string) => (
    `${name}-${testInfo.project.name}.png`
  );
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/#component-menu");
  const viewport = page.viewportSize()!;
  const section = page.locator("#component-menu");
  await expect(page.getByRole("heading", { name: "菜单 Menu" })).toBeVisible();
  await expect(section.locator("article.codebox-wrapper")).toHaveCount(2);
  await expect(section.getByRole("table", { name: "Menu API" })).toBeVisible();

  const topArticle = section.locator("#顶部导航菜单");
  const captureTopDropdown = async () => {
    await expect(topArticle.locator(":scope > .demo"))
      .toHaveCSS("overflow", "visible");
    const articleBox = await topArticle.boundingBox();
    const popupBox = await topArticle.locator(
      ".qizhi-dropdown__popup:not([hidden])",
    ).boundingBox();
    const clipping = await topArticle.locator(
      ".qizhi-dropdown__popup:not([hidden])",
    ).evaluate((popup) => {
      const popupRect = popup.getBoundingClientRect();
      const failures: string[] = [];
      let ancestor = popup.parentElement;
      while (ancestor) {
        const style = window.getComputedStyle(ancestor);
        const clips = [style.overflow, style.overflowX, style.overflowY]
          .some((value) => ["hidden", "clip", "scroll", "auto"]
            .includes(value));
        if (clips) {
          const rect = ancestor.getBoundingClientRect();
          const outside = popupRect.left < rect.left
            || popupRect.right > rect.right
            || popupRect.top < rect.top
            || popupRect.bottom > rect.bottom;
          if (outside) failures.push(ancestor.className || ancestor.tagName);
        }
        ancestor = ancestor.parentElement;
      }
      return failures;
    });
    expect(clipping).toEqual([]);
    const x = Math.min(articleBox!.x, popupBox!.x);
    const y = Math.min(articleBox!.y, popupBox!.y);
    const right = Math.max(
      articleBox!.x + articleBox!.width,
      popupBox!.x + popupBox!.width,
    );
    const bottom = Math.max(
      articleBox!.y + articleBox!.height,
      popupBox!.y + popupBox!.height,
    );
    await page.screenshot({
      path: testInfo.outputPath(screenshotName("menu-top-dropdown-open")),
      clip: { x, y, width: right - x, height: bottom - y },
    });
  };
  const topMenu = topArticle.getByRole("menubar", { name: "顶部导航" });
  const modelService = topMenu.locator(
    '[data-menu-item-key="model-service"]',
  );
  const workbench = topMenu.locator('[data-menu-item-key="workbench"]');
  const isDirectlyVisible = async (item: typeof workbench) => (
    item.evaluate((node) => {
      const area = node.closest(".qizhi-top-navigation__scroll-area")!;
      const itemRect = node.getBoundingClientRect();
      const areaRect = area.getBoundingClientRect();
      return itemRect.left >= areaRect.left + 1
        && itemRect.right <= areaRect.right - 1;
    })
  );
  await expect(modelService).toHaveAttribute("aria-current", "page");
  const topNavigation = topArticle.locator(".qizhi-top-navigation");
  await expect(topNavigation).toHaveCSS("height", "56px");
  await expect(topNavigation).toHaveCSS(
    "background-color",
    "rgb(220, 232, 255)",
  );
  await expect(topArticle.locator(".qizhi-top-navigation__product"))
    .toHaveCSS("height", "32px");
  await expect(topArticle.locator(".qizhi-top-navigation__product"))
    .toHaveCSS("width", "72px");
  await expect(topArticle.locator(".qizhi-top-navigation__product"))
    .toHaveCSS("border-radius", "8px");
  await expect(topArticle.locator(".qizhi-top-navigation__logo"))
    .toHaveCSS("width", "24px");
  await expect(topArticle.locator(".qizhi-top-navigation__logo img"))
    .toHaveCSS("width", "16px");
  await expect(topArticle.locator(".qizhi-top-navigation__region"))
    .toHaveCSS("height", "32px");
  await expect(topArticle.locator(".qizhi-top-navigation__region"))
    .toHaveCSS("border-radius", "8px");
  const regionWrap = topArticle.locator(".qizhi-top-navigation__region-wrap");
  if (await regionWrap.isVisible()) {
    const brandRegionGap = await topArticle.evaluate((article) => {
      const tenant = article.querySelector<HTMLElement>(".qizhi-top-navigation__tenant");
      const region = article.querySelector<HTMLElement>(".qizhi-top-navigation__region-wrap");
      if (!tenant || !region) return null;
      const tenantRect = tenant.getBoundingClientRect();
      const regionRect = region.getBoundingClientRect();
      return regionRect.left - tenantRect.right;
    });
    expect(brandRegionGap).toBe(20);
  }
  await expect(modelService).toHaveCSS("height", "32px");
  await expect(modelService).toHaveCSS("border-radius", "8px");
  await expect(topArticle.locator(".qizhi-top-navigation__avatar"))
    .toHaveCSS("width", "32px");
  await expect(topArticle.locator(".qizhi-top-navigation__avatar"))
    .toHaveCSS("border-radius", "50%");
  await topArticle.screenshot({
    path: testInfo.outputPath(screenshotName("menu-top-reference-state")),
  });
  const customModel = topMenu.locator(
    '[data-menu-item-key="custom-model"]',
  );
  if (await isDirectlyVisible(workbench)) {
    await workbench.click();
    await expect(workbench).toHaveAttribute("aria-current", "page");
    await expect(workbench).toHaveCSS("color", "rgb(47, 84, 235)");
    const restingBackground = await customModel.evaluate((node) => (
      getComputedStyle(node).backgroundColor
    ));
    await customModel.hover();
    await expect.poll(() => customModel.evaluate((node) => (
      getComputedStyle(node).backgroundColor
    ))).not.toBe(restingBackground);
    await customModel.hover();
    await page.mouse.down();
    const activeBackground = await customModel.evaluate((node) => (
      getComputedStyle(node).backgroundColor
    ));
    expect(activeBackground).not.toBe(restingBackground);
    await page.mouse.move(0, 0);
    await page.mouse.up();
  }
  for (const item of await topMenu.getByRole("menuitem").all()) {
    if (!await item.isVisible()) continue;
    await expect.poll(() => item.locator(
      ".qizhi-menu__item-label",
    ).evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
  }

  if (await isDirectlyVisible(workbench)) {
    await workbench.focus();
    await workbench.press("End");
    const endFocus = page.locator(":focus");
    await expect(endFocus).toHaveRole("menuitem");
    await expect(endFocus).toBeVisible();
    await endFocus.press("Home");
    await expect(workbench).toBeFocused();
    await workbench.press("ArrowRight");
    await expect(customModel).toBeFocused();
    await expect(customModel).toHaveCSS("outline-style", "solid");
    await expect(workbench).toHaveAttribute("aria-current", "page");
  }

  const region = topArticle.locator(".qizhi-top-navigation__region");
  if (await region.isVisible()) {
    await region.click();
    const longRegion = topArticle.getByRole("menuitemradio", {
      name: "张江科研二号楼1楼404机房",
    });
    await expect(longRegion).toBeVisible();
    await expect(topArticle.getByRole("menuitemradio", {
      name: "张江科研三号楼机房",
    })).toBeDisabled();
    await captureTopDropdown();
    await longRegion.click();
    await expect(region).toContainText("张江");
    await expect(region).toBeFocused();
    await region.click();
    await page.keyboard.press("Escape");
    await expect(region).toHaveAttribute("aria-expanded", "false");
    await expect(region).toBeFocused();
  }

  const overflow = topArticle.getByRole("button", { name: /更多导航/ });
  if (await overflow.isVisible()) {
    const clippedLabels = await topMenu.getByRole("menuitem")
      .evaluateAll((items) => {
        const area = items[0]?.closest(".qizhi-top-navigation__scroll-area");
        if (!area) return [];
        const areaRect = area.getBoundingClientRect();
        return items.filter((item) => {
          const rect = item.getBoundingClientRect();
          return rect.left < areaRect.left + 1
            || rect.right > areaRect.right - 1;
        }).map((item) => item.textContent?.trim());
    });
    await expect(overflow).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(overflow).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await overflow.hover();
    await expect(overflow).toHaveCSS("background-color", "rgba(0, 0, 0, 0.04)");
    await topArticle.screenshot({
      path: testInfo.outputPath(screenshotName("menu-top-overflow-hover")),
    });
    await overflow.click();
    await page.mouse.move(0, 0);
    await expect(overflow).toHaveAttribute("aria-expanded", "true");
    await expect(overflow).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await captureTopDropdown();
    const overflowItems = topArticle.getByRole("menu", {
      name: "更多导航菜单",
    }).getByRole("menuitem");
    await expect(overflowItems).toHaveCount(clippedLabels.length);
    await expect(overflowItems.allTextContents()).resolves.toEqual(
      clippedLabels,
    );
    await topArticle.getByRole("menuitem", { name: "探索" }).last().click();
    await expect(topMenu.locator(".qizhi-top-navigation__item--explore"))
      .toHaveAttribute("aria-current", "page");
    const exploreIsClipped = await isDirectlyVisible(
      topMenu.locator('[data-menu-item-key="explore"]'),
    ).then((visible) => !visible);
    const updatedOverflow = topArticle.getByRole("button", {
      name: "更多导航，当前：探索",
    });
    if (exploreIsClipped) {
      await expect(updatedOverflow).toHaveAttribute("aria-current", "page");
      await page.mouse.move(0, 0);
      await expect(updatedOverflow).toHaveCSS(
        "background-color",
        "rgba(0, 0, 0, 0)",
      );
    } else {
      await expect(updatedOverflow).not.toHaveAttribute("aria-current");
    }
    const visibleMenuTabStops = await (async () => {
      const items = await topMenu.getByRole("menuitem").all();
      let visibleTabStops = 0;
      for (const item of items) {
        if (await item.isVisible() && await item.getAttribute("tabindex") === "0") {
          visibleTabStops += 1;
        }
      }
      return visibleTabStops;
    })();
    if (await topMenu.getByRole("menuitem").count() > 0) {
      expect(visibleMenuTabStops).toBe(1);
    } else {
      await overflow.focus();
      await expect(overflow).toBeFocused();
    }
    await overflow.click();
    await page.keyboard.press("Escape");
    await expect(overflow).toHaveAttribute("aria-expanded", "false");
    await expect(overflow).toBeFocused();
  }

  const language = topArticle.locator(".qizhi-top-navigation__language");
  if (await language.isVisible()) {
    await language.click();
    await page.keyboard.press("Escape");
    await expect(language).toHaveAttribute("aria-expanded", "false");
    await expect(language).toBeFocused();
    await language.click();
    await topArticle.getByRole("menuitemradio", { name: "English" }).click();
    await expect(language).toContainText("English");
    await language.click();
    await topArticle.getByRole("menuitemradio", { name: "中文" }).click();
    await expect(language).toContainText("中文");
    await language.click();
    await topArticle.locator(".qizhi-top-navigation__brand").click();
    await expect(language).toHaveAttribute("aria-expanded", "false");
  }

  await topArticle.screenshot({
    path: testInfo.outputPath(screenshotName("menu-top-default")),
  });

  const sideArticle = section.locator("#左侧菜单");
  const sideViewport = sideArticle.locator(".qizhi-side-navigation");
  const sideContent = sideArticle.locator(".qizhi-side-navigation__content");
  const demoContentWidth = await sideArticle.locator(":scope > .demo")
    .evaluate((node) => {
      const style = window.getComputedStyle(node);
      return node.clientWidth
        - Number.parseFloat(style.paddingLeft)
        - Number.parseFloat(style.paddingRight);
    });
  const viewportBox = await sideViewport.boundingBox();
  const contentBox = await sideContent.boundingBox();
  const expectedViewportWidth = Math.min(210, demoContentWidth);
  const expectedContentWidth = Math.min(166, expectedViewportWidth - 44);
  expect(viewportBox!.width).toBeCloseTo(expectedViewportWidth, 0);
  expect(viewportBox!.height).toBeCloseTo(800, 0);
  expect(contentBox!.width).toBeCloseTo(expectedContentWidth, 0);
  expect(contentBox!.x - viewportBox!.x).toBeCloseTo(24, 0);
  expect(contentBox!.y - viewportBox!.y).toBeCloseTo(54, 0);
  expect(viewportBox!.width).toBeLessThanOrEqual(demoContentWidth);
  const sideMenu = sideArticle.getByRole("menu", { name: "空间导航" });
  await expect(sideViewport).toHaveCSS("overflow", "visible");
  await expect.poll(() => sideMenu.evaluate((node) => ({
    overflowY: window.getComputedStyle(node).overflowY,
    standard: window.getComputedStyle(node).scrollbarWidth,
    webkit: window.getComputedStyle(node, "::-webkit-scrollbar").display,
  }))).toEqual({ overflowY: "auto", standard: "none", webkit: "none" });
  const overview = sideMenu.getByRole("menuitem", { name: "空间概览" });
  const interactive = sideMenu.getByRole("menuitem", {
    name: "交互式建模",
  });
  await expect(interactive).toHaveAttribute("aria-current", "page");
  await expect(sideArticle.locator(".qizhi-side-navigation__workspace"))
    .toHaveCSS("padding", "8px 12px");
  await expect(overview.locator(".qizhi-side-navigation__icon"))
    .toHaveCSS("color", "rgb(78, 89, 105)");
  await expect(interactive.locator(".qizhi-side-navigation__icon"))
    .toHaveCSS("color", "rgb(29, 33, 41)");
  await expect(overview.locator(".qizhi-side-navigation__icon path").first())
    .toHaveCSS("fill-opacity", "1");
  await expect(interactive.locator(".qizhi-side-navigation__icon path").first())
    .toHaveCSS("fill-opacity", "1");
  const files = sideMenu.getByRole("menuitem", { name: "文件" });
  await files.hover();
  await expect(files).toHaveCSS(
    "background-color",
    "rgba(51, 102, 255, 0.04)",
  );
  await expect(files).toHaveCSS("color", "rgb(51, 102, 255)");
  await sideArticle.screenshot({
    path: testInfo.outputPath(screenshotName("menu-side-hover")),
  });
  const disabledTask = sideMenu.getByRole("menuitem", {
    name: "评测任务",
  });
  await disabledTask.hover({ force: true });
  await expect(disabledTask).toHaveCSS(
    "background-color",
    "rgba(0, 0, 0, 0)",
  );
  await interactive.focus();
  await interactive.press("ArrowDown");
  await expect(sideMenu.getByRole("menuitem", { name: "分布式训练" }))
    .toBeFocused();
  await page.keyboard.press("End");
  await expect(sideMenu.getByRole("menuitem", { name: "模型仓库" }))
    .toBeFocused();
  await page.keyboard.press("Home");
  await expect(overview).toBeFocused();
  await expect(interactive).toHaveAttribute("aria-current", "page");
  for (const label of [
    "可视化建模",
    "评测任务",
    "评测报告",
    "数据集",
    "评测task",
  ]) {
    await expect(sideMenu.getByRole("menuitem", { name: label }))
      .toBeDisabled();
  }

  const workspace = sideArticle.locator(".qizhi-side-navigation__workspace");
  await workspace.click();
  await page.keyboard.press("Escape");
  await expect(workspace).toHaveAttribute("aria-expanded", "false");
  await expect(workspace).toBeFocused();
  await workspace.click();
  const alternateWorkspace = sideArticle.getByRole("menuitemradio", {
    name: "启智公共云长名称测试空间",
  });
  await expect(alternateWorkspace).toHaveAttribute("aria-checked", "false");
  await sideArticle.screenshot({
    path: testInfo.outputPath(screenshotName("menu-side-workspace-open")),
  });
  await alternateWorkspace.click();
  await expect(workspace).toContainText("启智公共云长名称测试空间");
  await expect(workspace).toBeFocused();

  await sideArticle.screenshot({
    path: testInfo.outputPath(screenshotName("menu-side-default")),
  });
  if (viewport.width === 375) {
    await section.screenshot({
      path: testInfo.outputPath(screenshotName("menu-mobile-375")),
    });
  }

  const firstArticle = section.locator("article.codebox-wrapper").first();
  await expect(firstArticle.locator(":scope > .demo"))
    .toHaveCSS("margin-bottom", "12px");
  await expect(firstArticle.locator(":scope > .component-example-actions"))
    .toHaveCSS("padding-right", "0px");
  for (const article of await section.locator("article.codebox-wrapper").all()) {
    await article.getByRole("button", { name: "查看代码" }).click();
    const displayed = article.locator("pre");
    await article.getByRole("button", { name: "复制代码" }).click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toBe(await displayed.innerText());
  }

  for (const article of await section.locator("article.codebox-wrapper").all()) {
    await expect.poll(() => article.evaluate((node) => (
      node.scrollWidth <= node.clientWidth
    ))).toBe(true);
  }
  await expect.poll(() => page.evaluate(() => (
    document.documentElement.scrollWidth
      <= document.documentElement.clientWidth
  ))).toBe(true);
  expect(errors).toEqual([]);
});
