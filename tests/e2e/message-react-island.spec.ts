import { expect, test } from "@playwright/test";

test("Message preserves seven demos, public behavior, and legacy consumers", async ({ context, page }, testInfo) => {
  test.setTimeout(90_000);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#component-message");
  const section = page.locator("#component-message");
  await expect(section.locator("article.codebox-wrapper")).toHaveCount(7);
  await expect(section.getByRole("table", { name: "Message API" })).toBeVisible();
  await expect(section.getByRole("table", { name: "Message.config API" })).toBeVisible();

  const basic = page.locator("#全局提示-基础用法");
  await basic.getByRole("button", { name: "Open Message" }).click();
  const info = page.getByRole("status").filter({ hasText: "This is an info message!" });
  await expect(info).toBeVisible();
  await expect(info).toHaveCSS("min-height", "40px");
  await expect(info).toHaveCSS("padding-left", "16px");
  await expect(info).toHaveCSS("column-gap", "8px");
  await expect(info.locator(".qizhi-message__icon")).toHaveCSS("width", "18px");
  const layerBox = await page.locator('body > .qizhi-message-layer[data-position="top"]').boundingBox();
  const infoBox = await info.boundingBox();
  const viewport = page.viewportSize()!;
  expect(Math.round(layerBox!.y)).toBe(72);
  expect(layerBox!.x).toBeGreaterThanOrEqual(16);
  expect(layerBox!.x + layerBox!.width).toBeLessThanOrEqual(viewport.width - 16);
  expect(infoBox!.x).toBeGreaterThanOrEqual(layerBox!.x);
  await page.screenshot({ path: testInfo.outputPath("message-basic-open.png") });
  await expect(info).toBeHidden({ timeout: 4000 });

  const types = page.locator("#全局提示-不同类型");
  for (const name of ["Info", "Success", "Warning", "Error", "Normal"]) {
    await types.getByRole("button", { name, exact: true }).click();
  }
  await expect(page.getByText("This is a success message!")).toBeVisible();
  await expect(page.getByRole("alert").filter({ hasText: "This is an error message!" })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("message-five-types.png") });
  await expect(page.getByText("This is a success message!")).toBeHidden({ timeout: 4000 });

  const custom = page.locator("#全局提示-自定义图标");
  await custom.getByRole("button", { name: "Info (Light)" }).click();
  await expect(page.getByText("This is an info message!")).toBeVisible();
  await expect(page.getByText("This is an info message!").locator("xpath=../span/*")).toHaveCount(1);
  await expect(page.getByText("This is an info message!")).toBeHidden({ timeout: 4000 });

  const update = page.locator("#全局提示-更新全局提醒内容");
  await update.getByRole("button", { name: "Update message" }).click();
  const updating = page.getByRole("status").filter({ hasText: "Will update after 2 seconds..." });
  await expect(updating).toBeVisible();
  await updating.evaluate((node) => { node.setAttribute("data-update-node", "same"); });
  await expect(page.getByText("Update success!")).toBeVisible({ timeout: 2500 });
  await expect(page.getByText("Update success!").locator("xpath=.."))
    .toHaveAttribute("data-update-node", "same");
  await page.screenshot({ path: testInfo.outputPath("message-updated.png") });
  await expect(page.getByText("Update success!")).toBeHidden({ timeout: 4000 });

  const manual = page.locator("#全局提示-手动控制关闭");
  await manual.getByRole("button", { name: "Close after 2 seconds" }).click();
  await expect(page.getByText("Close after 2 seconds...")).toBeVisible();
  await expect(page.getByText("Close after 2 seconds...")).toBeHidden({ timeout: 3500 });

  const closable = page.locator("#全局提示-显示关闭按钮");
  await closable.getByRole("button", { name: "Open Message" }).click();
  const close = page.getByRole("button", { name: "关闭全局提示" });
  await close.focus();
  await expect(close).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(close).toBeHidden();

  const hooks = page.locator("#全局提示-hooks-用法");
  await hooks.getByRole("button", { name: "Success" }).click();
  const local = hooks.getByRole("status").filter({ hasText: "Current user: PJY" });
  await expect(local).toBeVisible();
  await expect(hooks.locator(".qizhi-message-context-placeholder")).toBeHidden();
  await hooks.locator(".demo").screenshot({ path: testInfo.outputPath("message-context-holder.png") });

  await basic.getByRole("button", { name: "查看代码" }).click();
  const displayed = section.locator("#message-code-全局提示-基础用法 pre");
  await basic.getByRole("button", { name: "复制代码" }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(await displayed.innerText());
  await expect(section.getByRole("button", { name: "复制样式" })).toHaveCount(0);

  for (const article of await section.locator("article.codebox-wrapper").all()) {
    const box = await article.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
    expect(await article.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
  }

  await page.goto("/#component-dropdown");
  const legacyTrigger = page.locator('[data-message-content="You clicked Beijing"]');
  if (await legacyTrigger.count()) {
    await legacyTrigger.click({ force: true });
    await expect(page.getByText("You clicked Beijing")).toBeVisible();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  expect(errors).toEqual([]);
});
