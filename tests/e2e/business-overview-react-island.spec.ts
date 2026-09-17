import { expect, test } from "@playwright/test";

test("Business overview preserves legacy geometry and interactions", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#business-overview-metrics");
  const section = page.locator("#business-overview-metrics");
  await expect(section.getByRole("heading", { name: "概览与指标" }))
    .toBeVisible();
  await expect(section.locator(".codebox-wrapper")).toHaveCount(5);
  const api = section.locator("#business-overview-API");
  await expect(api.getByRole("table")).toHaveCount(5);
  await expect(api.getByRole("table", { name: "TaskOverview API" }))
    .toBeVisible();
  await expect(api.getByRole("table", { name: "MetricCard API" }))
    .toBeVisible();
  await expect.poll(() => api.evaluate((node) => (
    node.scrollWidth <= node.clientWidth
  ))).toBe(true);
  if (testInfo.project.name === "desktop-1440") {
    const toc = page.locator(".toc");
    await expect(toc).toBeVisible();
    await expect(toc.locator(".toc-link")).toHaveText([
      "指标卡",
      "资源用量卡",
      "指标项",
      "对象指标组",
      "组合应用",
      "API",
    ]);
    await toc.getByRole("link", { name: "资源用量卡" }).click();
    await expect(page).toHaveURL(
      /#%E6%A6%82%E8%A7%88%E4%B8%8E%E6%8C%87%E6%A0%87-%E8%B5%84%E6%BA%90%E7%94%A8%E9%87%8F%E5%8D%A1$/,
    );
    await page.screenshot({
      path: testInfo.outputPath("business-overview-shell-desktop.png"),
    });
  }
  const cards = section.locator(".qizhi-task-overview__grid");
  await expect(cards.locator(".qizhi-metric-card")).toHaveCount(6);
  await expect(cards.getByRole("button", { name: /交互式建模/ }))
    .toHaveAttribute("aria-pressed", "true");
  await expect(cards.getByRole("button", { name: /模型评测/ }))
    .toBeDisabled();
  const objectInfo = section.getByLabel("查看异常节点数说明");
  const originalColor = await objectInfo.evaluate((node) => (
    getComputedStyle(node).color
  ));
  await objectInfo.hover();
  await expect(page.getByRole("tooltip"))
    .toContainText("包含离线和故障节点");
  await expect.poll(() => objectInfo.evaluate((node) => ({
    color: getComputedStyle(node).color,
    cursor: getComputedStyle(node).cursor,
  }))).toEqual({ color: originalColor, cursor: "pointer" });
  const dedicatedInfo = cards.getByLabel("查看专属实例说明");
  await dedicatedInfo.focus();
  await expect(page.getByRole("tooltip", {
    name: "统计自定义服务，专属实力数据",
  })).toBeVisible();
  await expect(dedicatedInfo).toHaveClass(/qizhi-metric-info/);
  if (testInfo.project.name === "desktop-1440") {
    await cards.screenshot({
      path: testInfo.outputPath("business-overview-info-tooltip.png"),
    });
  }
  await cards.getByRole("button", { name: /分布式训练/ }).click();
  await expect(section.getByText("distributed-train-a100")).toBeVisible();
  await section.getByRole("button", { name: "查看全部" }).click();
  await expect(section.getByText("tensor-parallel-job")).toBeVisible();
  await expect.poll(() => section.evaluate((node) => (
    node.scrollWidth <= node.clientWidth
  ))).toBe(true);
  await expect.poll(() => cards.evaluate((node) => {
    const boxes = [...node.children].map((child) => (
      child.getBoundingClientRect()
    ));
    return boxes.every((box) => box.width > 0 && box.height >= 84);
  })).toBe(true);
  await section.screenshot({
    path: testInfo.outputPath(`business-overview-${testInfo.project.name}.png`),
  });
  expect(errors).toEqual([]);
});
