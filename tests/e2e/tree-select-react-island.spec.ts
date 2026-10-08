import { expect, test } from "@playwright/test";

test("TreeSelect 旧站布局、交互和浮层边界", async ({ page }, testInfo) => {
  const errors: Array<{ text: string; url: string }> = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push({
        text: message.text(),
        url: message.location().url,
      });
    }
  });
  await page.goto("/#component-tree-select");

  const section = page.locator("#component-tree-select");
  await expect(section.locator("article.codebox-wrapper")).toHaveCount(10);
  await expect(section.locator("#tree-select-API")).toBeVisible();

  const basic = section.locator("#树选择-基础用法");
  const basicControl = basic.getByRole("combobox", {
    name: "基础树选择",
  });
  await basicControl.click();
  const popup = page.locator(".qizhi-tree-select__popup");
  const tree = popup.getByRole("tree");
  await expect(tree).toHaveClass(/qizhi-dropdown__menu/);
  await expect(tree).toHaveClass(/qizhi-tree-size-default/);
  const treeItems = popup.getByRole("treeitem");
  await expect(treeItems).toHaveCount(3);
  await expect(treeItems.first()).toHaveClass(/qizhi-tree-node/);
  expect(await treeItems.evaluateAll((items) => items.map((item) =>
    item.getBoundingClientRect().height))).toEqual([32, 32, 32]);
  await expect(popup.locator(".qizhi-tree-node-title").first())
    .toHaveCSS("height", "28px");
  await popup.getByRole("treeitem", { name: "叶子一" }).click();
  await expect(basicControl).toHaveAttribute("aria-expanded", "false");
  const clear = basic.getByRole("button", { name: "清空选择" });
  await expect(clear).toBeHidden();
  await basicControl.hover();
  await expect(clear).toBeVisible();
  await clear.click();
  await expect(basicControl).toContainText("请选择");

  const multiple = section.locator("#树选择-前置标签")
    .getByRole("combobox", { name: "多选树节点" });
  await multiple.click();
  await page.getByRole("treeitem", { name: "叶子" }).click();
  await expect(multiple).toHaveAttribute("aria-expanded", "true");
  await expect(multiple.locator(".qizhi-tag-content")).toHaveText("叶子");
  await page.keyboard.press("Escape");

  const lazy = section.getByRole("combobox", {
    name: "动态加载树选择",
  });
  await lazy.click();
  await page.getByRole("button", { name: "展开待加载节点" }).click();
  await expect(popup.getByText("正在加载", { exact: true })).toBeAttached();
  await expect(page.getByRole("treeitem", {
    name: "待加载节点的子节点",
  })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(lazy).toHaveAttribute("aria-expanded", "false");

  await basicControl.click();
  await expect(basicControl).toHaveAttribute("aria-expanded", "true");

  const popupBounds = await popup.boundingBox();
  const controlBounds = await basicControl.boundingBox();
  if (popupBounds) {
    expect(controlBounds).not.toBeNull();
    expect(Math.abs(popupBounds.x - controlBounds!.x))
      .toBeLessThanOrEqual(1);
    expect(popupBounds.x).toBeGreaterThanOrEqual(0);
    expect(popupBounds.x + popupBounds.width)
      .toBeLessThanOrEqual(page.viewportSize()!.width);
  }

  expect(await page.evaluate(() =>
    document.documentElement.scrollWidth <=
    document.documentElement.clientWidth)).toBe(true);
  for (const demo of await section.locator(".demo").all()) {
    expect(await demo.evaluate((node) =>
      node.scrollWidth <= node.clientWidth)).toBe(true);
  }
  for (const control of await section.locator(
    '[data-testid="qizhi-tree-select"]',
  ).all()) {
    const bounds = await control.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width)
      .toBeLessThanOrEqual(page.viewportSize()!.width);
  }

  await basic.screenshot({
    path: testInfo.outputPath(`tree-select-${testInfo.project.name}.png`),
  });
  expect(errors).toEqual([]);
});

test("TreeSelect 搜索、远程搜索和尺寸切换", async ({ page }) => {
  await page.goto("/#component-tree-select");
  const section = page.locator("#component-tree-select");

  const search = section.getByRole("combobox", { name: "默认搜索" });
  const searchControl = search.locator("..");
  await expect(searchControl.locator(
    ".qizhi-tree-select__suffix--arrow",
  )).toBeVisible();
  await search.fill("leaf-2");
  await expect(searchControl.locator(
    ".qizhi-tree-select__suffix--search",
  )).toHaveCSS("transform", "none");
  await expect(page.getByRole("treeitem", { name: "叶子二" })).toBeVisible();
  await expect(page.getByRole("treeitem", { name: "叶子一" })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(searchControl.locator(
    ".qizhi-tree-select__suffix--arrow",
  )).toBeVisible();

  const remote = section.getByRole("combobox", { name: "远程搜索" });
  await remote.fill("bei");
  await expect(page.getByRole("treeitem", { name: "北京" })).toBeVisible();
  await expect(page.getByRole("treeitem", { name: "上海" })).toHaveCount(0);
  await page.keyboard.press("Escape");

  const sizeDemo = section.locator("#树选择-不同尺寸");
  for (const [label, height] of [
    ["32px", 32],
    ["36px", 36],
    ["40px", 40],
  ] as const) {
    await sizeDemo.getByRole("radio", { name: label }).click();
    await expect(sizeDemo.locator('[data-testid="qizhi-tree-select"]'))
      .toHaveCSS("height", `${height}px`);
  }
});

test("TreeSelect 前置标签沿用输入控件字号", async ({ page }) => {
  await page.goto("/#component-tree-select");
  const addBefore = page.locator(
    "#树选择-前置标签 .qizhi-tree-select__add-before",
  );

  await expect(addBefore).toHaveCount(2);
  await expect(addBefore.first()).toHaveCSS("font-size", "14px");
  await expect(addBefore.first()).toHaveCSS("line-height", "20px");
});
