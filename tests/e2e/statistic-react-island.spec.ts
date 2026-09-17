import { expect, test } from "@playwright/test";

test("Statistic 保持四组 Demo、加载交互和三档几何", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/#component-statistic");
  await expect(page.getByRole("heading", { name: "数值显示 Statistic" }))
    .toBeVisible();
  await expect(page.locator("#component-statistic article.codebox-wrapper"))
    .toHaveCount(4);
  await expect(page.getByRole("table", { name: "Statistic API" }))
    .toBeVisible();

  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          (window as typeof window & { __statisticCopied?: string })
            .__statisticCopied = value;
        },
      },
    });
  });

  const titles = await page.locator(
    "#component-statistic article.codebox-wrapper > .qz-description h2",
  ).allTextContents();
  expect(titles).toEqual([
    "基础用法",
    "前缀后缀/自定义样式",
    "时间格式",
    "加载中",
  ]);

  const basicCodebox = page.locator("#数值显示-基础用法");
  await basicCodebox.getByRole("button", { name: "查看代码" }).click();
  const displayedSource = await basicCodebox.locator(".qizhi-code-wrapper code")
    .textContent();
  await basicCodebox.getByRole("button", { name: "复制代码" }).click();
  const copiedSource = await page.evaluate(() => (
    (window as typeof window & { __statisticCopied?: string })
      .__statisticCopied
  ));
  expect(copiedSource).toBe(displayedSource);
  await expect(basicCodebox.getByRole("status")).toHaveText("复制成功");

  await expect(page.locator("#数值显示-基础用法 .qizhi-statistic__value").first())
    .toHaveText("125,670");
  await expect(page.locator("#数值显示-基础用法 .qizhi-statistic__value").nth(1))
    .toHaveText("40,509.00");
  await expect(page.locator(
    "#数值显示-时间格式 time.qizhi-statistic__value",
  )).toHaveText("2019/04/10 12:16:53");

  const growth = page.locator(
    "#数值显示-前缀后缀-自定义样式 "
    + ".qizhi-statistic:nth-child(3) .qizhi-statistic__value",
  );
  await expect(growth).toHaveText("50.32%");
  await expect(growth).toHaveCSS("color", "rgb(255, 77, 79)");
  await expect(page.locator(
    "#数值显示-前缀后缀-自定义样式 "
    + ".qizhi-statistic:nth-child(2) .ri-arrow-down-line",
  )).toHaveCSS("color", "rgb(82, 196, 26)");
  await expect(page.locator(
    "#数值显示-前缀后缀-自定义样式 .ri-arrow-up-line",
  )).toHaveCount(2);
  await expect(page.locator(
    "#数值显示-前缀后缀-自定义样式 .ri-arrow-down-line",
  )).toHaveCount(1);

  const loadingDemo = page.locator("#数值显示-加载中");
  const toggle = loadingDemo.getByRole("switch", {
    name: "切换数值加载状态",
  });
  await expect(toggle).toHaveAttribute("aria-checked", "true");
  await expect(loadingDemo.getByRole("status", { name: "数值加载中" }))
    .toBeVisible();
  await expect(loadingDemo.locator(".qizhi-statistic__value"))
    .toHaveCount(0);
  await toggle.focus();
  await toggle.press("Space");
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  await expect(loadingDemo.locator(".qizhi-statistic__value"))
    .toHaveText("125,670");
  await toggle.press("Enter");
  await expect(toggle).toHaveAttribute("aria-checked", "true");

  const row = page.locator("#数值显示-基础用法 .statistic-docs-row");
  if (testInfo.project.name === "mobile-375") {
    await expect(row).toHaveCSS("display", "grid");
    await expect(row).toHaveCSS("gap", "24px");
    await expect(page.locator(
      "#数值显示-时间格式 .qizhi-statistic__value",
    )).toHaveCSS("font-size", "20px");
  } else {
    await expect(row).toHaveCSS("display", "flex");
    await expect(row).toHaveCSS("column-gap", "60px");
    await expect(page.locator(
      "#数值显示-时间格式 .qizhi-statistic__value",
    )).toHaveCSS("font-size", "24px");
  }
  await expect(page.locator(
    "#数值显示-基础用法 .qizhi-statistic__value",
  ).first()).toHaveCSS("font-size", "28px");

  const demos = await page.locator(
    "#component-statistic .codebox-wrapper > .demo",
  ).evaluateAll((nodes) => nodes.map((node) => ({
    id: node.parentElement?.id,
    clientWidth: node.clientWidth,
    scrollWidth: node.scrollWidth,
  })));
  expect(demos.filter((demo) => demo.scrollWidth > demo.clientWidth + 1))
    .toEqual([]);
  expect(await page.evaluate(() => (
    document.documentElement.scrollWidth
      <= document.documentElement.clientWidth
  ))).toBe(true);
  expect(errors).toEqual([]);

  for (const id of [
    "数值显示-基础用法",
    "数值显示-前缀后缀-自定义样式",
    "数值显示-时间格式",
    "数值显示-加载中",
  ]) {
    await page.locator(`#${id} > .demo`).screenshot({
      path: testInfo.outputPath(`${id}-${testInfo.project.name}.png`),
    });
  }
});
