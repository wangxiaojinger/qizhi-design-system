import { expect, test } from "@playwright/test";

test("Avatar 保持五组旧站 Demo、尺寸、形状、重叠和三档响应式", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#component-avatar");

  await expect(page.getByRole("heading", { name: "头像 Avatar" })).toBeVisible();
  await expect(page.locator("#component-avatar article.codebox-wrapper")).toHaveCount(5);
  await expect(page.locator("#avatar-basic .qizhi-avatar")).toHaveCount(5);
  await expect(page.locator("#avatar-size-shape .qizhi-avatar")).toHaveCount(8);
  await expect(page.locator("#avatar-group .qizhi-avatar")).toHaveCount(8);
  await expect(page.locator("#avatar-trigger .qizhi-avatar")).toHaveCount(2);
  await expect(page.locator("#avatar-auto-fit .qizhi-avatar")).toHaveCount(4);
  await expect(page.locator("#avatar-API")).toBeVisible();

  const sized = page.locator("#avatar-size-shape .qizhi-avatar");
  for (const [index, pixels] of [64, 40, 32, 24].entries()) {
    await expect(sized.nth(index)).toHaveCSS("width", `${pixels}px`);
    await expect(sized.nth(index)).toHaveCSS("height", `${pixels}px`);
  }
  await expect(sized.nth(0)).toHaveCSS("border-radius", "50%");
  await expect(sized.nth(4)).toHaveCSS("border-radius", "4px");

  const groupOffsets = await page.locator("#avatar-group .qizhi-avatar-group").evaluateAll((groups) => groups.map((group) => {
    const avatars = [...group.querySelectorAll<HTMLElement>(".qizhi-avatar")];
    return Math.round(avatars[1].getBoundingClientRect().left - avatars[0].getBoundingClientRect().left);
  }));
  for (const avatar of await page.locator("#avatar-group .qizhi-avatar-group > .qizhi-avatar").all()) {
    await expect(avatar).toHaveCSS("border-width", "1px");
  }
  expect(groupOffsets).toEqual([30, 24]);

  const triggerButton = page.getByRole("button", { name: "编辑头像" });
  await expect(triggerButton).toHaveCSS("width", "24px");
  await expect(triggerButton).toHaveCSS("height", "24px");

  const contentFits = await page.locator("#avatar-auto-fit .qizhi-avatar").evaluateAll((avatars) => avatars.every((avatar) => {
    const outer = avatar.getBoundingClientRect();
    const content = avatar.querySelector<HTMLElement>(".qizhi-avatar__content")!.getBoundingClientRect();
    return content.left >= outer.left - 0.5 && content.right <= outer.right + 0.5;
  }));
  expect(contentFits).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  await page.locator("#component-avatar").screenshot({ path: testInfo.outputPath(`avatar-${testInfo.project.name}.png`) });
  expect(errors).toEqual([]);
});

test("Avatar 两种触发入口支持点击和键盘操作", async ({ page }, testInfo) => {
  await page.goto("/#component-avatar");
  const demo = page.locator("#avatar-trigger");
  const status = demo.locator(".avatar-docs-trigger-status");
  const camera = demo.getByRole("button", { name: "拍摄头像" });
  const edit = demo.getByRole("button", { name: "编辑头像" });

  await camera.click();
  await expect(status).toHaveText("已触发拍摄头像操作");
  await edit.focus();
  await expect(edit).toBeFocused();
  await edit.press("Enter");
  await expect(status).toHaveText("已触发编辑头像操作");
  await camera.focus();
  await camera.press("Space");
  await expect(status).toHaveText("已触发拍摄头像操作");

  await edit.focus();
  await demo.screenshot({ path: testInfo.outputPath(`avatar-trigger-${testInfo.project.name}.png`) });
});
