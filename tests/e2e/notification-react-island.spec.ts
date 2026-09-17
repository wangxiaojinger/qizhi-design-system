import { expect, test } from "@playwright/test";

test("Notification preserves seven demos and nineteen triggers", async ({ context, page }, testInfo) => {
  test.setTimeout(90_000);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#component-notification");
  const section = page.locator("#component-notification");
  await expect(section.locator("article.codebox-wrapper")).toHaveCount(7);
  await expect(section.getByTestId("notification-trigger")).toHaveCount(19);
  await expect(section.getByRole("table", { name: "Notification API" })).toBeVisible();

  await section.getByRole("button", { name: "打开通知" }).first().click();
  const basic = page.getByRole("status", { name: "" }).filter({ hasText: "通知提醒" });
  await expect(basic).toBeVisible();
  await expect(basic.locator(".qizhi-notification__close")).toHaveCount(0);
  const layer = page.locator(".qizhi-notification-layer");
  const layerBox = await layer.boundingBox();
  const viewport = page.viewportSize()!;
  expect(Math.round(layerBox!.width)).toBe(Math.min(360, viewport.width - 32));
  expect(Math.round(viewport.width - layerBox!.x - layerBox!.width))
    .toBe(viewport.width <= 600 ? 16 : 24);
  expect(Math.round(layerBox!.y)).toBe(viewport.width <= 600 ? 72 : 80);
  await layer.screenshot({ path: testInfo.outputPath("notification-basic.png") });
  await page.evaluate(() => {
    document.querySelectorAll(".qizhi-notification-layer").forEach((node) => node.remove());
  });

  const types = ["信息", "成功", "警告", "错误", "普通"];
  for (const label of types) {
    await section.locator("#通知提醒框-不同类型").getByRole("button", { name: label }).click();
  }
  await expect(page.locator(".qizhi-notification")).toHaveCount(5);
  await expect(page.getByRole("alert")).toContainText("操作失败");
  const close = page.getByRole("button", { name: "关闭通知" }).first();
  await close.hover();
  await expect(close).toHaveCSS("background-color", "rgb(242, 243, 245)");
  await close.focus();
  await expect(close).toBeFocused();
  await page.getByRole("button", { name: "关闭通知" }).evaluateAll((buttons) => {
    buttons.forEach((button) => (button as HTMLButtonElement).click());
  });
  await expect(page.getByRole("button", { name: "关闭通知" })).toHaveCount(0);

  await section.getByRole("button", { name: "更新通知" }).click();
  const update = page.locator('[data-notification-id="notification-update-content"]');
  await expect(update).toContainText("准备更新");
  await update.evaluate((node) => node.setAttribute("data-same-node", "yes"));
  await expect(update).toContainText("更新成功", { timeout: 2500 });
  await expect(update).toHaveAttribute("data-same-node", "yes");

  await section.locator("#通知提醒框-自定义操作按钮")
    .getByRole("button", { name: "打开通知" }).click();
  const actionNotice = page.locator(".qizhi-notification").filter({ hasText: "任务通知" });
  const actionIconBox = await actionNotice.locator(".qizhi-notification__icon").boundingBox();
  const actionCloseBox = await actionNotice.getByRole("button", { name: "关闭通知" })
    .boundingBox();
  expect(Math.round(actionCloseBox!.y)).toBe(Math.round(actionIconBox!.y));
  expect(actionCloseBox!.x).toBeGreaterThan(actionIconBox!.x);
  await actionNotice.screenshot({ path: testInfo.outputPath("notification-action.png") });
  await actionNotice.getByRole("button", { name: "取消" }).click();
  await expect(actionNotice).toBeHidden();
  await section.locator("#通知提醒框-自定义操作按钮")
    .getByRole("button", { name: "打开通知" }).click();
  await actionNotice.getByRole("button", { name: "好的" }).click();
  await expect(actionNotice).toBeHidden();

  await section.locator("#通知提醒框-更新延迟")
    .getByRole("button", { name: "更新延迟" }).click();
  const durationNotice = page.locator('[data-notification-id="notification-update-duration"]');
  await expect(durationNotice).toContainText("准备更新");
  await expect(durationNotice).toContainText("更新成功", { timeout: 2500 });
  await expect(durationNotice).toBeHidden({ timeout: 3500 });

  const iconDemo = section.locator("#通知提醒框-自定义图标");
  for (const label of ["升级", "成功", "警告", "错误", "微笑"]) {
    await iconDemo.getByRole("button", { name: label }).click();
  }
  await expect(page.locator(".qizhi-notification").filter({
    has: page.locator(".qizhi-notification__icon svg"),
  })).toHaveCount(5);
  await page.getByRole("button", { name: "关闭通知" }).evaluateAll((buttons) => {
    buttons.forEach((button) => (button as HTMLButtonElement).click());
  });

  await section.locator("#通知提醒框-hooks-用法").getByRole("button", { name: "信息" }).click();
  await expect(page.locator(".qizhi-notification-context-layer").getByText("当前用户：启智用户"))
    .toBeVisible();

  for (const codebox of await section.locator("article.codebox-wrapper").all()) {
    await codebox.getByRole("button", { name: "查看代码" }).click();
    const displayed = codebox.locator("pre");
    await codebox.getByRole("button", { name: "复制代码" }).click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toBe(await displayed.innerText());
  }
  await expect(section.getByRole("button", { name: "复制样式" })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
    .toBe(true);
  expect(errors).toEqual([]);
});
