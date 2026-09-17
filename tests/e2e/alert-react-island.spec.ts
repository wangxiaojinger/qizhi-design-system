import { expect, test } from "@playwright/test";

test("Alert preserves nine demos, public behavior and same-source code", async ({ context, page }, testInfo) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#component-alert");
  const section = page.locator("#component-alert");
  await expect(section.locator("article.codebox-wrapper")).toHaveCount(9);
  await expect(section.getByRole("table", { name: "Alert API" })).toBeVisible();

  const sizes = section.locator("#警告提示-不同尺寸 .qizhi-alert");
  await expect(sizes).toHaveCount(3);
  for (const [index, height] of [28, 32, 40].entries()) {
    const box = await sizes.nth(index).boundingBox();
    expect(Math.round(box!.height)).toBe(height);
  }

  const types = section.locator("#警告提示-不同类型 .qizhi-alert");
  await expect(types).toHaveCount(4);
  for (const [index, type] of ["info", "success", "warning", "error"].entries()) {
    await expect(types.nth(index)).toHaveClass(new RegExp(`qizhi-alert--${type}`));
  }
  const statusIcons = types.locator(".qizhi-alert__icon svg");
  await expect(statusIcons).toHaveCount(4);
  for (const icon of await statusIcons.all()) {
    await expect(icon).toHaveAttribute("viewBox", "0 0 24 24");
    await expect(icon.locator("path,circle")).toHaveCount(1);
    await expect(icon.locator("path")).toHaveAttribute("fill", "currentColor");
    await expect(icon.locator("path")).not.toHaveAttribute("fill-opacity");
  }

  const inline = section.locator("#警告提示-紧凑型 .qizhi-alert");
  await expect(inline).toHaveCount(3);
  await expect(inline.first()).toHaveCSS("height", "22px");

  const closable = section.locator("#警告提示-可关闭");
  await expect(closable.getByRole("button", { name: "关闭提示" })).toHaveCount(4);
  await closable.getByRole("button", { name: "关闭提示" }).first().focus();
  await expect(closable.getByRole("button", { name: "关闭提示" }).first()).toBeFocused();
  await closable.getByRole("button", { name: "关闭提示" }).first().click();
  await expect(closable.locator(".qizhi-alert")).toHaveCount(3);

  const custom = section.locator("#警告提示-自定义关闭元素");
  await custom.getByRole("button", { name: "确认并关闭" }).click();
  await expect(custom.locator(".qizhi-alert")).toHaveCount(1);
  await custom.getByRole("button", { name: "Close" }).click();
  await expect(custom.locator(".qizhi-alert")).toHaveCount(0);

  await expect(section.locator("#警告提示-不含图标 .qizhi-alert__icon")).toHaveCount(0);
  await expect(section.locator("#警告提示-顶部公告 .qizhi-alert--banner")).toHaveCount(4);
  await section.locator("#警告提示-顶部公告 .alert-demo-browser")
    .screenshot({ path: testInfo.outputPath("alert-banner.png") });

  for (const codebox of await section.locator("article.codebox-wrapper").all()) {
    await codebox.getByRole("button", { name: "查看代码" }).click();
    const displayed = codebox.locator("pre");
    await codebox.getByRole("button", { name: "复制代码" }).click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toBe(await displayed.innerText());
  }
  expect(await section.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <=
    document.documentElement.clientWidth)).toBe(true);
  expect(errors).toEqual([]);
});
