import { expect, test } from "@playwright/test";

test("启智平台 Skill.md 文件页复用 CodePreview", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto(process.env.QIZHI_WORKBENCH_BASE_URL ?? "http://127.0.0.1:5191/");
  await page.getByRole("menuitem", { name: "Agent", exact: true }).first().click();
  await page.getByRole("button", { name: /research-summarizer/ }).first().click();
  await page.getByRole("tab", { name: "文件" }).click();

  const preview = page.getByRole("article", { name: "Skill.md 文件预览" });
  await expect(preview.locator(".qizhi-code-preview")).toBeVisible();
  await expect(preview.getByRole("region", { name: "Skill.md 文件内容" })).toBeVisible();
  await expect(preview.locator(".qizhi-code-preview__line-number").first()).toHaveText("1");
  await expect(preview).toContainText("name: dexter");
  await expect(preview).toContainText("# Dexter Skill (Clawdbot)");
  await expect(preview).toContainText("## Troubleshooting");
  await expect(preview).toContainText("Complex queries may take 30-60 seconds");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  expect(errors).toEqual([]);

  await preview.screenshot({ path: testInfo.outputPath(`workbench-skill-preview-${testInfo.project.name}.png`) });
});
