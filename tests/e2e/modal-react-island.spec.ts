import { expect, test } from "@playwright/test";

test("Modal preserves seven demos and nine trigger contracts", async ({ context, page }, testInfo) => {
  test.setTimeout(90_000);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#component-modal");
  const section = page.locator("#component-modal");
  await expect(section.locator("article.codebox-wrapper")).toHaveCount(7);
  await expect(section.getByTestId("modal-trigger")).toHaveCount(9);
  await expect(section.getByRole("table", { name: "Modal API" })).toBeVisible();

  const basicTrigger = section.getByRole("button", { name: "打开模态框" }).first();
  await basicTrigger.click();
  const basic = page.getByRole("dialog", { name: "对话框标题" });
  await expect(basic).toBeVisible();
  await expect(basic).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
  await expect(basic.locator(".qizhi-modal__header")).toHaveCSS(
    "padding",
    "0px 24px",
  );
  await expect(basic.locator(".qizhi-modal__body")).toHaveCSS(
    "padding",
    "16px 24px",
  );
  await expect(basic.locator(".qizhi-modal__footer")).toHaveCSS(
    "padding",
    "16px 24px",
  );
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await expect(basic.getByRole("button", { name: "确定" })).toBeFocused();
  const box = await basic.boundingBox();
  const viewport = page.viewportSize()!;
  expect(Math.round(box!.width)).toBe(Math.min(520, viewport.width - 32));
  expect(Math.round(box!.x * 2 + box!.width)).toBe(viewport.width);
  await page.locator(".qizhi-modal__mask").screenshot({
    path: testInfo.outputPath("modal-basic-open.png"),
  });
  await basic.getByRole("button", { name: "关闭对话框" }).click();
  await expect(basic).toBeHidden();
  await expect(basicTrigger).toBeFocused();

  const asyncTrigger = section.getByRole("button", {
    name: "使用异步逻辑打开模态框",
  });
  await asyncTrigger.click();
  const form = page.getByRole("dialog", { name: "添加用户" });
  await form.getByRole("button", { name: "确定" }).click();
  await expect(form.getByPlaceholder("请输入姓名")).toBeFocused();
  await expect(form.getByPlaceholder("请输入姓名")).toHaveAttribute("aria-invalid", "true");
  await form.getByPlaceholder("请输入姓名").fill("林猫猫");
  await form.getByRole("combobox", { name: "性别" }).click();
  await page.getByRole("option", { name: "女" }).click();
  await form.getByRole("button", { name: "确定" }).click();
  await expect(form.getByRole("button", { name: "确定" })).toHaveAttribute("aria-busy", "true");
  await expect(form).toBeHidden({ timeout: 2500 });

  await section.getByRole("button", { name: "打开自定义按钮属性模态框" }).click();
  await expect(page.getByRole("button", { name: "取消" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "确定" })).toBeDisabled();
  await page.getByRole("button", { name: "关闭对话框" }).click();
  await section.getByRole("button", { name: "打开自定义页脚模态框" }).click();
  await expect(page.getByRole("button", { name: "返回" })).toBeVisible();
  await page.getByRole("button", { name: "提交" }).click();
  await section.getByRole("button", { name: "打开无页脚模态框" }).click();
  await expect(page.getByRole("dialog").locator(".qizhi-modal__footer")).toHaveCount(0);
  await page.keyboard.press("Escape");

  await section.getByRole("button", { name: "确认", exact: true }).click();
  const confirm = page.getByRole("dialog", { name: "确认删除" });
  await expect(confirm.getByText("确定要删除已选择的 3 个项目吗？删除后无法撤销此操作。"))
    .toBeVisible();
  await confirm.getByRole("button", { name: "取消" }).click();

  await section.locator("#对话框-手动更新和移除")
    .getByRole("button", { name: "打开模态框" }).click();
  const statusDialog = page.getByRole("dialog", { name: "提交中..." });
  await statusDialog.evaluate((node) => node.setAttribute("data-modal-node", "same"));
  const updated = page.getByRole("dialog", { name: "提交成功" });
  await expect(updated).toHaveAttribute("data-modal-node", "same", { timeout: 2200 });
  await expect(updated.locator(".qizhi-modal__footer")).toHaveCount(0);
  await page.getByRole("dialog", { name: "提交成功" }).screenshot({
    path: testInfo.outputPath("modal-updated.png"),
  });
  await expect(statusDialog).toBeHidden({ timeout: 2200 });

  await section.locator("#对话框-带有通知对话框")
    .getByRole("button", { name: "打开模态框" }).click();
  const alertDialog = page.getByRole("dialog", { name: "管理插件" });
  await expect(alertDialog.getByText("此提示仅显示一次。")).toBeVisible();
  const selectAll = alertDialog.getByRole("checkbox", { name: "全选当前数据" });
  await selectAll.locator("xpath=..").click();
  await expect(selectAll).toBeChecked();
  await alertDialog.getByRole("button", { name: "确定" }).click();

  await section.locator("#对话框-带有步骤条对话框")
    .getByRole("button", { name: "打开模态框" }).click();
  const steps = page.getByRole("dialog", { name: "管理插件" });
  await expect(steps.getByLabel("流程进度")).toBeVisible();
  await expect(steps.locator("tbody tr")).toHaveCount(3);
  await steps.screenshot({ path: testInfo.outputPath("modal-steps.png") });
  await steps.getByRole("button", { name: "取消" }).click();

  const first = section.locator("article.codebox-wrapper").first();
  await first.getByRole("button", { name: "查看代码" }).click();
  const displayed = section.locator("#modal-code-对话框-基础用法 pre");
  await first.getByRole("button", { name: "复制代码" }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(await displayed.innerText());
  await expect(section.getByRole("button", { name: "复制样式" })).toHaveCount(0);

  const overflowingArticles = await section.locator("article.codebox-wrapper").evaluateAll((articles) => articles
    .map((article) => ({
      id: article.id,
      clientWidth: article.clientWidth,
      scrollWidth: article.scrollWidth,
      left: article.getBoundingClientRect().left,
      right: article.getBoundingClientRect().right,
    }))
    .filter((article) => article.left < 0 || article.right > window.innerWidth || article.scrollWidth > article.clientWidth));
  expect(overflowingArticles).toEqual([]);
  expect(await page.evaluate(() => (
    document.documentElement.scrollWidth <= document.documentElement.clientWidth
  ))).toBe(true);
  expect(errors).toEqual([]);
});
