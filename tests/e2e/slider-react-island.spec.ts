import { expect, test } from "@playwright/test";

test("Slider React Island preserves the nine approved contracts", async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/#component-slider");
  const section = page.locator("#component-slider");
  await expect(page.getByRole("heading", { name: "滑动输入条 Slider" })).toBeVisible();
  await expect(section.locator("article.codebox-wrapper")).toHaveCount(9);
  await expect(section.locator("#滑动输入条-控制-tooltip-的展示 p")).toHaveCount(0);
  await expect(section.getByRole("table", { name: "Slider API" })).toBeVisible();

  const basic = section.locator("#滑动输入条-基本用法");
  const basicHandle = basic.getByRole("slider", { name: "基本用法" });
  await expect(basicHandle).toHaveAttribute("aria-valuenow", "90");
  if ((page.viewportSize()?.width ?? 0) > 600) {
    await expect(basic.locator(".qizhi-slider")).toHaveCSS("width", "200px");
    await expect(basic.locator(".qizhi-slider__track")).toHaveCSS("height", "2px");
    await expect(basicHandle).toHaveCSS("width", "12px");
  }
  await basicHandle.press("ArrowLeft");
  await expect(basicHandle).toHaveAttribute("aria-valuenow", "89");
  await expect(basicHandle).toHaveCSS("width", "14px");
  await basicHandle.press("Home");
  await expect(basicHandle).toHaveAttribute("aria-valuenow", "0");

  const states = section.locator("#滑动输入条-基础状态");
  await expect(states.getByRole("slider", { name: "禁用状态" })).toBeDisabled();

  const range = section.locator("#滑动输入条-范围选择");
  await expect(range.getByRole("slider")).toHaveCount(2);
  await expect(range.getByRole("slider").nth(0)).toHaveAttribute("aria-valuenow", "0");
  await expect(range.getByRole("slider").nth(1)).toHaveAttribute("aria-valuenow", "61");

  const multiple = section.locator("#滑动输入条-多点选择");
  await expect(multiple.getByRole("slider")).toHaveCount(3);
  await multiple.getByRole("slider").nth(1).press("ArrowRight");
  await expect(multiple.getByText("value: [0,21,50]", { exact: true })).toBeVisible();
  await multiple.getByRole("button", { name: "查看代码" }).click();
  await expect(multiple.locator(".qizhi-code-wrapper")).toContainText("<Slider multiple");

  const input = section.locator("#滑动输入条-显示输入框");
  await expect.poll(() => input.getByRole("spinbutton").evaluateAll((fields) =>
    fields.map((field) => (field as HTMLInputElement).value),
  )).toEqual(["80", "10", "80", "80", "10", "80"]);
  await expect(input.locator(".qizhi-input-number__step--addon")).toHaveCount(0);
  await expect(input.locator(".qizhi-input-number--controls-hidden")).toHaveCount(3);
  await expect(input.locator(".qizhi-input-number--controls-hidden .qizhi-input-number__steps"))
    .toHaveCount(0);
  await expect(input.locator(".qizhi-input-number--controls-always")).toHaveCount(3);
  await expect(input.locator(".qizhi-input-number--controls-always .qizhi-input-number__steps").first())
    .toHaveCSS("opacity", "1");
  if ((page.viewportSize()?.width ?? 0) <= 1200) {
    await expect.poll(() => input.locator(".slider-demo-number--with-step").evaluateAll(
      (controls) => controls.map((control) => Math.round(control.getBoundingClientRect().width)),
    )).toEqual([80, 80, 80]);
  }
  await input.screenshot({ path: testInfo.outputPath("slider-input.png") });
  const singleInput = input.getByRole("spinbutton", { name: "单值输入", exact: true });
  await singleInput.fill("64");
  await expect(input.getByRole("slider", { name: "单值", exact: true }))
    .toHaveAttribute("aria-valuenow", "64");
  await input.getByRole("slider", { name: "带步进单值" }).press("ArrowRight");
  await expect(input.getByRole("spinbutton", { name: "带步进单值输入" }))
    .toHaveValue("81");

  const vertical = section.locator("#滑动输入条-竖直滑动条");
  await expect(vertical.getByText("5km", { exact: true })).toBeVisible();
  await expect(vertical.getByText("10km", { exact: true })).toBeVisible();
  await expect(vertical.locator(".qizhi-slider__track").first()).toHaveCSS("height", "160px");
  await vertical.screenshot({ path: testInfo.outputPath("slider-vertical.png") });

  const visibleTooltip = section.locator("#滑动输入条-控制-tooltip-的展示");
  await expect(visibleTooltip.getByRole("slider")).toHaveCount(3);
  await visibleTooltip.scrollIntoViewIfNeeded();
  await expect(page.getByRole("tooltip").filter({ hasText: /^19$/ })).toBeVisible();
  await expect(page.getByRole("tooltip").filter({ hasText: /^0$/ })).toBeVisible();
  await expect(page.getByRole("tooltip").filter({ hasText: /^50$/ })).toBeVisible();
  await visibleTooltip.screenshot({ path: testInfo.outputPath("slider-tooltip-visible.png") });

  const formatter = section.locator("#滑动输入条-自定义提示");
  const formattedHandle = formatter.getByRole("slider", { name: "自定义提示" });
  await formattedHandle.hover();
  await expect(page.getByRole("tooltip").filter({ hasText: /^55%$/ })).toBeVisible();

  const draggable = section.locator("#滑动输入条-范围刻度可拖拽");
  await draggable.scrollIntoViewIfNeeded();
  const bar = draggable.locator(".qizhi-slider__bar");
  const box = await bar.boundingBox();
  if (!box) throw new Error("Draggable bar has no layout box");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 40, box.y + box.height / 2);
  await page.mouse.up();
  await expect(draggable.getByRole("slider").nth(0)).toHaveAttribute("aria-valuenow", "5");
  await expect(draggable.getByRole("slider").nth(1)).toHaveAttribute("aria-valuenow", "8");
  await draggable.screenshot({ path: testInfo.outputPath("slider-draggable.png") });

  await section.getByRole("button", { name: "查看代码" }).first().click();
  const code = section.locator("#slider-code-滑动输入条-基本用法");
  await expect(code).toContainText("<Slider");
  await expect(code).not.toContainText("Demo.tsx");
  await expect(section.getByRole("button", { name: "复制样式" })).toHaveCount(0);
  await expect(section.locator(".component-example-actions .qizhi-code-action"))
    .toHaveCount(18);

  for (const article of await section.locator("article.codebox-wrapper").all()) {
    await expect.poll(() => article.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    )).toBe(true);
  }
  await expect.poll(() => page.evaluate(() =>
    document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  )).toBe(true);
  expect(errors).toEqual([]);
});
