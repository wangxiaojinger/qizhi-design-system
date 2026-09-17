import { expect, test } from "@playwright/test";

test("Drawer React Island preserves both complete contracts", async ({ context, page }, testInfo) => {
  test.setTimeout(90_000);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/#component-drawer");
  const section = page.locator("#component-drawer");
  await expect(page.getByRole("heading", { name: "抽屉 Drawer" })).toBeVisible();
  await expect(section.locator("article.codebox-wrapper")).toHaveCount(2);
  await expect(section.getByRole("table", { name: "Drawer API" })).toBeVisible();

  const basicTrigger = section.getByRole("button", { name: "打开抽屉", exact: true });
  await basicTrigger.click();
  const basic = page.getByRole("dialog", { name: "基础信息" });
  await expect(basic).toBeVisible();
  await expect(basic).toHaveCSS("opacity", "1");
  await expect(basic).toHaveCSS("transform", "none");
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await expect(basic.getByRole("button", { name: "关闭抽屉" })).toBeFocused();
  await expect(basic.getByText("这里是抽屉中的示例文本。")).toHaveCount(2);
  const basicBox = await basic.boundingBox();
  const viewport = page.viewportSize()!;
  const expectedBasicWidth = viewport.width <= 640 ? viewport.width : 760;
  expect(Math.round(basicBox!.width)).toBe(expectedBasicWidth);
  expect(Math.round(basicBox!.x + basicBox!.width)).toBe(viewport.width);
  expect(Math.round(basicBox!.y)).toBe(0);
  expect(Math.round(basicBox!.height)).toBe(viewport.height);
  await page.locator(".qizhi-drawer-layer").screenshot({
    path: testInfo.outputPath("drawer-basic-open.png"),
  });

  if (viewport.width > 640) {
    await page.getByRole("button", { name: "关闭抽屉遮罩" })
      .click({ position: { x: 4, y: 4 } });
  } else {
    await basic.getByRole("button", { name: "关闭抽屉" }).click();
  }
  await expect(basic).toBeHidden();
  await expect(basicTrigger).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");

  await basicTrigger.click();
  await page.getByRole("button", { name: "关闭抽屉", exact: true }).click();
  await expect(basicTrigger).toBeFocused();
  await basicTrigger.click();
  await page.keyboard.press("Escape");
  await expect(basicTrigger).toBeFocused();
  await basicTrigger.click();
  await basic.getByRole("button", { name: "取消" }).click();
  await expect(basicTrigger).toBeFocused();

  const formTrigger = section.getByRole("button", { name: "打开抽屉表单" });
  await formTrigger.click();
  const formDrawer = page.getByRole("dialog", { name: "新建交互式建模" });
  await expect(formDrawer).toBeVisible();
  const formBox = await formDrawer.boundingBox();
  const expectedFormWidth = viewport.width <= 640 ? viewport.width : 960;
  expect(Math.round(formBox!.width)).toBe(expectedFormWidth);
  expect(Math.round(formBox!.x + formBox!.width)).toBe(viewport.width);
  const expectedInset = viewport.width <= 640 ? "20px" : "24px";
  await expect(formDrawer.locator(".qizhi-drawer-body")).toHaveCSS("padding-left", expectedInset);
  await expect(formDrawer.locator(".drawer-form-shell")).toHaveCSS(
    "margin-left",
    viewport.width <= 640 ? "-20px" : "-24px",
  );
  await expect(formDrawer.locator(".drawer-form-demo-form")).toHaveCSS("row-gap", "16px");
  await expect(formDrawer.locator(".drawer-form-section").first()).toHaveCSS(
    "padding-left",
    expectedInset,
  );
  await expect(formDrawer.locator(".drawer-form-section").first()).toHaveCSS("row-gap", "20px");
  await expect(formDrawer.locator(".qizhi-drawer-footer")).toHaveCSS("column-gap", "12px");
  const formCancel = formDrawer.getByRole("button", { name: "取 消" });
  await expect(formCancel).toHaveClass(/qizhi-btn-secondary/);
  await expect(formCancel).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await formCancel.click();
  await expect(formDrawer).toBeHidden();
  await expect(formTrigger).toBeFocused();
  await formTrigger.click();
  await expect(formDrawer).toBeVisible();
  await expect(formDrawer.locator(".drawer-form-section")).toHaveCount(3);
  await expect(formDrawer.getByText("0 / 32", { exact: true })).toBeVisible();
  await expect(formDrawer.getByRole("button", { name: "选择规格" })).toBeDisabled();
  await expect(formDrawer.getByRole("switch", { name: "共享内存" })).toBeDisabled();
  await expect(formDrawer.getByRole("switch", { name: "共享内存" }))
    .toHaveCSS("background-color", "rgb(242, 243, 245)");
  await expect(formDrawer.getByRole("switch", { name: "启用 Slurm 调度" })).toBeDisabled();

  const refresh = formDrawer.getByRole("button", { name: "刷新所属项目" });
  await expect(refresh).not.toHaveCSS("color", "rgb(51, 102, 255)");
  const computeRefresh = formDrawer.getByRole("button", { name: "刷新计算类型组" });
  await expect(computeRefresh)
    .toHaveCSS("color", "rgb(134, 144, 156)");
  for (const refreshButton of [refresh, computeRefresh]) {
    await refreshButton.click();
    await expect(refreshButton).toHaveClass(/is-refreshing/);
    await expect(refreshButton.locator("svg")).toHaveCSS(
      "animation-name",
      "drawer-form-refresh",
    );
    await expect(refreshButton).not.toHaveClass(/is-refreshing/);
  }
  const resourceButton = formDrawer.getByRole("button", { name: "选择规格" });
  expect(await resourceButton.evaluate((node) => node.getBoundingClientRect().width))
    .toBeLessThan(120);
  const stopSwitch = formDrawer.getByRole("switch", { name: "自动停止策略" });
  await stopSwitch.click();
  await expect(stopSwitch).toHaveAttribute("aria-checked", "true");
  await formDrawer.getByText("个人可见镜像", { exact: true }).click();
  await expect(formDrawer.getByRole("radio", { name: "个人可见镜像" })).toBeChecked();

  const project = formDrawer.getByRole("combobox", { name: "所属项目" });
  await project.click();
  const listbox = page.getByRole("listbox");
  await expect(listbox).toBeVisible();
  const popupBox = await listbox.boundingBox();
  expect(popupBox!.x).toBeGreaterThanOrEqual(0);
  expect(popupBox!.x + popupBox!.width).toBeLessThanOrEqual(viewport.width);
  expect(popupBox!.y).toBeGreaterThanOrEqual(0);
  expect(popupBox!.y + popupBox!.height).toBeLessThanOrEqual(viewport.height);
  await page.locator(".qizhi-drawer-layer").screenshot({
    path: testInfo.outputPath("drawer-form-select-open.png"),
  });
  await page.getByRole("option", { name: "研发项目" }).click();
  await expect(project).toHaveValue("研发项目");
  await formDrawer.screenshot({ path: testInfo.outputPath("drawer-form-open.png") });
  await formDrawer.getByRole("button", { name: "新 建" }).click();
  await expect(formTrigger).toBeFocused();

  const firstCodebox = section.locator("article.codebox-wrapper").first();
  await expect(firstCodebox.locator(":scope > .demo")).toHaveCSS("margin-bottom", "12px");
  await expect(firstCodebox.locator(":scope > .component-example-actions"))
    .toHaveCSS("padding-right", "0px");
  await section.getByRole("button", { name: "查看代码" }).first().click();
  const displayed = section.locator("#drawer-code-抽屉-基础用法 pre");
  await section.getByRole("button", { name: "复制代码" }).first().click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(await displayed.innerText());
  await expect(section.getByRole("button", { name: "复制样式" })).toHaveCount(0);

  for (const article of await section.locator("article.codebox-wrapper").all()) {
    const box = await article.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
    await expect.poll(() => article.evaluate((element) => (
      element.scrollWidth <= element.clientWidth
    ))).toBe(true);
  }

  await page.goto("/#business-detail-header");
  const versionTrigger = page.locator('[data-drawer-open="qizhi-detail-version-drawer"]');
  await versionTrigger.click();
  const versionDrawer = page.getByRole("dialog", { name: "版本列表" });
  await expect(versionDrawer).toBeVisible();
  await expect(versionDrawer.locator(".qizhi-detail-version-table")).toBeVisible();
  await versionDrawer.screenshot({ path: testInfo.outputPath("drawer-legacy-version.png") });
  await page.keyboard.press("Escape");
  await expect(versionDrawer).toBeHidden();
  await expect(versionTrigger).toBeFocused();

  await expect.poll(() => page.evaluate(() => (
    document.documentElement.scrollWidth <= document.documentElement.clientWidth
  ))).toBe(true);
  expect(errors).toEqual([]);
});
