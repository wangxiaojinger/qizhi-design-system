import { expect, test } from "@playwright/test";

test("Steps React Island preserves all legacy contracts", async ({
  context,
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/#component-steps");
  const section = page.locator("#component-steps");
  await expect(section).toHaveClass(/is-visible/);
  await expect(page.getByRole("heading", { name: "步骤条 Steps" }))
    .toBeVisible();
  await expect(section.locator("article.codebox-wrapper")).toHaveCount(5);
  await expect(section.getByRole("table", { name: "Steps API" }))
    .toBeVisible();

  const basic = section.getByRole("list", { name: "基础步骤条" });
  await expect(basic).toHaveCSS("max-width", "780px");
  await expect(basic).toHaveCSS(
    "display",
    page.viewportSize()!.width <= 600 ? "grid" : "flex",
  );
  const basicItems = basic.getByRole("listitem");
  await expect(basicItems).toHaveCount(3);
  await expect(basicItems.nth(0)).toHaveClass(/--finish/);
  await expect(basicItems.nth(1)).toHaveClass(/--process/);
  await expect(basicItems.nth(1)).toHaveAttribute("aria-current", "step");
  await expect(basicItems.nth(2)).toHaveClass(/--wait/);
  await expect(basic.locator(".qizhi-steps__icon").first())
    .toHaveCSS("width", "32px");
  await expect(basic.locator(".qizhi-steps__title").first())
    .toHaveCSS("font-size", "14px");
  await expect(basic.locator(".qizhi-steps__title").first())
    .toHaveCSS("line-height", "22px");

  const small = section.getByRole("list", { name: "小型步骤条" });
  await expect(small.locator(".qizhi-steps__icon").first())
    .toHaveCSS("width", "24px");
  await expect(small.locator(".qizhi-steps__title").first())
    .toHaveCSS("font-size", "13px");

  const described = section.getByRole("list", {
    name: "带描述的步骤条",
  });
  await expect(described.locator(".qizhi-steps__description"))
    .toHaveCount(3);
  await expect(described.locator(".qizhi-steps__description").first())
    .toHaveCSS("font-size", "12px");
  await expect(described.locator(".qizhi-steps__description").first())
    .toHaveCSS("line-height", "20px");

  const errorSteps = section.getByRole("list", {
    name: "带错误状态的步骤条",
  });
  await expect(errorSteps.locator(".qizhi-steps__item--error"))
    .toHaveCount(1);
  await expect(errorSteps.locator(".qizhi-steps__item--next-error"))
    .toHaveCount(1);
  await expect(errorSteps.locator(".qizhi-steps__item--error svg"))
    .toHaveCount(1);

  const panel = section.locator(".steps-demo-panel");
  if (page.viewportSize()!.width <= 600) {
    await expect(panel).toHaveCSS("min-height", "96px");
    await expect(panel).toHaveCSS("margin-top", "20px");
  } else {
    await expect(panel).toHaveCSS("min-height", "140px");
    await expect(panel).toHaveCSS("margin-top", "32px");
  }

  const switchList = section.getByRole("list", {
    name: "可切换的步骤条",
  });
  const previous = section.getByRole("button", { name: "后退" });
  const next = section.getByRole("button", { name: "下一个" });
  const switchContent = section.locator(".steps-switch-content");
  await expect(previous).toBeDisabled();
  await expect(next).toBeEnabled();
  await expect(next.locator(":scope > :last-child"))
    .toHaveClass("qizhi-btn__icon");

  await next.focus();
  await next.press("Enter");
  await expect(switchContent).toHaveText("步骤 2 内容");
  await expect(switchList.getByRole("listitem").nth(0))
    .toHaveClass(/--finish/);
  await next.press("Enter");
  await expect(switchContent).toHaveText("步骤 3 内容");
  await expect(next).toBeDisabled();
  await previous.focus();
  await previous.press("Space");
  await previous.press("Space");
  await expect(switchContent).toHaveText("步骤 1 内容");
  await expect(previous).toBeDisabled();

  const switchPanel = section.locator(".steps-switch-panel");
  if (page.viewportSize()!.width <= 600) {
    await expect(switchPanel).toHaveCSS("min-height", "168px");
    await expect(switchPanel).toHaveCSS("padding-left", "16px");
    await expect(section.locator(".steps-switch-actions"))
      .toHaveCSS("column-gap", "12px");
  } else {
    await expect(switchPanel).toHaveCSS("min-height", "200px");
    await expect(switchPanel).toHaveCSS("padding-left", "32px");
    await expect(section.locator(".steps-switch-actions"))
      .toHaveCSS("column-gap", "20px");
  }

  for (const article of await section.locator(
    "article.codebox-wrapper",
  ).all()) {
    await expect(article.locator(":scope > .demo"))
      .toHaveCSS("margin-bottom", "12px");
    await expect(article.locator(
      ":scope > .component-example-actions",
    )).toHaveCSS("padding-right", "0px");
    expect(await article.evaluate((node) => (
      node.scrollWidth <= node.clientWidth
    ))).toBe(true);
  }

  await section.getByRole("button", { name: "查看代码" }).first().click();
  const displayed = section.locator(
    "#steps-code-步骤条-基础用法 pre",
  );
  await section.getByRole("button", { name: "复制代码" }).first().click();
  await expect.poll(() => page.evaluate(() => (
    navigator.clipboard.readText()
  ))).toBe(await displayed.innerText());
  await section.getByRole("button", { name: "收起代码" }).first().click();

  await section.locator("#步骤条-基础用法").screenshot({
    path: testInfo.outputPath("steps-basic.png"),
  });
  await section.locator("#步骤条-步骤错误").screenshot({
    path: testInfo.outputPath("steps-error.png"),
  });
  await section.locator("#步骤条-步骤切换").screenshot({
    path: testInfo.outputPath("steps-switch.png"),
  });

  await page.goto("/#component-modal");
  await page.locator("#对话框-带有步骤条对话框")
    .getByRole("button", { name: "打开模态框" }).click();
  const dialog = page.getByRole("dialog", { name: "管理插件" });
  await expect(dialog.getByRole("list", { name: "流程进度" }))
    .toHaveClass(/qizhi-steps--small/);
  await dialog.getByRole("button", { name: "取消" }).click();

  expect(await page.evaluate(() => (
    document.documentElement.scrollWidth
      <= document.documentElement.clientWidth
  ))).toBe(true);
  expect(errors).toEqual([]);
});
