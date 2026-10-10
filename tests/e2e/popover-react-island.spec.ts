import { expect, test } from "@playwright/test";

test("Popover 保留 5 个 Demo、19 个触发器与完整关闭路径", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#component-popover");
  await expect(page.getByRole("heading", { name: "气泡卡片 Popover" })).toBeVisible();
  await expect(page.locator("#component-popover article.codebox-wrapper")).toHaveCount(5);
  await expect(page.locator("#component-popover .popover-demo-trigger")).toHaveCount(19);
  await expect(page.locator("#popover-API")).toBeVisible();

  const basic = page.locator("#popover-basic .popover-demo-trigger");
  await basic.hover();
  const basicPopup = page.locator("body > .qizhi-popover");
  await expect(basicPopup).toBeVisible();
  await expect(basicPopup).toContainText("这里是气泡卡片的内容，可以承载说明文本和轻量操作。");
  expect((await basicPopup.boundingBox())!.width).toBeGreaterThan(248);
  expect((await basicPopup.boundingBox())!.width).toBeLessThanOrEqual(360);
  await page.mouse.move(8, 120);
  await expect(basicPopup).toBeHidden();

  const copyTrigger = page.locator("#popover-copy .popover-copy-demo__trigger");
  await copyTrigger.focus();
  const copyPopup = page.getByRole("dialog", { name: "复制账号" });
  await expect(copyPopup).toHaveClass(/qizhi-popover--dark/);
  const copyButton = copyPopup.getByRole("button", { name: "复制文本" });
  await copyTrigger.press("Tab");
  await expect(copyButton).toBeFocused();
  await copyButton.hover();
  await expect(copyPopup).toBeVisible();
  await copyButton.click();
  await expect(copyPopup.getByRole("status")).toHaveText("已复制");
  const colors = await copyButton.evaluate((element) => ({
    button: getComputedStyle(element).color,
    popup: getComputedStyle(element.closest(".qizhi-popover")!).color,
  }));
  expect(colors.button).toBe(colors.popup);
  await copyPopup.screenshot({ path: testInfo.outputPath(`popover-copy-${testInfo.project.name}.png`) });
  await page.keyboard.press("Escape");
  await expect(copyPopup).toBeHidden();

  const clickTrigger = page.locator("#popover-trigger").getByRole("button", { name: "点击" });
  await clickTrigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(clickTrigger).toBeFocused();

  const focusTrigger = page.locator("#popover-trigger").getByRole("button", { name: "聚焦" });
  await focusTrigger.focus();
  const focusPopup = page.getByRole("dialog");
  await expect(focusPopup).toContainText("获得焦点时显示。");
  expect((await focusPopup.boundingBox())!.width).toBeLessThan(248);

  const contextTrigger = page.locator("#popover-trigger").getByRole("button", { name: "右键" });
  await contextTrigger.click({ button: "right" });
  const contextMenu = page.locator('body > .qizhi-popover[role="menu"]');
  await expect(contextMenu).toContainText("右键打开菜单。");
  await page.mouse.click(8, 120);
  await expect(contextMenu).toBeHidden();

  const closable = page.locator("#popover-closable").getByRole("button", { name: "点击弹出" });
  await closable.click();
  const closablePopup = page.getByRole("dialog", { name: "浮层标题" });
  await expect(closablePopup).toContainText("浮层标题");
  await closablePopup.getByRole("button", { name: "确认" }).click();
  await expect(closablePopup).toBeHidden();

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  expect(await page.locator("#popover-position .demo").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.locator("#component-popover").screenshot({ path: testInfo.outputPath(`popover-${testInfo.project.name}.png`) });
  expect(errors).toEqual([]);
});

test("Popover 12 方位使用 Portal 且不被祖先容器裁切", async ({ page }, testInfo) => {
  await page.goto("/#component-popover");
  const labels = ["上左", "上", "上右", "左上", "右上", "左", "右", "左下", "右下", "下左", "下", "下右"];
  const cornerLabels = new Set(["上左", "上右", "左上", "左下", "右上", "右下", "下左", "下右"]);
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
    if (cornerLabels.has(label)) {
      const arrowAlignment = await trigger.evaluate((element) => {
        const triggerRect = element.getBoundingClientRect();
        const popupId = element.getAttribute("aria-controls")!;
        const popup = document.getElementById(popupId)!;
        const arrow = popup.querySelector<HTMLElement>(".qizhi-popover__arrow")!;
        const arrowRect = arrow.getBoundingClientRect();
        const position = popup.dataset.popoverPosition!;
        return {
          position,
          inlineAxis: position.startsWith("top") || position.startsWith("bottom")
            ? arrow.style.left
            : arrow.style.top,
          delta: position.startsWith("top") || position.startsWith("bottom")
            ? arrowRect.left + arrowRect.width / 2 - (triggerRect.left + triggerRect.width / 2)
            : arrowRect.top + arrowRect.height / 2 - (triggerRect.top + triggerRect.height / 2),
        };
      });
      expect(arrowAlignment.inlineAxis, `${label} 箭头不应覆盖 CSS 安全边界限制`).toBe("");
      expect(Math.abs(arrowAlignment.delta), `${label} (${arrowAlignment.position}) 箭头应对齐触发器中心`).toBeLessThanOrEqual(1);
    }
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

test("Popover component overrides keep body and four directional arrows synchronized", async ({ page }) => {
  await page.goto("/#component-popover");
  await page.evaluate(() => {
    const style = document.documentElement.style;
    style.setProperty("--component-popover-background", "rgb(240, 245, 255)");
    style.setProperty("--component-popover-border", "rgb(82, 196, 26)");
    style.setProperty("--component-popover-width", "180px");
    style.setProperty("--component-popover-arrow-size", "14px");
    style.setProperty("--component-popover-z-index", "1301");
  });

  for (const label of ["上", "下", "左", "右"] as const) {
    const trigger = page.locator("#popover-position").getByRole("button", { name: label, exact: true });
    await trigger.focus();
    const popup = page.locator(`#${await trigger.getAttribute("aria-controls")}`);
    await expect(popup).toBeVisible();
    await expect(popup).toHaveCSS("width", "180px");
    await expect(popup).toHaveCSS("z-index", "1301");
    const metrics = await popup.evaluate((node) => {
      const arrow = node.querySelector<HTMLElement>(".qizhi-popover__arrow")!;
      const placement = node.dataset.popoverPosition?.replace(/(Left|Right)$/, "") ?? "";
      const bodyStyle = getComputedStyle(node);
      const arrowStyle = getComputedStyle(arrow);
      const body = node.getBoundingClientRect();
      const arrowRect = arrow.getBoundingClientRect();
      const arrowCenter = { x: arrowRect.left + arrowRect.width / 2, y: arrowRect.top + arrowRect.height / 2 };
      const connection = placement === "top" ? Math.abs(arrowCenter.y - (body.bottom - 1))
        : placement === "bottom" ? Math.abs(arrowCenter.y - (body.top + 1))
        : placement === "left" ? Math.abs(arrowCenter.x - (body.right - 1))
        : Math.abs(arrowCenter.x - (body.left + 1));
      return { bodyBackground: bodyStyle.backgroundColor, arrowBackground: arrowStyle.backgroundColor, arrowBorder: arrowStyle.borderTopColor, connection };
    });
    expect(metrics).toEqual({
      bodyBackground: "rgb(240, 245, 255)",
      arrowBackground: "rgb(240, 245, 255)",
      arrowBorder: "rgb(82, 196, 26)",
      connection: expect.any(Number),
    });
    expect(metrics.connection).toBeLessThanOrEqual(1.5);
  }
});
