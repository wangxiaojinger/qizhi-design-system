import { expect, test } from "@playwright/test";

test("Popconfirm preserves legacy behavior and geometry", async ({
  context,
  page,
}, testInfo) => {
  test.setTimeout(90_000);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#component-popconfirm");

  const section = page.locator("#component-popconfirm");
  await expect(section.locator("article.codebox-wrapper")).toHaveCount(5);
  await expect(section.locator(".popconfirm-demo-trigger")).toHaveCount(17);
  await expect(section.getByRole("table", { name: "Popconfirm API" }))
    .toBeVisible();

  const basicTrigger = section.getByRole("button", { name: "删除" });
  const basicDemo = section.locator("#popconfirm-basic > .demo");
  const basicDemoBox = await basicDemo.boundingBox();
  const basicTriggerBox = await basicTrigger.boundingBox();
  const basicDemoInset = await basicDemo.evaluate((node) => {
    const style = getComputedStyle(node);
    return parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft);
  });
  expect(Math.abs(
    basicTriggerBox!.x - basicDemoBox!.x - basicDemoInset,
  )).toBeLessThanOrEqual(1);
  await basicTrigger.click();
  const popup = page.getByRole("alertdialog");
  await expect(popup).toHaveAccessibleName("确认删除");
  await expect(popup).toHaveAccessibleDescription(
    "确定要删除这条内容吗？",
  );
  await expect(popup.getByRole("button", { name: "取消" })).toBeFocused();

  const popupBox = await popup.boundingBox();
  const popupStyle = await popup.evaluate((node) => {
    const style = getComputedStyle(node);
    return { padding: style.padding, position: style.position };
  });
  const mobile = testInfo.project.name === "mobile-375";
  expect(Math.round(popupBox!.width)).toBe(mobile ? 148 : 240);
  expect(popupStyle.padding).toBe(mobile ? "12px" : "16px");
  expect(popupStyle.position).toBe("fixed");
  expect(await popup.locator(".qizhi-popconfirm__default-icon path").evaluate(
    (node) => {
      const style = getComputedStyle(node);
      return { color: style.color, fillOpacity: style.fillOpacity };
    },
  )).toEqual({ color: "rgb(250, 173, 20)", fillOpacity: "1" });
  await popup.screenshot({ path: testInfo.outputPath("popconfirm-basic.png") });
  await section.locator("#popconfirm-basic").screenshot({
    path: testInfo.outputPath("popconfirm-basic-demo.png"),
  });

  await popup.getByRole("button", { name: "取消" }).click();
  await expect(popup).toBeHidden();
  await expect(basicTrigger).toBeFocused();

  const international = section.locator("#popconfirm-international");
  await international.getByRole("button", { name: "放弃" }).click();
  await expect(page.getByRole("alertdialog")).toContainText("放弃更改");
  await expect(page.getByRole("alertdialog").getByRole("button", {
    name: "保留",
  })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("alertdialog")).toBeHidden();

  const positionDemo = section.locator("#popconfirm-position");
  const positions = [
    "topLeft",
    "top",
    "topRight",
    "leftTop",
    "rightTop",
    "left",
    "right",
    "leftBottom",
    "rightBottom",
    "bottomLeft",
    "bottom",
    "bottomRight",
  ];
  const positionTriggers = positionDemo.locator(".popconfirm-demo-trigger");
  for (let index = 0; index < positions.length; index += 1) {
    await positionTriggers.nth(index).click();
    const positionedPopup = page.getByRole("alertdialog");
    const actualPosition = await positionedPopup.getAttribute(
      "data-popconfirm-position",
    );
    const triggerBox = await positionTriggers.nth(index).boundingBox();
    const positionedPopupBox = await positionedPopup.boundingBox();
    const primaryAxisSeparated = actualPosition?.startsWith("top")
      ? positionedPopupBox!.y + positionedPopupBox!.height <= triggerBox!.y
      : actualPosition?.startsWith("bottom")
        ? positionedPopupBox!.y >= triggerBox!.y + triggerBox!.height
        : actualPosition?.startsWith("left")
          ? positionedPopupBox!.x + positionedPopupBox!.width <= triggerBox!.x
          : positionedPopupBox!.x >= triggerBox!.x + triggerBox!.width;
    expect(primaryAxisSeparated).toBe(true);
    if (index === 1) {
      await positionDemo.screenshot({
        path: testInfo.outputPath("popconfirm-position.png"),
      });
    }
    await page.keyboard.press("Escape");
  }

  const asyncTrigger = section.getByRole("button", { name: "异步关闭" });
  await asyncTrigger.click();
  await page.getByRole("alertdialog").getByRole("button", { name: "确定" })
    .click();
  await expect(page.getByRole("button", { name: "处理中" })).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("alertdialog")).toBeVisible({ timeout: 500 });
  await expect(page.getByRole("alertdialog")).toBeHidden({ timeout: 3000 });
  await expect(asyncTrigger).toBeFocused();

  const iconDemo = section.locator("#popconfirm-icon");
  await iconDemo.getByRole("button", { name: "自定义图标" }).click();
  await expect(page.getByRole("alertdialog").locator(
    ".qizhi-popconfirm__icon svg",
  )).toHaveCount(1);
  await page.keyboard.press("Escape");
  await iconDemo.getByRole("button", { name: "无图标" }).click();
  await expect(page.getByRole("alertdialog").locator(
    ".qizhi-popconfirm__icon",
  )).toHaveCount(0);
  await page.keyboard.press("Escape");

  for (const codebox of await section.locator("article.codebox-wrapper").all()) {
    await codebox.getByRole("button", { name: "查看代码" }).click();
    const displayed = codebox.locator("pre");
    await codebox.getByRole("button", { name: "复制代码" }).click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toBe(await displayed.innerText());
  }

  expect(await page.evaluate(() => {
    const popups = [...document.querySelectorAll(".qizhi-popconfirm")];
    return popups.every((popupNode) => {
      for (let node = popupNode.parentElement; node; node = node.parentElement) {
        const style = getComputedStyle(node);
        if (node !== document.body
          && (style.overflow === "hidden"
            || style.overflowX === "hidden"
            || style.overflowY === "hidden")) return false;
      }
      return true;
    });
  })).toBe(true);
  expect(await page.evaluate(() =>
    document.documentElement.scrollWidth <= document.documentElement.clientWidth))
    .toBe(true);
  await expect(section.getByRole("button", { name: "复制样式" })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("global config reuses Popconfirm and synchronizes locale", async ({
  page,
}, testInfo) => {
  await page.goto("/#component-config-provider");
  const provider = page.locator("[data-config-provider-demo]");
  const trigger = provider.getByRole("button", { name: "确认操作" });
  await trigger.click();
  const popup = page.getByRole("alertdialog");
  await expect(popup).toHaveAccessibleName("确认操作");
  await expect(popup).toHaveAccessibleDescription("确定要继续吗？");
  const popupBox = await popup.boundingBox();
  const viewport = page.viewportSize()!;
  expect(popupBox!.x).toBeGreaterThanOrEqual(0);
  expect(popupBox!.y).toBeGreaterThanOrEqual(0);
  expect(popupBox!.x + popupBox!.width).toBeLessThanOrEqual(viewport.width);
  expect(popupBox!.y + popupBox!.height).toBeLessThanOrEqual(viewport.height);
  await popup.screenshot({
    path: testInfo.outputPath("config-popconfirm-open.png"),
  });
  await popup.getByRole("button", { name: "取消" }).click();

  await provider.getByRole("radio", { name: "English" }).click();
  const englishTrigger = provider.getByRole("button", {
    name: "Confirm action",
  });
  await expect(englishTrigger).toBeVisible();
  await englishTrigger.click();
  await expect(popup).toHaveAccessibleName("Confirm action");
  await expect(popup).toHaveAccessibleDescription(
    "Are you sure you want to continue?",
  );
  await expect(popup.getByRole("button", { name: "Cancel" })).toBeVisible();
  await expect(popup.getByRole("button", { name: "Confirm" })).toBeVisible();
});
