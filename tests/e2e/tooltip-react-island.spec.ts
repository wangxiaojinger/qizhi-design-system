import { expect, test } from "@playwright/test";

test("Tooltip 锁定五组旧站 Demo 与三档视觉交互契约", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/#component-tooltip");
  await expect(page.getByRole("heading", { name: "文字气泡 Tooltip" }))
    .toBeVisible();
  const articles = page.locator(
    "#component-tooltip article.codebox-wrapper",
  );
  await expect(articles).toHaveCount(5);
  await expect(articles.locator(".qz-demo-title a")).toHaveText([
    "基础用法",
    "迷你尺寸",
    "位置",
    "受控模式",
    "不同颜色",
  ]);
  await expect(page.getByRole("table", { name: "Tooltip API" }))
    .toBeVisible();
  await expect(page.locator("#文字气泡-受控模式").getByRole("switch", {
    name: "显示气泡",
  })).toHaveAttribute("aria-checked", "true");
  await expect(page.getByRole("tooltip")).toHaveCount(0);

  const expectedHeights = testInfo.project.name === "mobile-375"
    ? [234, 130, 370, 224, 322]
    : [194, 130, 378, 224, 130];
  const demoHeights = await articles.locator(":scope > .demo")
    .evaluateAll((demos) => demos.map((demo) => (
      Math.round(demo.getBoundingClientRect().height)
    )));
  expect(demoHeights).toEqual(expectedHeights);

  const basic = page.locator("#文字气泡-基础用法");
  const basicTriggers = basic.locator(".qizhi-typography-text");
  await basicTriggers.first().hover();
  const basicTooltip = page.locator(
    `#${await basicTriggers.first().getAttribute("aria-describedby")}`,
  );
  await expect(basicTooltip).toBeVisible();
  await expect(basicTooltip).toHaveCSS("font-size", "14px");
  await expect(basicTooltip).toHaveCSS("line-height", "20px");
  const basicRect = await basicTooltip.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return { width: Math.round(rect.width), height: Math.round(rect.height) };
  });
  expect(basicRect).toEqual({ width: 164, height: 32 });

  await basicTriggers.first().click();
  await page.mouse.move(0, 0);
  await expect(basicTooltip).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(basicTooltip).toHaveCount(0);

  await basicTriggers.nth(1).focus();
  const wideTooltip = page.locator(
    `#${await basicTriggers.nth(1).getAttribute("aria-describedby")}`,
  );
  await expect(wideTooltip).toBeVisible();
  const wideRect = await wideTooltip.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return { width: Math.round(rect.width), height: Math.round(rect.height) };
  });
  expect(wideRect).toEqual({ width: 350, height: 52 });
  expect(await wideTooltip.evaluate((node) => node.parentElement === document.body))
    .toBe(true);
  const wideViewportBounds = await wideTooltip.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    };
  });
  expect(wideViewportBounds.left).toBeGreaterThanOrEqual(8);
  expect(wideViewportBounds.right).toBeLessThanOrEqual(
    wideViewportBounds.viewportWidth - 8,
  );
  expect(wideViewportBounds.top).toBeGreaterThanOrEqual(8);
  expect(wideViewportBounds.bottom).toBeLessThanOrEqual(
    wideViewportBounds.viewportHeight - 8,
  );
  await page.waitForTimeout(200);
  await page.screenshot({
    path: testInfo.outputPath(`tooltip-open-${testInfo.project.name}.png`),
  });
  await page.keyboard.press("Escape");

  const miniTrigger = page.locator(
    "#文字气泡-迷你尺寸 .qizhi-typography-text",
  );
  await miniTrigger.hover();
  const miniTooltip = page.getByRole("tooltip", { name: "123456789" });
  await expect(miniTooltip).toBeVisible();
  const miniRect = await miniTooltip.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return { width: Math.round(rect.width), height: Math.round(rect.height) };
  });
  expect(miniRect).toEqual({ width: 112, height: 34 });
  await page.keyboard.press("Escape");

  const placements = [
    ["topLeft", "TL"], ["top", "Top"], ["topRight", "TR"],
    ["leftTop", "LT"], ["left", "Left"], ["leftBottom", "LB"],
    ["rightTop", "RT"], ["right", "Right"],
    ["rightBottom", "RB"], ["bottomLeft", "BL"],
    ["bottom", "Bottom"], ["bottomRight", "BR"],
  ];
  const positionButtons = page.locator(
    "#文字气泡-位置 .tooltip-docs-placement .qizhi-btn",
  );
  await expect(positionButtons).toHaveCount(12);
  for (let index = 0; index < placements.length; index += 1) {
    const button = positionButtons.nth(index);
    const [position, label] = placements[index];
    await expect(button).toHaveText(label);
    await button.hover();
    const tooltip = page.getByRole("tooltip", {
      name: "This is a Tooltip",
      exact: true,
    });
    await expect(tooltip).toHaveAttribute("data-tooltip-position", position);
    const [buttonRect, tooltipRect] = await Promise.all([
      button.boundingBox(),
      tooltip.boundingBox(),
    ]);
    const arrowRect = await tooltip.locator(".qizhi-tooltip__arrow")
      .boundingBox();
    if (position.startsWith("left")) {
      expect((tooltipRect?.x ?? 0) + (tooltipRect?.width ?? 0))
        .toBeLessThanOrEqual(buttonRect?.x ?? 0);
    }
    if (position.startsWith("right")) {
      expect(tooltipRect?.x).toBeGreaterThanOrEqual(
        (buttonRect?.x ?? 0) + (buttonRect?.width ?? 0),
      );
    }
    if (position.startsWith("left") || position.startsWith("right")) {
      const arrowCenter = (arrowRect?.y ?? 0) + (arrowRect?.height ?? 0) / 2;
      const triggerCenter = (buttonRect?.y ?? 0) + (buttonRect?.height ?? 0) / 2;
      expect(Math.abs(arrowCenter - triggerCenter)).toBeLessThanOrEqual(1);
    }
    if (position === "rightBottom") {
      await page.waitForTimeout(200);
      await page.locator("#文字气泡-位置").screenshot({
        path: testInfo.outputPath(
          `tooltip-placement-${testInfo.project.name}.png`,
        ),
      });
    }
    await page.keyboard.press("Escape");
  }

  const controlled = page.locator("#文字气泡-受控模式");
  await controlled.scrollIntoViewIfNeeded();
  const controlledSwitch = controlled.getByRole("switch", {
    name: "显示气泡",
  });
  const controlledTrigger = controlled.getByRole("button", {
    name: "气泡将显示",
  });
  const controlledTooltip = page.locator(
    `#${await controlledTrigger.getAttribute("aria-describedby")}`,
  );
  await expect(controlledSwitch).toHaveAttribute("aria-checked", "true");
  await expect(controlledTooltip).toBeVisible();
  await controlledSwitch.click();
  await expect(controlledSwitch).toHaveAttribute("aria-checked", "false");
  await expect(controlledTooltip).toHaveCount(0);

  const expectedColors = [
    "rgb(51, 102, 255)",
    "rgb(82, 196, 26)",
    "rgb(255, 125, 0)",
    "rgb(255, 77, 79)",
    "rgb(107, 119, 133)",
  ];
  const colorTriggers = page.locator(
    "#文字气泡-不同颜色 .tooltip-docs-color-trigger",
  );
  for (let index = 0; index < expectedColors.length; index += 1) {
    await colorTriggers.nth(index).hover();
    await expect(page.getByRole("tooltip").locator(".qizhi-tooltip__container")).toHaveCSS(
      "background-color",
      expectedColors[index],
    );
    await page.keyboard.press("Escape");
  }

  const overflows = await articles.locator(":scope > .demo")
    .evaluateAll((demos) => demos.map((demo) => ({
      id: demo.parentElement?.id,
      clientWidth: demo.clientWidth,
      scrollWidth: demo.scrollWidth,
    })).filter((demo) => demo.scrollWidth > demo.clientWidth + 1));
  expect(overflows).toEqual([]);
  expect(await page.evaluate(() => (
    document.documentElement.scrollWidth
      <= document.documentElement.clientWidth
  ))).toBe(true);
  expect(errors).toEqual([]);

  await page.locator("#component-tooltip").screenshot({
    path: testInfo.outputPath(`tooltip-${testInfo.project.name}.png`),
  });
});

test("Tooltip keeps legacy, component, and instance background precedence synchronized with its arrow", async ({ page }) => {
  await page.goto("/#component-tooltip");
  const basicTrigger = page.locator("#文字气泡-基础用法 .qizhi-typography-text").first();
  const open = async (trigger: typeof basicTrigger) => {
    await page.mouse.move(0, 0);
    await trigger.hover();
  };
  const readColors = async (name: string) => {
    const tooltip = page.getByRole("tooltip", { name, exact: true });
    await expect(tooltip).toBeVisible();
    return tooltip.evaluate((node) => ({
      body: getComputedStyle(node.querySelector(".qizhi-tooltip__container")!).backgroundColor,
      arrow: getComputedStyle(node.querySelector(".qizhi-tooltip__arrow")!).backgroundColor,
    }));
  };

  await page.evaluate(() => document.documentElement.style.setProperty("--color-neutral-10", "rgb(17, 34, 51)"));
  await open(basicTrigger);
  expect(await readColors("这是一段文字气泡内容")).toEqual({ body: "rgb(17, 34, 51)", arrow: "rgb(17, 34, 51)" });
  await page.keyboard.press("Escape");

  await page.evaluate(() => document.documentElement.style.setProperty("--component-tooltip-background", "rgb(68, 85, 102)"));
  await open(basicTrigger);
  expect(await readColors("这是一段文字气泡内容")).toEqual({ body: "rgb(68, 85, 102)", arrow: "rgb(68, 85, 102)" });
  await page.keyboard.press("Escape");

  await open(page.locator("#文字气泡-不同颜色 .tooltip-docs-color-trigger").first());
  expect(await readColors("蓝色")).toEqual({ body: "rgb(51, 102, 255)", arrow: "rgb(51, 102, 255)" });
});
