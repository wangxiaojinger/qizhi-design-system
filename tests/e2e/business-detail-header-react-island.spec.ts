import { expect, test } from "@playwright/test";

test("Business detail header preserves the legacy contract", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#business-detail-header");
  const section = page.locator("#business-detail-header");
  await expect(section.getByRole("heading", { name: "详情头部", exact: true })).toBeVisible();
  await expect(section.locator(".codebox-wrapper")).toHaveCount(2);
  await expect(section.locator(".component-example-actions .qizhi-code-action")).toHaveCount(2);
  await expect(section.getByRole("table", { name: "ServiceDetailHeader API", exact: true }))
    .toBeVisible();
  await expect(section.getByRole("table", { name: "DetailHeader API", exact: true }))
    .toBeVisible();
  if (testInfo.project.name === "desktop-1440") {
    await expect(page.locator(".toc .toc-link")).toHaveText(["基本用法", "交互说明", "API"]);
    await expect(section.locator(".qizhi-detail-header")).toHaveCSS("min-height", "174px");
    await expect(section.locator(".qizhi-detail-header__icon")).toHaveCSS("width", "58px");
    await expect(section.locator(".qizhi-detail-header")).toHaveJSProperty("offsetHeight", 178);
  }

  const header = section.locator(".qizhi-detail-header");
  const leftAlignment = await section.evaluate((node) => {
    const title = node.querySelector<HTMLElement>(".qizhi-detail-header__title-row h2")!;
    const tabLabel = node.querySelector<HTMLElement>(".qizhi-service-detail-header__tabs .qizhi-tabs__tab-label")!;
    return {
      titleLeft: title.getBoundingClientRect().left,
      tabLeft: tabLabel.getBoundingClientRect().left,
    };
  });
  expect(Math.abs(leftAlignment.titleLeft - leftAlignment.tabLeft)).toBeLessThanOrEqual(0.5);
  await expect(header).toHaveCSS("border-radius", "8px");
  await expect(section.locator("#detail-header-basic-panel, #detail-header-api-panel")).toHaveCount(0);
  await expect(section.locator(".qizhi-detail-header__tabs")).toHaveCSS("margin-top", "16px");
  await expect(section.locator(".qizhi-service-detail-header__tabs .qizhi-tabs__nav-scroll"))
    .toHaveCSS("border-bottom-width", "0px");

  if (testInfo.project.name === "mobile-375") {
    await expect(section.locator(".detail-header-preview")).toHaveCSS("padding", "16px");
    const geometry = await section.evaluate((node) => {
      const demo = node.querySelector<HTMLElement>(".detail-header-preview")!;
      const article = node.querySelector<HTMLElement>(".qizhi-detail-header")!;
      return {
        demoContentWidth: demo.clientWidth - 32,
        articleWidth: article.getBoundingClientRect().width,
      };
    });
    expect(geometry.articleWidth).toBe(geometry.demoContentWidth);
  }

  const toggle = section.getByRole("button", { name: "下线" });
  await expect(section.getByText("服务中", { exact: true })).toBeVisible();
  await toggle.click();
  await expect(section.getByText("已下线", { exact: true })).toBeVisible();
  const offlineColors = await section.evaluate((node) => ({
    actual: getComputedStyle(node.querySelector<HTMLElement>(".qizhi-detail-header__status-dot")!).backgroundColor,
  }));
  expect(offlineColors.actual).toBe("rgb(201, 205, 212)");
  await section.locator(".detail-header-preview").screenshot({
    path: testInfo.outputPath(`business-detail-header-offline-${testInfo.project.name}.png`),
  });
  await section.getByRole("button", { name: "上线" }).click();
  await expect(section.getByText("服务中", { exact: true })).toBeVisible();

  const creator = section.locator(".qizhi-service-detail-header__audit-icon").first();
  const maintainer = section.locator(".qizhi-service-detail-header__audit-icon").nth(1);
  const createdAt = section.locator(".qizhi-service-detail-header__audit-icon").nth(2);
  for (const icon of [creator, maintainer, createdAt]) {
    await expect(icon.locator("path").first()).toHaveCSS("fill-opacity", "1");
  }
  const auditIconColors = await Promise.all([creator, createdAt].map((icon) => icon.evaluate((node) => ({
    color: getComputedStyle(node).color,
    fill: getComputedStyle(node.querySelector("path")!).fill,
  }))));
  expect(auditIconColors[1]).toEqual(auditIconColors[0]);
  await creator.hover();
  await expect(page.getByRole("tooltip", { name: "创建人" })).toBeVisible();
  if (testInfo.project.name === "desktop-1440") {
    await page.screenshot({
      path: testInfo.outputPath("business-detail-header-tooltip-desktop-1440.png"),
    });
  }
  await creator.focus();
  await expect(page.getByRole("tooltip", { name: "创建人" })).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(page.getByRole("tooltip", { name: "创建人" })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("tooltip", { name: "创建人" })).toBeHidden();

  const avatarColors = await section.locator(".qizhi-service-detail-header__maintainers .qizhi-avatar")
    .evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).backgroundColor));
  expect(avatarColors).toEqual(["rgb(51, 102, 255)", "rgb(52, 145, 250)", "rgb(20, 201, 201)"]);
  for (const avatar of await section.locator(".qizhi-service-detail-header__maintainers .qizhi-avatar").all()) {
    await expect(avatar).toHaveCSS("border-width", "1px");
  }
  const basicTab = section.getByRole("tab", { name: "基本信息" });
  const apiTab = section.getByRole("tab", { name: "API调用" });
  await basicTab.focus();
  await basicTab.press("ArrowRight");
  await expect(apiTab).toHaveAttribute("aria-selected", "true");
  await expect(apiTab).toBeFocused();
  await expect(section.getByText("当前展示基本信息内容。")).toHaveCount(0);
  await expect(section.getByText("当前展示 API 调用内容。")).toHaveCount(0);

  const version = section.getByRole("button", { name: /查看部署版本/ });
  const versionColors = await version.evaluate((node) => ({
    text: getComputedStyle(node).color,
    icon: getComputedStyle(node.querySelector("svg")!).color,
    opacity: getComputedStyle(node.querySelector("path")!).fillOpacity,
  }));
  expect(versionColors.icon).toBe(versionColors.text);
  expect(versionColors.opacity).toBe("1");
  await version.click();
  const drawer = page.getByRole("dialog", { name: "版本列表" });
  await expect(drawer).toBeVisible();
  if (testInfo.project.name === "desktop-1440") {
    await expect(drawer).toHaveCSS("width", "960px");
  } else {
    const drawerWidth = await drawer.evaluate((node) => node.getBoundingClientRect().width);
    expect(drawerWidth).toBeLessThanOrEqual(page.viewportSize()!.width);
  }
  await expect(drawer.getByRole("table", { name: "版本信息" })).toBeVisible();
  await expect(drawer.getByRole("row", { name: /V3/ }).getByText("当前版本")).toBeVisible();
  if (testInfo.project.name === "desktop-1440") {
    await page.screenshot({
      path: testInfo.outputPath("business-detail-header-drawer-desktop-1440.png"),
    });
  }
  await drawer.getByRole("button", { name: "回滚至此版本", exact: true }).last().click();
  await expect(drawer).toHaveCount(0);
  await expect(version).toBeFocused();

  await version.click();
  if (testInfo.project.name === "mobile-375") {
    await drawer.getByRole("button", { name: "关闭抽屉" }).click();
  } else {
    await page.getByRole("button", { name: "关闭抽屉遮罩" })
      .click({ position: { x: 16, y: 16 } });
  }
  await expect(drawer).toHaveCount(0);
  await expect(version).toBeFocused();

  await version.click();
  await page.keyboard.press("Escape");
  await expect(drawer).toHaveCount(0);
  await expect(version).toBeFocused();

  const overflow = await section.evaluate((node) => ({ client: node.clientWidth, scroll: node.scrollWidth }));
  expect(overflow.scroll).toBeLessThanOrEqual(overflow.client);
  await section.locator(".detail-header-preview").screenshot({
    path: testInfo.outputPath(`business-detail-header-${testInfo.project.name}.png`),
  });
  expect(errors).toEqual([]);
});
