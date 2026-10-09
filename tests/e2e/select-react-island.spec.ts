import { expect, test } from "@playwright/test";

test("信息卡片选项展示层级、键盘说明及回填卡", async ({ page }) => {
  await page.goto("/#component-select");
  for (const id of ["选择器-名称与字段信息", "选择器-图标与属性", "选择器-悬停补充信息"]) {
    const select = page.locator(`[id="${id}"]`).getByRole("combobox");
    await select.click();
    const card = page.locator(".qizhi-select-option-card").first();
    await expect(card).toBeVisible();
    await expect(card.locator(".qizhi-select-option-card__name")).toHaveCSS("color", "rgb(78, 89, 105)");
    await expect(card.locator(".qizhi-select-option-card__value").first()).toHaveCSS("font-size", "14px");
    expect(await card.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
    await select.press("ArrowDown");
    if (id === "选择器-悬停补充信息") {
      await expect(page.getByRole("tooltip")).toBeVisible();
      const bounds = await page.getByRole("tooltip").boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    }
    await select.press("Enter");
    await expect(select).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("tooltip")).toHaveCount(0);
  }
  const related = page.locator('[id="选择器-选择后关联信息"]');
  await related.getByRole("combobox").click();
  await page.getByRole("option").first().click();
  await expect(related.locator(".select-docs-card-related")).toBeVisible();
  const gap = await related.evaluate((el) => el.querySelector(".select-docs-card-related")!.getBoundingClientRect().top - el.querySelector(".qizhi-select")!.getBoundingClientRect().bottom);
  expect(gap).toBe(4);
  const layout = await related.evaluate((el) => {
    const parent = el.querySelector(".select-docs-card-selection")!.getBoundingClientRect();
    return Array.from(el.querySelectorAll(".select-docs-card-related, .select-docs-card-select")).every((node) => {
      const box = node.getBoundingClientRect();
      return box.left >= parent.left && box.right <= parent.right + 1;
    });
  });
  expect(layout).toBe(true);
  await related.getByRole("combobox").hover();
  await related.getByRole("button", { name: "清除选择" }).click();
  await expect(related.locator(".select-docs-card-related")).toHaveCount(0);
});

test("Select 布局与交互", async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto("/#component-select");
    await expect(page.locator("#component-select .codebox-wrapper")).toHaveCount(24);
    await expect(page.locator("#component-select #select-API")).toBeVisible();

    const basic = page.locator("#选择器-基础用法");
    const basicControls = basic.locator(".qizhi-select__control");
    await expect(basicControls).toHaveCount(4);
    if ((page.viewportSize()?.width ?? 0) >= 768) {
      for (let index = 0; index < 4; index += 1) await expect(basicControls.nth(index)).toHaveCSS("height", "32px");
    }
    const keyboardSelect = basic.getByRole("combobox").first();
    await keyboardSelect.click();
    await keyboardSelect.press("Escape");
    await keyboardSelect.press("Tab");
    const keyboardClear = basic.getByRole("button", { name: "清除选择" }).first();
    await expect(keyboardClear).toBeVisible();
    await expect(keyboardClear).toBeFocused();
    await basic.screenshot({ path: testInfo.outputPath(`select-keyboard-clear-${testInfo.project.name}.png`) });
    await keyboardClear.press("Enter");
    await expect(keyboardSelect).toHaveValue("");
    await keyboardSelect.press("Enter");
    const keyboardPopup = page.locator(".qizhi-select-popup").last();
    await keyboardPopup.evaluate((node) => {
      node.style.maxHeight = "40px";
      node.style.overflowY = "auto";
    });
    await keyboardSelect.press("ArrowUp");
    const activeOptionId = await keyboardSelect.getAttribute("aria-activedescendant");
    expect(activeOptionId).not.toBeNull();
    const activeOption = page.locator(`#${activeOptionId}`);
    await expect(activeOption).toHaveText("广州");
    await expect(activeOption).toHaveClass(/is-active/);
    await expect(activeOption).toHaveCSS("background-color", "rgb(242, 243, 245)");
    const [activeBounds, popupBoundsAfterScroll] = await Promise.all([activeOption.boundingBox(), keyboardPopup.boundingBox()]);
    expect(activeBounds!.y).toBeGreaterThanOrEqual(popupBoundsAfterScroll!.y);
    expect(activeBounds!.y + activeBounds!.height).toBeLessThanOrEqual(popupBoundsAfterScroll!.y + popupBoundsAfterScroll!.height);
    await keyboardPopup.screenshot({ path: testInfo.outputPath(`select-keyboard-active-${testInfo.project.name}.png`) });
    await keyboardSelect.press("Escape");

    const clearDemo = page.locator("#选择器-允许清除");
    await clearDemo.getByRole("combobox").hover();
    await expect(clearDemo.getByRole("button", { name: "清除选择" })).toBeVisible();
    await clearDemo.getByRole("button", { name: "清除选择" }).click();
    await expect(clearDemo.getByRole("combobox")).toHaveValue("");

    await basic.getByRole("combobox").first().click();
    const listbox = page.getByRole("listbox").last();
    await expect(listbox).toHaveClass(/qizhi-dropdown__menu/);
    await expect(listbox.getByRole("option").first()).toHaveClass(/qizhi-dropdown__item/);
    const popup = page.locator(".qizhi-select-popup").last();
    const clipping = await popup.evaluate((node) => {
      const result: string[] = [];
      for (let parent = node.parentElement; parent && parent !== document.body && parent !== document.documentElement; parent = parent.parentElement) {
        const style = getComputedStyle(parent);
        if ([style.overflow, style.overflowX, style.overflowY].some((value) => value === "hidden" || value === "clip")) result.push(`${parent.tagName}.${parent.className}`);
      }
      return result;
    });
    expect(clipping).toEqual([]);
    const popupBounds = await popup.boundingBox();
    expect(popupBounds).not.toBeNull();
    expect(popupBounds!.x).toBeGreaterThanOrEqual(0);
    expect(popupBounds!.x + popupBounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    expect(popupBounds!.y).toBeGreaterThanOrEqual(0);
    expect(popupBounds!.y + popupBounds!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
    await basic.screenshot({ path: testInfo.outputPath(`select-${testInfo.project.name}.png`) });
    await page.keyboard.press("Escape");
    await expect(basic.getByRole("combobox").first()).toHaveAttribute("aria-expanded", "false");

    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    if ((page.viewportSize()?.width ?? 0) === 375) {
      const sizeDemo = page.locator("#选择器-不同尺寸 .demo");
      const sliderBounds = await sizeDemo.getByRole("slider").boundingBox();
      const sizeBounds = await sizeDemo.boundingBox();
      expect(sliderBounds!.x + sliderBounds!.width).toBeLessThanOrEqual(sizeBounds!.x + sizeBounds!.width);
      const autoDemo = page.locator("#选择器-宽度自适应 .demo");
      const autoBounds = await autoDemo.boundingBox();
      for (const divider of await autoDemo.locator(".qizhi-divider__text").all()) {
        const bounds = await divider.boundingBox();
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(autoBounds!.x + autoBounds!.width);
      }
    }
    expect(errors).toEqual([]);
});

test("Select 四种尺寸与多选、创建、联动", async ({ page }, testInfo) => {
  await page.goto("/#component-select");
  const size = page.locator("#选择器-不同尺寸");
  const slider = size.getByRole("slider", { name: "组件尺寸" });
  for (const [value, height] of [["0", 24], ["1", 28], ["2", 32], ["3", 36]] as const) {
    await slider.fill(value);
    await expect(size.locator(".qizhi-select__control").first()).toHaveCSS("height", `${height}px`);
  }

  const multiple = page.locator("#选择器-多选模式").locator(".qizhi-select").first();
  const tags = multiple.locator(".qizhi-tag");
  for (const tag of await tags.all()) {
    const content = tag.locator(".qizhi-tag-content");
    expect(await content.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
  }
  const arrow = multiple.locator(".qizhi-select__arrow svg");
  await expect(arrow).toHaveCSS("width", "12px");
  await expect(arrow).toHaveCSS("height", "12px");
  await expect(arrow).toHaveAttribute("viewBox", "1.6 1.6 12.8 12.8");
  expect(await arrow.locator("path").evaluate((node) => getComputedStyle(node).fillOpacity)).toBe("1");
  await expect(multiple.locator(".qizhi-select__arrow")).toHaveCSS("color", "rgb(134, 144, 156)");
  await expect(multiple.locator(".qizhi-select__clear")).toHaveCSS("color", "rgb(134, 144, 156)");
  const tagCloseIcon = multiple.getByRole("button", { name: "删除 北京" }).locator("svg");
  await expect(tagCloseIcon).toHaveCSS("width", "12px");
  await expect(tagCloseIcon).toHaveCSS("height", "12px");
  await multiple.getByRole("combobox").click();
  await expect(multiple.locator(".qizhi-select__control")).toHaveCSS("border-color", "rgb(51, 102, 255)");
  await expect(multiple.locator(".qizhi-select__control")).toHaveCSS("box-shadow", "rgb(232, 242, 255) 0px 0px 0px 2px");
  const multipleOptions = page.locator(".qizhi-select-popup").last().getByRole("option");
  for (const [index, option] of (await multipleOptions.all()).entries()) {
    const boxes = await option.evaluate((node) => {
      const toBox = (element: Element) => {
        const rect = element.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      };
      return {
        option: toBox(node),
        content: toBox(node.querySelector(".qizhi-select-popup__option-content")!),
        check: toBox(node.querySelector(".qizhi-select-popup__check")!),
      };
    });
    expect(boxes.content.x + boxes.content.width).toBeLessThanOrEqual(boxes.check.x);
    expect(boxes.option.x + boxes.option.width - boxes.check.x - boxes.check.width).toBe(12);
    expect(Math.abs((boxes.option.y + boxes.option.height / 2) - (boxes.check.y + boxes.check.height / 2)), `option ${index} checkbox should be vertically centered`).toBeLessThanOrEqual(1);
  }
  await page.locator(".qizhi-select-popup").last().screenshot({ path: testInfo.outputPath(`select-multiple-popup-${testInfo.project.name}.png`) });
  await page.getByRole("option", { name: "上海" }).last().click();
  await expect(multiple.getByRole("combobox")).toHaveAttribute("aria-expanded", "true");

  const clearDemo = page.locator("#选择器-允许清除");
  const clearInput = clearDemo.getByRole("combobox");
  await clearInput.click();
  await page.getByRole("option", { name: "北京" }).last().click();
  await expect(clearInput).toHaveAttribute("aria-expanded", "false");
  await expect(clearDemo.locator(".qizhi-select__control")).toHaveCSS("box-shadow", "none");
  await expect(clearDemo.getByRole("button", { name: "清除选择" })).toBeVisible();
  await clearInput.press("Tab");
  await page.keyboard.press("Tab");
  await page.mouse.move(0, 0);
  await expect(clearDemo.getByRole("button", { name: "清除选择" })).toBeHidden();
  await clearInput.focus();
  await clearInput.press("Meta+Shift+A");
  await expect(clearDemo.getByRole("button", { name: "清除选择" })).toBeVisible();
  await clearDemo.locator(".qizhi-select").hover();
  const clearButton = clearDemo.getByRole("button", { name: "清除选择" });
  const [buttonBox, iconBox] = await Promise.all([clearButton.boundingBox(), clearButton.locator("svg").boundingBox()]);
  expect(buttonBox).not.toBeNull();
  expect(iconBox).not.toBeNull();
  expect(iconBox!.width).toBe(12);
  expect(iconBox!.height).toBe(12);
  expect(Math.abs((buttonBox!.x + buttonBox!.width / 2) - (iconBox!.x + iconBox!.width / 2))).toBeLessThanOrEqual(1);
  expect(Math.abs((buttonBox!.y + buttonBox!.height / 2) - (iconBox!.y + iconBox!.height / 2))).toBeLessThanOrEqual(1);

  const cascade = page.locator("#选择器-联动");
  await cascade.getByRole("combobox").first().click();
  await page.getByRole("option", { name: "广东" }).click();
  await expect(cascade.getByRole("combobox").nth(1)).toHaveValue("广州");
});

test("Select 高级 Demo 交互", async ({ page }) => {
  await page.goto("/#component-select");

  const search = page.locator("#选择器-搜索 .qizhi-select").first().getByRole("combobox");
  await search.click();
  await search.press("ArrowDown");
  await search.pressSequentially("北京 烤鸭");
  await expect(search).toHaveValue("北京 烤鸭");
  await search.press("Escape");

  const create = page.locator("#选择器-允许创建").locator(".qizhi-select").first();
  await create.getByRole("combobox").fill("成都");
  await page.getByRole("option", { name: "输入创建：成都" }).click();
  await expect(create.getByRole("combobox")).toHaveValue("成都");

  const token = page.locator("#选择器-自动分词");
  await token.getByRole("combobox").fill("北京,上海|");
  await expect(token.getByRole("button", { name: "删除 北京" })).toBeVisible();
  await expect(token.getByRole("button", { name: "删除 上海" })).toBeVisible();

  const grouped = page.locator("#选择器-分组选项");
  const groupedStatus = grouped.locator(".demo").getByRole("status");
  const groupedInput = grouped.getByRole("combobox");
  await groupedInput.click();
  const groupedPopup = page.locator(".qizhi-select-popup").last();
  await expect(groupedPopup.getByRole("group", { name: "华北" })).toBeVisible();
  await expect(groupedPopup.getByRole("group", { name: "华东" })).toBeVisible();
  await groupedInput.press("ArrowDown");
  await groupedInput.press("Enter");
  await expect(groupedStatus).toHaveText("选择：北京");
  await groupedPopup.getByRole("option", { name: "北京" }).click();
  await expect(groupedStatus).toHaveText("取消：北京");
  await groupedInput.fill("上海");
  await expect(groupedPopup.getByRole("group", { name: "华北" })).toHaveCount(0);
  await expect(groupedPopup.getByRole("group", { name: "华东" })).toBeVisible();

  const customTrigger = page.locator("#选择器-自定义触发节点");
  await customTrigger.getByRole("combobox").click();
  await page.getByRole("option", { name: "北京" }).last().click();
  await expect(customTrigger.getByRole("combobox")).toContainText("北京");
  await page.keyboard.press("Escape");

  const extended = page.locator("#选择器-扩展菜单");
  await extended.getByRole("combobox").click();
  const popup = page.locator(".qizhi-select-popup").last();
  await popup.getByRole("textbox").fill("成都");
  await popup.getByRole("button", { name: "添加" }).click();
  await expect(popup.getByRole("option", { name: "成都" })).toBeVisible();
  await page.keyboard.press("Escape");

  const hidden = page.locator("#选择器-隐藏已选择项");
  await hidden.getByRole("combobox").click();
  await page.getByRole("option", { name: "选项 1", exact: true }).click();
  await expect(page.getByRole("option", { name: "选项 1", exact: true })).toHaveCount(0);
  await page.keyboard.press("Escape");

  const popupWidth = page.locator("#选择器-自定义弹出框宽度");
  const blurSelect = popupWidth.getByRole("combobox").first();
  await blurSelect.click();
  await blurSelect.press("Tab");
  await expect(blurSelect).toHaveAttribute("aria-expanded", "false");
  await popupWidth.getByRole("combobox").nth(1).click();
  await expect(page.locator(".qizhi-select-popup").last()).toHaveCSS("width", "300px");
  await page.keyboard.press("Escape");

  const maxTags = page.locator("#选择器-最大标签数");
  await expect(maxTags.getByText("+1...", { exact: true })).toBeVisible();
  await expect(maxTags.getByText("+1", { exact: true })).toBeVisible();
  const responsive = maxTags.locator(".qizhi-select").nth(2);
  await responsive.evaluate((node) => { node.setAttribute("style", "width: 180px"); });
  const narrowTagCount = await responsive.locator(".qizhi-select__tags .qizhi-tag")
    .count();
  await responsive.evaluate((node) => { node.setAttribute("style", "width: 520px"); });
  await expect.poll(async () => responsive.locator(
    ".qizhi-select__tags .qizhi-tag",
  ).count()).toBeGreaterThan(narrowTagCount);

  const virtual = page.locator("#选择器-大数据");
  await virtual.getByRole("combobox").click();
  const virtualPopup = page.locator(".qizhi-select-popup").last();
  await expect(virtualPopup.getByRole("option")).toHaveCount(12);
  await virtualPopup.evaluate((node) => { node.scrollTop = 3200; });
  await expect(virtualPopup.getByRole("option", { name: "选项 101" }))
    .toBeVisible();
  await expect(virtualPopup.getByRole("option", { name: "选项 1", exact: true }))
    .toHaveCount(0);
  await page.keyboard.press("Escape");
  await virtual.getByRole("combobox").press("ArrowUp");
  const lastVirtualOption = virtualPopup.getByRole("option", { name: "选项 1000" });
  await expect(lastVirtualOption).toBeVisible();
  expect(await lastVirtualOption.evaluate((option) => {
    const optionBounds = option.getBoundingClientRect();
    const popupBounds = option.closest(".qizhi-select-popup")!.getBoundingClientRect();
    return optionBounds.top >= popupBounds.top && optionBounds.bottom <= popupBounds.bottom;
  })).toBe(true);
  await page.keyboard.press("Escape");

  const remote = page.locator("#选择器-远程搜索");
  const remoteInput = remote.getByRole("combobox");
  await remoteInput.click();
  const remotePopup = page.locator(".qizhi-select-popup").last();
  await expect(remotePopup.getByRole("option")).toHaveCount(4);
  for (const name of ["张伟", "王芳", "李娜"]) {
    await remotePopup.getByRole("option", { name }).click();
  }
  await expect(remotePopup.getByRole("option", { name: "刘洋" }))
    .toHaveAttribute("aria-disabled", "true");
  await remoteInput.fill("不存在");
  await expect(remotePopup).toHaveAttribute("aria-busy", "true");
  await expect(remotePopup.getByRole("status")).toHaveText("正在加载");
  await expect(remotePopup.getByRole("status"))
    .toHaveText("没有匹配用户", { timeout: 2000 });
  await expect(remoteInput).toHaveValue("不存在");
});
