import { expect, test } from "@playwright/test";

test("Popover 保留 4 个 Demo、18 个触发器与完整关闭路径", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#component-popover");
  await expect(page.getByRole("heading", { name: "气泡卡片 Popover" })).toBeVisible();
  await expect(page.locator("#component-popover article.codebox-wrapper")).toHaveCount(4);
  await expect(page.locator("#component-popover .popover-demo-trigger")).toHaveCount(18);
  await expect(page.locator("#popover-API")).toBeVisible();

  const basic = page.locator("#popover-basic .popover-demo-trigger");
  await basic.hover();
  const basicPopup = page.locator("body > .qizhi-popover");
  await expect(basicPopup).toBeVisible();
  await expect(basicPopup).toContainText("这里是气泡卡片的内容，可以承载说明文本和轻量操作。");
  await page.mouse.move(8, 120);
  await expect(basicPopup).toBeHidden();

  const clickTrigger = page.locator("#popover-trigger").getByRole("button", { name: "点击" });
  await clickTrigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(clickTrigger).toBeFocused();

  const focusTrigger = page.locator("#popover-trigger").getByRole("button", { name: "聚焦" });
  await focusTrigger.focus();
  await expect(page.getByRole("tooltip")).toContainText("获得焦点时显示。");

  const contextTrigger = page.locator("#popover-trigger").getByRole("button", { name: "右键" });
  await contextTrigger.click({ button: "right" });
  const contextMenu = page.locator('body > .qizhi-popover[role="menu"]');
  await expect(contextMenu).toContainText("右键打开菜单。");
  await page.mouse.click(8, 120);
  await expect(contextMenu).toBeHidden();

  const closable = page.locator("#popover-closable").getByRole("button", { name: "点击弹出" });
  await closable.click();
  await expect(page.getByRole("dialog")).toContainText("浮层标题");
  await page.getByRole("dialog").getByRole("button", { name: "确认" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  expect(await page.locator("#popover-position .demo").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.locator("#component-popover").screenshot({ path: testInfo.outputPath(`popover-${testInfo.project.name}.png`) });
  expect(errors).toEqual([]);
});

test("Popover 12 方位使用 Portal 且不被祖先容器裁切", async ({ page }, testInfo) => {
  await page.goto("/#component-popover");
  const labels = ["上左", "上", "上右", "左上", "右上", "左", "右", "左下", "右下", "下左", "下", "下右"];
  let previousPopupId: string | null = null;
  for (const label of labels) {
    const trigger = page.locator("#popover-position").getByRole("button", { name: label, exact: true });
    await trigger.focus();
    if (previousPopupId) await expect(page.locator(`#${previousPopupId}`)).toBeHidden();
    const popupId = await trigger.getAttribute("aria-controls");
    const popup = page.locator(`#${popupId}`);
    await expect(popup).toBeVisible();
    const geometry = await popup.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { parent: element.parentElement?.tagName, left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, viewportWidth: innerWidth, viewportHeight: innerHeight };
    });
    expect(geometry.parent).toBe("BODY");
    expect(geometry.left).toBeGreaterThanOrEqual(8);
    expect(geometry.top).toBeGreaterThanOrEqual(8);
    expect(geometry.right).toBeLessThanOrEqual(geometry.viewportWidth - 8 + 1);
    expect(geometry.bottom).toBeLessThanOrEqual(geometry.viewportHeight - 8 + 1);
    previousPopupId = popupId;
  }
  await page.screenshot({ path: testInfo.outputPath(`popover-positions-${testInfo.project.name}.png`) });
});

test("Popover 文档代码与预览同源", async ({ page }, testInfo) => {
  await page.goto("/#component-popover");
  const demo = page.locator("#popover-position");
  await demo.getByRole("button", { name: "查看代码" }).click();
  await expect(demo.locator(".qizhi-code-wrapper code")).toContainText('import { Button, Popover } from "@wangxiaojinger/qizhi-react"');
  await expect(demo.locator(".qizhi-code-wrapper code")).not.toContainText("useState");
  await expect(demo.locator(".qizhi-code-wrapper code")).not.toContainText("popupVisible");
  await expect(demo.locator(".qizhi-code-highlight")).toHaveCSS("font-size", "13px");
  await expect(demo.locator(".qizhi-code-wrapper")).not.toContainText("Demo.tsx");
  await expect(demo.getByRole("button", { name: "复制代码" })).toHaveClass(/qizhi-btn/);
  await demo.screenshot({ path: testInfo.outputPath(`popover-code-${testInfo.project.name}.png`) });
});
