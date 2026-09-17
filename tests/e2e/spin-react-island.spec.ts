import { expect, test } from "@playwright/test";

test("Spin React Island preserves all five contracts", async ({
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

  await page.goto("/#component-spin");
  const section = page.locator("#component-spin");
  await expect(page.getByRole("heading", { name: "加载中 Spin" }))
    .toBeVisible();
  await expect(section.locator("article.codebox-wrapper")).toHaveCount(5);
  await expect(section.getByRole("table", { name: "Spin API" })).toBeVisible();

  const basic = section.locator("#Spin-基础用法");
  const basicIndicator = basic.locator(".qizhi-spin__indicator");
  await expect(basicIndicator).toHaveCSS("width", "20px");
  await expect(basicIndicator).toHaveCSS("height", "20px");
  await expect(basicIndicator).toHaveCSS(
    "animation-name",
    "qizhi-spin-rotate",
  );

  const container = section.locator("#Spin-容器中");
  const toggle = container.locator(".spin-container-demo > .qizhi-btn");
  const spins = container.locator(".qizhi-spin--container");
  await expect(spins).toHaveCount(3);
  await expect(toggle).toHaveAccessibleName("加载中：是");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveText("加载中：否");
  await page.keyboard.press("Space");
  await expect(toggle).toHaveText("加载中：是");
  await expect(spins.first()).toHaveAttribute("aria-busy", "true");
  await expect(spins.first().locator(".qizhi-spin__children"))
    .toHaveAttribute("inert", "");
  await expect(spins.first().locator(".qizhi-spin__children"))
    .toHaveCSS("opacity", "0.38");
  await expect(spins.first().locator(".qizhi-spin__overlay"))
    .toHaveCSS("background-color", "rgba(255, 255, 255, 0.62)");
  await expect(spins.first().locator(".spin-demo-card"))
    .toHaveCSS("min-height", "144px");

  const viewport = page.viewportSize()!;
  const row = container.locator(".spin-container-demo__row");
  const rowColumns = await row.evaluate(
    (node) => getComputedStyle(node).gridTemplateColumns,
  );
  const firstBox = await spins.first().boundingBox();
  if (viewport.width <= 600) {
    expect(rowColumns.split(" ")).toHaveLength(1);
    expect(Math.round(firstBox!.width)).toBe(Math.round((await row.boundingBox())!.width));
  } else {
    expect(rowColumns.split(" ")).toHaveLength(2);
    const rowBox = await row.boundingBox();
    const availableColumnWidth = (rowBox!.width - 16) / 2;
    expect(Math.round(firstBox!.width)).toBe(
      Math.round(Math.min(360, availableColumnWidth)),
    );
  }
  const blockBox = await spins.nth(2).boundingBox();
  expect(Math.round(blockBox!.width)).toBe(
    Math.round((await container.locator(".spin-container-demo").boundingBox())!.width),
  );
  await container.screenshot({
    path: testInfo.outputPath("spin-container-loading.png"),
  });

  await toggle.click();
  await expect(toggle).toHaveText("加载中：否");
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(spins.first()).toHaveAttribute("aria-busy", "false");
  await expect(spins.first().locator(".qizhi-spin__children"))
    .not.toHaveAttribute("inert", "");
  await expect(spins.first().locator(".qizhi-spin__children"))
    .toHaveCSS("opacity", "1");
  await expect(spins.locator(".qizhi-spin__overlay")).toHaveCount(0);
  await container.screenshot({
    path: testInfo.outputPath("spin-container-idle.png"),
  });
  await toggle.click();
  await expect(toggle).toHaveText("加载中：是");

  const tip = section.locator("#Spin-自定义描述文案");
  await expect(tip.getByText("这可能需要一段时间……")).toBeVisible();
  const custom = section.locator("#Spin-自定义指示符");
  await expect(custom.locator(".qizhi-spin__indicator"))
    .toHaveCSS("width", "30px");
  await expect(custom.locator(
    '.qizhi-spin__indicator svg path[fill-opacity="0.45"]',
  )).toBeVisible();
  await tip.screenshot({ path: testInfo.outputPath("spin-tip.png") });
  await custom.screenshot({ path: testInfo.outputPath("spin-custom-icon.png") });

  const sizes = section.locator("#Spin-不同尺寸");
  for (const size of [20, 30, 40]) {
    const indicator = sizes
      .getByRole("status", { name: `${size} 像素加载图标` })
      .locator(".qizhi-spin__indicator");
    await expect(indicator).toHaveCSS("width", `${size}px`);
    await expect(indicator).toHaveCSS("height", `${size}px`);
  }
  await sizes.screenshot({ path: testInfo.outputPath("spin-sizes.png") });

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(basicIndicator).toHaveCSS("animation-name", "none");
  await page.emulateMedia({ reducedMotion: "no-preference" });

  const firstArticle = section.locator("article.codebox-wrapper").first();
  await expect(firstArticle).toHaveClass(/qizhi-react-demo-codebox/);
  await expect(firstArticle.locator(":scope > .demo"))
    .toHaveCSS("margin-bottom", "12px");
  const firstActions = firstArticle.locator(
    ":scope > .component-example-actions",
  );
  await expect(firstActions).toHaveCSS("padding-right", "0px");
  if (viewport.width <= 600) {
    await expect(firstActions).toHaveCSS("padding-left", "0px");
    await expect(firstActions).toHaveCSS("flex-wrap", "wrap");
  }
  await section.getByRole("button", { name: "查看代码" }).first().click();
  const displayed = section.locator("#spin-code-Spin-基础用法 pre");
  await section.getByRole("button", { name: "复制代码" }).first().click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(await displayed.innerText());

  for (const article of await section.locator("article.codebox-wrapper").all()) {
    await expect.poll(() => article.evaluate((node) => (
      node.scrollWidth <= node.clientWidth
    ))).toBe(true);
  }
  await expect.poll(() => page.evaluate(() => (
    document.documentElement.scrollWidth
      <= document.documentElement.clientWidth
  ))).toBe(true);
  expect(errors).toEqual([]);
});
