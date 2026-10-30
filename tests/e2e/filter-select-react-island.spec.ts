import { expect, test } from "@playwright/test";

test("FilterSelect 摘要、搜索、键盘与响应式布局", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/#component-filter-select");
  const section = page.locator("#component-filter-select");
  await expect(section.locator(".codebox-wrapper")).toHaveCount(3);
  await expect(section.locator("#filter-select-API")).toBeVisible();

  const single = section.locator('[id="筛选选择器-单选筛选"]');
  const singleInput = single.getByRole("combobox");
  await expect(single.getByText("所有者：全部")).toBeVisible();
  await single.getByText("所有者：全部").click();
  await expect(single.getByText("所有者：全部")).toBeVisible();
  const singlePopup = page.locator(".qizhi-select-popup").last();
  await expect(singlePopup.getByRole("option")).toHaveText([
    "全部",
    "企业管理员",
    "研究团队管理员",
  ]);
  await expect(singlePopup).not.toContainText("所有者：");
  await singlePopup.getByRole("option", { name: "企业管理员" }).click();
  await expect(single.getByText("所有者：企业管理员")).toBeVisible();
  await singleInput.click();
  await singleInput.press("ArrowDown");
  await singleInput.press("Enter");
  await expect(singleInput).toHaveAttribute("aria-expanded", "false");
  await expect(single.locator(".qizhi-filter-select__summary")).toBeVisible();
  await singleInput.click();
  await singleInput.press("Escape");
  await expect(singleInput).toBeFocused();

  const multiple = section.locator('[id="筛选选择器-多选筛选"]');
  const multipleInput = multiple.getByRole("combobox");
  await expect(multiple.getByText("标签：标签A、标签B")).toBeVisible();
  await expect(multiple.getByText("+3")).toBeVisible();
  await multipleInput.click();
  const multiplePopup = page.locator(".qizhi-select-popup").last();
  const option = multiplePopup.getByRole("option", { name: "标签A" });
  const boxes = await option.evaluate((node) => {
    const bounds = (element: Element) => {
      const rect = element.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    };
    return {
      option: bounds(node),
      check: bounds(node.querySelector(".qizhi-select-popup__check")!),
    };
  });
  expect(boxes.option.x + boxes.option.width - boxes.check.x -
    boxes.check.width).toBe(12);
  expect(Math.abs(
    boxes.option.y + boxes.option.height / 2 -
    boxes.check.y - boxes.check.height / 2,
  )).toBeLessThanOrEqual(1);
  await option.click();
  await expect(multiple.getByText("标签：标签B、标签C")).toBeVisible();
  await expect(multiple.getByText("+2")).toBeVisible();
  await multiple.screenshot({
    path: testInfo.outputPath(`filter-select-multiple-${testInfo.project.name}.png`),
  });

  const popup = page.locator(".qizhi-select-popup").last();
  const popupBounds = await popup.boundingBox();
  expect(popupBounds).not.toBeNull();
  expect(popupBounds!.x).toBeGreaterThanOrEqual(0);
  expect(popupBounds!.x + popupBounds!.width)
    .toBeLessThanOrEqual(page.viewportSize()!.width);
  expect(popupBounds!.y).toBeGreaterThanOrEqual(0);
  expect(popupBounds!.y + popupBounds!.height)
    .toBeLessThanOrEqual(page.viewportSize()!.height);
  expect(await popup.evaluate((node) => {
    for (
      let parent = node.parentElement;
      parent && parent !== document.body;
      parent = parent.parentElement
    ) {
      const style = getComputedStyle(parent);
      if ([style.overflow, style.overflowX, style.overflowY]
        .some((value) => value === "hidden" || value === "clip")) return false;
    }
    return true;
  })).toBe(true);
  await multiple.screenshot({
    path: testInfo.outputPath(`filter-select-popup-${testInfo.project.name}.png`),
  });

  expect(await page.evaluate(() => (
    document.documentElement.scrollWidth <= document.documentElement.clientWidth
  ))).toBe(true);
  expect(await section.evaluate((node) => node.scrollWidth <= node.clientWidth))
    .toBe(true);
  expect(errors).toEqual([]);
});
