import { expect, test } from "@playwright/test";

const imageFile = (name: string) => ({
  name,
  mimeType: "image/png",
  buffer: Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64",
  ),
});

test("Upload React Island preserves eight complete contracts", async ({ context, page }, testInfo) => {
  test.setTimeout(90_000);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/#component-upload");
  const section = page.locator("#component-upload");
  await expect(page.getByRole("heading", { name: "上传 Upload" })).toBeVisible();
  await expect(section.locator("article.codebox-wrapper")).toHaveCount(8);
  await expect(section.getByRole("table", { name: "Upload API" })).toBeVisible();

  const basic = section.locator("#上传-基础用法");
  await expect(basic.getByRole("button", { name: "点击上传" })).toHaveCount(2);
  await expect(basic.getByRole("button", { name: "点击上传" }).nth(1)).toBeDisabled();
  await expect(basic.locator(".upload-demo-basic")).toHaveCSS("row-gap", "40px");
  const basicBox = await basic.boundingBox();
  expect(basicBox).not.toBeNull();
  expect(basicBox!.x).toBeGreaterThanOrEqual(0);
  expect(basicBox!.x + basicBox!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  await basic.screenshot({ path: testInfo.outputPath("upload-basic.png") });

  const drag = section.locator("#上传-拖拽上传");
  const dropzone = drag.getByRole("button", { name: "点击或拖动文件到该区域上传" });
  await expect(dropzone).toHaveCSS("min-height", "132px");
  const dragUploadIcon = dropzone.locator('[data-icon="icon-上传"]');
  await expect(dragUploadIcon).toBeVisible();
  await expect(dragUploadIcon).toHaveCSS("width", "48px");
  await expect(dragUploadIcon).toHaveCSS("height", "48px");
  const dataTransfer = await page.evaluateHandle(() => {
    const transfer = new DataTransfer();
    transfer.items.add(new File(["ice"], "ice.png", { type: "image/png" }));
    return transfer;
  });
  await dropzone.dispatchEvent("dragenter", { dataTransfer });
  await expect(dropzone.locator("..")) .toHaveClass(/is-dragover/);
  await dropzone.dispatchEvent("drop", { dataTransfer });
  await expect(drag.getByText("ice.png")).toBeVisible();
  await drag.locator("input[type=file]").setInputFiles({
    name: "readme.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("text"),
  });
  await expect(drag.getByRole("alert")).toHaveText("不接受的文件类型，请重新上传指定文件类型~");
  await drag.screenshot({ path: testInfo.outputPath("upload-drag.png") });

  const listDemo = section.locator("#上传-已上传的文件列表");
  await expect(listDemo.locator("[data-upload-file-item]")).toHaveCount(4);
  await expect(listDemo.getByText("ice.png").locator("..").locator("[role=progressbar]"))
    .toHaveAttribute("aria-valuenow", "28");
  const catItem = listDemo.getByText("cat.png").locator("../..");
  await expect(catItem).toHaveClass(/is-error/);
  await catItem.hover();
  await expect(catItem.getByRole("button", { name: "删除 cat.png" })).toHaveCSS("opacity", "1");
  await listDemo.screenshot({ path: testInfo.outputPath("upload-file-list-initial.png") });
  await catItem.getByRole("button", { name: "重新上传 cat.png" }).click();
  await expect(catItem).toHaveClass(/is-success/);
  await listDemo.screenshot({ path: testInfo.outputPath("upload-file-list-retried.png") });

  const beforeUpload = section.locator("#上传-上传前校验");
  const beforeUploadTrigger = beforeUpload.getByRole("button", { name: "点击上传" });
  await beforeUploadTrigger.focus();
  await beforeUpload.locator("input[type=file]").setInputFiles(imageFile("confirm.png"));
  const uploadDialog = page.getByRole("dialog", { name: "beforeUpload" });
  await expect(uploadDialog).toContainText("确认上传 confirm.png");
  await uploadDialog.getByRole("button", { name: "取消" }).click();
  await expect(uploadDialog).toBeHidden();
  await expect(beforeUpload.getByText("confirm.png")).toHaveCount(0);
  await expect(beforeUploadTrigger).toBeFocused();

  const beforeRemove = section.locator("#上传-移除前校验");
  const lightItem = beforeRemove.getByText("light.png").locator("../..");
  await lightItem.hover();
  const removeTrigger = lightItem.getByRole("button", { name: "删除 light.png" });
  await removeTrigger.click();
  const removeDialog = page.getByRole("dialog", { name: "onRemove" });
  await expect(removeDialog).toContainText("确认删除 light.png");
  await page.keyboard.press("Escape");
  await expect(removeDialog).toBeHidden();
  await expect(beforeRemove.getByText("light.png")).toBeVisible();
  await expect(removeTrigger).toBeFocused();

  const crop = section.locator("#上传-上传前裁剪");
  await crop.getByRole("button", { name: "点击上传" }).focus();
  await crop.locator("input[type=file]").setInputFiles(imageFile("crop.png"));
  const cropDialog = page.getByRole("dialog", { name: "裁剪图片" });
  await expect(cropDialog).toBeVisible();
  await expect(cropDialog).toHaveCSS("opacity", "1");
  await expect(cropDialog).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(cropDialog.getByRole("heading", { name: "裁剪图片" })).toBeVisible();
  await expect(cropDialog.getByRole("button", { name: "取消" })).toBeVisible();
  const stage = cropDialog.locator(".upload-demo-cropper__stage");
  await expect(stage).toHaveCSS("height", (page.viewportSize()?.width ?? 0) <= 375 ? "220px" : "260px");
  await cropDialog.getByRole("slider", { name: "缩放" }).press("ArrowRight");
  await expect(stage).toHaveCSS("--upload-crop-zoom", "1.1");
  const dialogBox = await cropDialog.boundingBox();
  expect(dialogBox).not.toBeNull();
  expect(dialogBox!.x).toBeGreaterThanOrEqual(0);
  expect(dialogBox!.y).toBeGreaterThanOrEqual(0);
  expect(dialogBox!.x + dialogBox!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  expect(dialogBox!.y + dialogBox!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await cropDialog.locator("..").screenshot({ path: testInfo.outputPath("upload-crop-dialog.png") });
  await cropDialog.getByRole("button", { name: "取消" }).click();

  const limit = section.locator("#上传-限制上传数量");
  const limitInput = limit.locator("input[type=file]");
  await limitInput.setInputFiles([imageFile("1.png"), imageFile("2.png"), imageFile("3.png")]);
  await expect(limit.locator("[data-upload-file-item]")).toHaveCount(3);
  await expect(limit.getByRole("button", { name: "点击上传" })).toHaveCount(0);
  const firstLimitItem = limit.locator("[data-upload-file-item]").first();
  await firstLimitItem.hover();
  await firstLimitItem.getByRole("button", { name: /^delete|^Delete|^删除/ }).click();
  await expect(limit.getByRole("button", { name: "点击上传" })).toBeVisible();

  const directory = section.locator("#上传-文件夹上传 input[type=file]");
  await expect(directory).toHaveAttribute("webkitdirectory", "");

  const firstCodebox = section.locator("article.codebox-wrapper").first();
  await expect(firstCodebox.locator(":scope > .demo")).toHaveCSS("margin-bottom", "12px");
  await expect(firstCodebox.locator(":scope > .component-example-actions"))
    .toHaveCSS("padding-right", "0px");
  const demoBox = await firstCodebox.locator(":scope > .demo").boundingBox();
  const actionsBox = await firstCodebox.locator(":scope > .component-example-actions").boundingBox();
  expect(Math.round(actionsBox!.y - (demoBox!.y + demoBox!.height))).toBe(12);
  await section.getByRole("button", { name: "查看代码" }).first().click();
  const displayedCode = section.locator("#upload-code-上传-基础用法 pre");
  await section.getByRole("button", { name: "复制代码" }).first().click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(await displayedCode.innerText());
  await expect(section.getByRole("button", { name: "复制样式" })).toHaveCount(0);
  await expect(section.locator(".component-example-actions .qizhi-code-action")).toHaveCount(16);

  for (const article of await section.locator("article.codebox-wrapper").all()) {
    const articleBox = await article.boundingBox();
    expect(articleBox).not.toBeNull();
    expect(articleBox!.x).toBeGreaterThanOrEqual(0);
    expect(articleBox!.x + articleBox!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    await expect.poll(() => article.evaluate((element) => (
      element.scrollWidth <= element.clientWidth
    ))).toBe(true);
  }
  await expect.poll(() => page.evaluate(() => (
    document.documentElement.scrollWidth <= document.documentElement.clientWidth
  ))).toBe(true);
  expect(errors).toEqual([]);
});
