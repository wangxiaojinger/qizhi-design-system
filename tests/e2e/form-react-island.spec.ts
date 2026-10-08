import { expect, test } from "@playwright/test";

test("Form 保留旧站契约并覆盖复杂字段、远程状态与响应式几何", async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#component-form");

  await expect(page.locator("#component-form article.codebox-wrapper")).toHaveCount(9);
  await expect(page.locator("#component-form .qz-demo-title").filter({ hasText: "基础用法" })).toHaveCount(1);
  await expect(page.locator("#component-form .qz-demo-title").filter({ hasText: "表单布局" })).toHaveCount(1);
  await expect(page.locator("#component-form .qz-demo-title").filter({ hasText: "受控表单" })).toHaveCount(1);
  await expect(page.locator("#component-form .qz-demo-title").filter({ hasText: "多步骤表单" })).toHaveCount(1);
  await expect(page.locator("#component-form .qz-demo-title").filter({ hasText: "表单草稿" })).toHaveCount(1);
  await expect(page.locator("#component-form .qz-demo-title").filter({ hasText: "高级动态列表" })).toHaveCount(0);
  await expect(page.locator("#component-form .qz-demo-title").filter({ hasText: "批量编辑" })).toHaveCount(1);
  await expect(page.getByRole("table", { name: "Form API" })).toBeVisible();
  await expect(page.getByRole("table", { name: "Form.Item API" })).toBeVisible();
  await expect(page.getByRole("table", { name: "Form.List API" })).toBeVisible();
  await expect(page.getByRole("table", { name: "Form.ErrorList API" })).toBeVisible();
  await expect(page.getByRole("table", { name: "Form.useSteps API" })).toBeVisible();
  await expect(page.getByRole("table", { name: "Form.useDraft API" })).toBeVisible();
  await expect(page.getByRole("table", { name: "Form.useBulkEdit API" })).toBeVisible();
  await expect(page.locator("#component-form .qizhi-form")).toHaveCount(9);

  const basic = page.locator("#表单-基础用法");
  const name = basic.getByRole("textbox", { name: "服务名称" });
  await expect(name).toHaveAttribute("placeholder", "请输入");
  await name.fill("service-a");
  await expect(basic.getByText("9/32")).toBeVisible();
  await basic.getByRole("combobox", { name: "所属项目" }).click();
  await page.getByRole("option", { name: "公共项目" }).click();
  await expect(basic.getByRole("combobox", { name: "所属项目" })).toHaveValue("公共项目");

  const formWidth = await basic.locator(".qizhi-form").evaluate((node) => node.getBoundingClientRect().width);
  expect(formWidth).toBeLessThanOrEqual(606);
  await expect(basic.locator(".qizhi-form")).toHaveCSS("row-gap", "24px");
  await expect(basic.locator(".qizhi-form-item").first()).toHaveCSS("row-gap", "8px");
  await expect(basic.locator(".qizhi-form-item-extra")).toHaveCSS("font-size", "12px");
  await expect(basic.locator(".qizhi-input").first()).toHaveCSS("height", "32px");

  const layout = page.locator("#表单-表单布局");
  await expect(layout.getByRole("radio", { name: "垂直的" })).toBeChecked();
  await layout.getByRole("radio", { name: "水平的" }).locator("xpath=..").click();
  await expect(layout.getByRole("form")).toHaveClass(/qizhi-form-layout-horizontal/);
  const columns = await layout.locator(".qizhi-form-item").first().evaluate(
    (node) => getComputedStyle(node).gridTemplateColumns,
  );
  if ((page.viewportSize()?.width ?? 0) > 720) expect(columns.split(" ")[0]).toBe("112px");
  else expect(columns.split(" ")).toHaveLength(1);

  const controlled = page.locator("#表单-受控表单");
  await expect(controlled.getByRole("radio", { name: "官方镜像" })).toBeChecked();
  await controlled.getByRole("radio", { name: "个人可见镜像" }).locator("xpath=..").click();
  await expect(controlled.getByRole("radio", { name: "个人可见镜像" })).toBeChecked();
  const modelButton = controlled.getByRole("button", { name: "选择模型" });
  await expect(modelButton).toBeVisible();
  expect(await modelButton.evaluate((node) => node.getBoundingClientRect().width))
    .toBeLessThan(120);
  const neutralIconColor = "rgb(134, 144, 156)";
  await expect(basic.getByRole("button", { name: "刷新计算类型组" }))
    .toHaveCSS("color", neutralIconColor);
  await expect(controlled.getByRole("button", { name: "运行命令说明" }))
    .toHaveCSS("color", neutralIconColor);
  await expect(controlled.getByRole("button", { name: "端口号说明" }))
    .toHaveCSS("color", neutralIconColor);
  const command = controlled.getByRole("textbox", { name: "运行命令" });
  await expect(command).toHaveAttribute("placeholder", "请输入");
  expect(await command.evaluate((node) => node.tagName)).toBe("INPUT");
  await expect(command).toHaveCSS("color", "rgb(29, 33, 41)");
  expect(await command.evaluate(
    (node) => getComputedStyle(node, "::placeholder").color,
  )).toBe("rgb(201, 205, 212)");
  const description = controlled.getByPlaceholder("请输入描述文本");
  expect(await description.evaluate(
    (node) => getComputedStyle(node, "::placeholder").color,
  )).toBe("rgb(201, 205, 212)");
  const commandGap = await controlled.locator(".form-docs-command-row").evaluate((node) => {
    const [commandControl, portControl] = Array.from(node.children);
    return portControl.getBoundingClientRect().left
      - commandControl.getBoundingClientRect().right;
  });
  if ((page.viewportSize()?.width ?? 0) > 720) expect(commandGap).toBe(16);
  await expect(controlled.getByPlaceholder("输入端口号")).toHaveValue("");
  await expect(controlled.getByPlaceholder("请输入描述文本")).toHaveValue("");
  await controlled.getByRole("button", { name: "运行命令说明" }).focus();
  await expect(page.getByRole("tooltip", { name: "填写容器启动命令" })).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath(`form-tooltip-${testInfo.project.name}.png`),
  });

  const complex = page.locator("#表单-复杂表单联动");
  await expect(complex.getByRole("textbox", { name: /成员 \d+ 名称/ })).toHaveCount(2);
  await complex.getByRole("button", { name: "新增成员" }).click();
  await expect(complex.getByRole("textbox", { name: /成员 \d+ 名称/ })).toHaveCount(3);
  await complex.getByRole("button", { name: "提交复杂表单" }).click();
  await expect(complex.getByText("请输入成员名称")).toBeVisible();
  await complex.getByRole("textbox", { name: "成员 3 名称" }).fill("成员丙");
  await expect(complex.getByRole("button", { name: /上移|下移/ })).toHaveCount(0);
  await complex.getByRole("button", { name: "删除成员 2" }).focus();
  await expect(page.getByRole("tooltip", { name: "删除" })).toBeVisible();
  await expect(page.getByRole("tooltip", { name: "删除" })).toHaveAttribute("data-tooltip-position", "right");
  await complex.getByRole("button", { name: "删除成员 3" }).click();
  await expect(complex.getByRole("textbox", { name: /成员 \d+ 名称/ })).toHaveCount(2);

  await complex.getByRole("button", { name: "模拟成员错误" }).click();
  await expect(complex.getByRole("alert")).toContainText("成员名称已存在");

  const wizard = page.locator("#表单-多步骤表单");
  await wizard.getByRole("button", { name: "下一步" }).click();
  await expect(wizard.getByRole("alert")).toHaveText("请输入服务名称");
  await expect(wizard.getByRole("textbox", { name: "服务名称" })).toBeFocused();
  await wizard.getByRole("textbox", { name: "服务名称" }).fill("wizard-service");
  await wizard.getByRole("button", { name: "下一步" }).click();
  await wizard.getByRole("textbox", { name: "联系邮箱" }).fill("invalid-email");
  await wizard.getByRole("button", { name: "下一步" }).click();
  await expect(wizard.getByRole("alert")).toHaveText("请输入有效的邮箱地址");
  await wizard.getByRole("textbox", { name: "联系邮箱" }).fill("owner@qizhi.cn");
  await wizard.getByRole("button", { name: "上一步" }).click();
  await expect(wizard.getByRole("textbox", { name: "服务名称" })).toHaveValue("wizard-service");
  await wizard.getByRole("button", { name: "下一步" }).click();
  await wizard.getByRole("button", { name: "下一步" }).click();
  const confirmName = wizard.getByRole("textbox", { name: "服务名称" });
  const confirmEmail = wizard.getByRole("textbox", { name: "联系邮箱" });
  await expect(confirmName).toBeVisible();
  await expect(confirmName).toBeEditable();
  await expect(confirmName).toHaveValue("wizard-service");
  await expect(confirmEmail).toBeVisible();
  await expect(confirmEmail).toBeEditable();
  await expect(confirmEmail).toHaveValue("owner@qizhi.cn");
  await confirmName.fill("wizard-service-updated");
  await wizard.getByRole("button", { name: "提交" }).click();
  await expect(page.getByRole("status").filter({ hasText: "提交成功" }).first()).toBeVisible();
  await expect(wizard.locator(".form-steps-demo__result")).toHaveCount(0);
  await complex.getByRole("textbox", { name: "成员 1 名称" }).fill("成员甲更新");
  await expect(complex.getByRole("alert")).toHaveCount(0);

  await complex.getByRole("textbox", { name: "登录密码" }).fill("new-password");
  await expect(complex.getByText("两次输入的密码不一致")).toBeVisible();
  await complex.getByRole("textbox", { name: "确认密码" }).fill("new-password");
  await expect(complex.getByText("两次输入的密码不一致")).toHaveCount(0);

  await expect(complex.getByRole("textbox", { name: "服务地址" })).toBeVisible();
  await complex.getByRole("textbox", { name: "服务地址" }).fill("https://api.q");
  await complex.getByRole("button", { name: "提交复杂表单" }).click();
  await expect(complex.getByRole("alert")).toHaveText("请输入完整的 HTTP(S) 服务地址");
  await expect(complex.getByRole("status", { name: "复杂表单提交结果" })).toHaveCount(0);
  await complex.getByRole("textbox", { name: "服务地址" }).fill("https://api.qizhi.cn");
  await expect(complex.getByText("请输入完整的 HTTP(S) 服务地址")).toHaveCount(0);
  await complex.getByRole("combobox", { name: "服务类型" }).click();
  await page.getByRole("option", { name: "本地服务" }).click();
  await expect(complex.getByRole("textbox", { name: "服务地址" })).toHaveCount(0);
  await complex.getByRole("button", { name: "提交复杂表单" }).click();
  await expect(page.locator(".form-complex-submit-toast")).toBeVisible();
  await expect(page.locator(".form-complex-submit-toast")).toHaveText("提交成功");
  await expect(complex.getByRole("status", { name: "复杂表单提交结果" })).toHaveCount(0);
  await expect(complex.getByText(/"password"|"members"|"serviceType"/)).toHaveCount(0);

  await complex.getByRole("button", { name: "新增成员" }).focus();
  await page.keyboard.press("Tab");
  const serverErrorButton = complex.getByRole("button", { name: "模拟成员错误" });
  await expect(serverErrorButton).toBeFocused();
  expect(await serverErrorButton.evaluate((node) => node.matches(":focus-visible"))).toBe(true);
  await page.keyboard.press("Enter");
  await expect(complex.getByRole("alert")).toContainText("成员名称已存在");
  if ((page.viewportSize()?.width ?? 0) > 720) {
    const firstMemberInput = await complex.getByRole("textbox", { name: "成员 1 名称" })
      .locator("xpath=ancestor::*[contains(concat(' ', normalize-space(@class), ' '), ' qizhi-input ')][1]")
      .boundingBox();
    const firstMemberDelete = await complex.getByRole("button", { name: "删除成员 1" }).boundingBox();
    expect(firstMemberInput).not.toBeNull();
    expect(firstMemberDelete).not.toBeNull();
    expect(firstMemberDelete!.x).toBeGreaterThanOrEqual(firstMemberInput!.x + firstMemberInput!.width);
    const inputCenterY = firstMemberInput!.y + firstMemberInput!.height / 2;
    const deleteCenterY = firstMemberDelete!.y + firstMemberDelete!.height / 2;
    expect(Math.abs(inputCenterY - deleteCenterY)).toBeLessThanOrEqual(2);
  }

  const validation = page.locator("#表单-业务校验闭环");
  const validationSubmit = await validation.getByRole("button", { name: "提交" }).boundingBox();
  const validationForm = await validation.getByRole("form", { name: "业务校验闭环表单" }).boundingBox();
  expect(validationSubmit).not.toBeNull();
  expect(validationForm).not.toBeNull();
  expect(validationSubmit!.width).toBeLessThan(validationForm!.width);

  const remote = page.locator("#表单-远程联动与未保存修改");
  const remoteName = remote.getByRole("textbox", { name: "远程服务名称" });
  const dirtyStatus = remote.getByRole("status", { name: "未保存修改状态" });
  await expect(dirtyStatus).toHaveText("所有修改已保存");
  await remoteName.fill("Invalid Name");
  await remote.getByRole("button", { name: "提交远程表单" }).click();
  await expect(remote.getByText("须以小写字母开头，仅支持小写字母、数字和短横线")).toBeVisible();
  await remoteName.fill("changed-service");
  await expect(dirtyStatus).toHaveText("有未保存修改");
  await remote.getByRole("button", { name: "保存当前修改" }).click();
  await expect(dirtyStatus).toHaveText("所有修改已保存");

  const draft = page.locator("#表单-表单草稿");
  const draftName = draft.getByRole("textbox", { name: "草稿服务名称" });
  const draftDescription = draft.getByRole("textbox", { name: "草稿描述" });
  const draftPassword = draft.getByLabel("草稿访问密码");
  const draftStatus = draft.getByRole("status", { name: "草稿状态" });
  await expect(draftStatus).toHaveText("尚未保存草稿");
  await expect(draft.getByText(/idle：/)).toHaveCount(0);
  await expect(draft.getByText("调试详情")).toHaveCount(0);
  await expect(draft.getByText(/serviceName|description|password/)).toHaveCount(0);
  const [draftNameBox, draftDescriptionBox] = await Promise.all([draftName.boundingBox(), draftDescription.boundingBox()]);
  expect(draftNameBox).not.toBeNull();
  expect(draftDescriptionBox).not.toBeNull();
  expect(Math.abs(draftNameBox!.width - draftDescriptionBox!.width)).toBeLessThanOrEqual(1);

  await draftName.fill("");
  await draft.getByRole("button", { name: "保存草稿" }).click();
  const draftNameError = draft.getByRole("group", { name: "草稿服务名称" }).getByRole("alert");
  await expect(draftNameError).toHaveText("请输入草稿服务名称");
  const [draftNameErrorBox, emptyDraftNameBox] = await Promise.all([
    draftNameError.boundingBox(),
    draftName.boundingBox(),
  ]);
  expect(draftNameErrorBox).not.toBeNull();
  expect(emptyDraftNameBox).not.toBeNull();
  expect(draftNameErrorBox!.y).toBeGreaterThanOrEqual(emptyDraftNameBox!.y + emptyDraftNameBox!.height);

  await draftName.fill("saved-service");
  await draftDescription.fill("saved-description");
  await draftPassword.fill("saved-password");
  await draft.getByRole("button", { name: "保存草稿" }).click();
  await expect(draftStatus).toHaveText("草稿已保存");

  await draftName.fill("changed-service");
  await draftDescription.fill("changed-description");
  await draftPassword.fill("changed-password");
  await draft.getByRole("button", { name: "检测草稿" }).click();
  await expect(draftStatus).toHaveText("发现可恢复草稿");
  await draft.getByRole("button", { name: "恢复草稿" }).click();
  await expect(draftName).toHaveValue("saved-service");
  await expect(draftDescription).toHaveValue("saved-description");
  await expect(draftPassword).toHaveValue("changed-password");

  await draft.getByRole("button", { name: "模拟版本不匹配" }).click();
  await expect(draftStatus).toHaveText("草稿版本不兼容，无法恢复");
  await expect(draftName).toHaveValue("saved-service");
  await draft.getByRole("button", { name: "模拟过期草稿" }).click();
  await expect(draftStatus).toHaveText("草稿已过期，无法恢复");
  await expect(draftName).toHaveValue("saved-service");

  await draft.getByRole("button", { name: "模拟远端冲突" }).click();
  await expect(draftStatus).toHaveText("草稿已在其他位置更新，请选择处理方式");
  await expect(draftName).toHaveValue("saved-service");
  await draft.getByRole("button", { name: "选择远端版本" }).click();
  await expect(draftName).toHaveValue("remote-service");
  await expect(draftDescription).toHaveValue("远端草稿内容");

  await draftName.fill("local-overwrite");
  await draft.getByRole("button", { name: "模拟远端冲突" }).click();
  await expect(draftStatus).toHaveText("草稿已在其他位置更新，请选择处理方式");
  await draft.getByRole("button", { name: "覆盖远端草稿" }).click();
  await expect(draftStatus).toHaveText("草稿已保存");

  const bulk = page.locator("#表单-批量编辑");
  const bulkDepartment = bulk.getByRole("combobox", { name: "统一部门" });
  const bulkRemark = bulk.getByRole("textbox", { name: "统一备注" });
  await expect(bulkDepartment).toHaveAttribute("placeholder", "多个不同值");
  await expect(bulkRemark).toHaveAttribute("placeholder", "多个不同值");
  await expect(bulk.locator(".form-docs-bulk-edit-mixed")).toHaveCount(0);
  await expect(bulk.getByRole("region", { name: "批量编辑提交信息" })).toHaveCount(0);
  const bulkFields = bulk.locator(".form-docs-bulk-edit-fields > .qizhi-form-item");
  for (let index = 1; index < await bulkFields.count(); index += 1) {
    const [previousBox, currentBox] = await Promise.all([
      bulkFields.nth(index - 1).boundingBox(),
      bulkFields.nth(index).boundingBox(),
    ]);
    expect(previousBox).not.toBeNull();
    expect(currentBox).not.toBeNull();
    expect(currentBox!.y - (previousBox!.y + previousBox!.height)).toBe(24);
  }
  await bulkDepartment.click();
  await page.getByRole("option", { name: "产品部" }).click();
  await bulk.getByRole("button", { name: "清空备注" }).click();
  await bulk.getByRole("button", { name: "校验并生成补丁" }).click();
  const bulkResults = bulk.getByRole("region", { name: "批量编辑提交信息" });
  await expect(bulkResults).toBeVisible();
  await expect(bulkResults).toContainText("本次目标：member-1、member-2、member-3");
  await expect(bulk.getByRole("status", { name: "批量编辑补丁" })).toHaveCount(0);
  await expect(bulkResults).not.toContainText('"department": "product"');
  await bulk.getByRole("button", { name: "模拟部分成功" }).click();
  await expect(bulk.getByRole("alert").filter({ hasText: "没有修改部门的权限" })).toBeVisible();
  const bulkFailureItems = bulk.getByRole("list", { name: "批量编辑失败明细" }).getByRole("listitem");
  await expect(bulkFailureItems).toHaveCount(2);
  await bulkFailureItems.first().focus();
  await expect(bulkFailureItems.first()).toBeFocused();

  const bulkDemo = bulk.locator(".demo");
  const bulkRegions = bulk.locator(".form-docs-bulk-edit-fields, .form-docs-bulk-edit-actions, .form-docs-bulk-edit-results, [aria-label='批量编辑失败明细']");
  const bulkBounds = await bulkDemo.boundingBox();
  expect(bulkBounds).not.toBeNull();
  for (const region of await bulkRegions.all()) {
    const bounds = await region.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(bulkBounds!.x - 1);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(bulkBounds!.x + bulkBounds!.width + 1);
  }
  if ((page.viewportSize()?.width ?? 0) <= 720) {
    await expect(bulk.locator(".form-docs-bulk-edit-actions")).toHaveCSS("flex-direction", "column");
    const actionBoxes = await bulk.locator(".form-docs-bulk-edit-actions > button").evaluateAll((buttons) =>
      buttons.map((button) => ({ left: button.getBoundingClientRect().left, width: button.getBoundingClientRect().width })),
    );
    expect(new Set(actionBoxes.map((box) => Math.round(box.left))).size).toBe(1);
    expect(new Set(actionBoxes.map((box) => Math.round(box.width))).size).toBe(1);
  }

  await bulk.getByRole("button", { name: "模拟外部数据变化" }).click();
  await expect(bulk.getByRole("alert", { name: "批量编辑数据变化" })).toContainText("源数据已变化");
  await expect(bulkDepartment).toHaveValue("产品部");
  await expect(bulk.getByRole("button", { name: "仅重试失败成员" })).toBeDisabled();
  await bulk.getByRole("button", { name: "基于最新数据重新开始" }).click();
  await expect(bulk.getByRole("alert", { name: "批量编辑数据变化" })).toHaveCount(0);

  await bulkDepartment.click();
  await page.getByRole("option", { name: "产品部" }).click();
  await bulk.getByRole("button", { name: "清空备注" }).click();
  await bulk.getByRole("button", { name: "校验并生成补丁" }).click();
  await bulk.getByRole("button", { name: "模拟部分成功" }).click();
  await bulk.getByRole("button", { name: "仅重试失败成员" }).click();
  await expect(bulk.getByLabel("批量编辑目标")).toHaveText("本次目标：member-2、member-3");
  await expect(bulk.getByLabel("批量编辑结果")).toHaveText("重试成功 2 条，失败 0 条");

  const region = remote.getByRole("combobox", { name: "部署区域" });
  await region.fill("loading");
  await expect(remote.getByText("正在加载")).toBeVisible();
  await region.fill("empty");
  await expect(remote.getByText("暂无匹配区域")).toBeVisible();
  await region.fill("error");
  await expect(remote.getByRole("alert")).toContainText("区域查询失败");
  await remote.getByRole("button", { name: "重试" }).click();
  await expect(remote.getByRole("option", { name: "华北" })).toBeVisible();

  await remoteName.fill("slow-invalid");
  await remoteName.fill("valid-service");
  await page.waitForTimeout(150);
  await expect(remote.getByText("旧请求返回的名称错误")).toHaveCount(0);

  await remoteName.fill("network-service");
  await expect(remote.getByRole("alert")).toContainText("名称校验服务暂不可用");
  await expect(remoteName).not.toHaveAttribute("aria-invalid", "true");
  await remoteName.fill("valid-service");
  await expect(remote.getByRole("alert")).toHaveCount(0);

  await remote.getByRole("combobox", { name: "远程服务类型" }).click();
  await page.getByRole("option", { name: "本地服务" }).click();
  await expect(remote.getByRole("textbox", { name: "服务地址" })).toHaveCount(0);
  await expect(remote.getByRole("combobox", { name: "部署区域" })).toHaveCount(0);
  await remote.getByRole("button", { name: "提交远程表单" }).click();
  await expect(page.getByText("提交成功", { exact: true })).toBeVisible();
  await expect(remote.getByRole("status", { name: "远程表单提交结果" })).toHaveCount(0);

  await remote.getByRole("button", { name: "全部重置" }).click();
  await expect(remote.getByRole("textbox", { name: "服务地址" })).toHaveValue("https://api.qizhi.cn");
  await expect(remote.getByRole("combobox", { name: "部署区域" })).toHaveValue("华北");
  await expect(dirtyStatus).toHaveText("有未保存修改");
  await remote.getByRole("button", { name: "保存当前修改" }).click();
  await expect(dirtyStatus).toHaveText("所有修改已保存");

  if ((page.viewportSize()?.width ?? 0) > 720) {
    await basic.getByRole("button", { name: "查看代码" }).click();
    const source = page.locator("#form-code-表单-基础用法");
    await expect(source).toContainText('from "@wangxiaojinger/qizhi-react"');
    await expect(source).not.toContainText("Demo.tsx");
    await basic.getByRole("button", { name: "复制代码" }).click();
    await expect(basic.getByRole("status")).toContainText("复制成功");
  }

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  const demoWidths = await page.locator("#component-form .codebox-wrapper > .demo").evaluateAll(
    (nodes) => nodes.map((node) => ({
      id: node.parentElement?.id,
      clientWidth: node.clientWidth,
      scrollWidth: node.scrollWidth,
    })),
  );
  expect(demoWidths).toEqual(demoWidths.map((item) => ({ ...item, scrollWidth: item.clientWidth })));
  expect(errors).toEqual([]);
  await basic.locator(".demo").screenshot({ path: testInfo.outputPath(`form-basic-${testInfo.project.name}.png`) });
  await layout.locator(".demo").screenshot({ path: testInfo.outputPath(`form-layout-${testInfo.project.name}.png`) });
  await controlled.locator(".demo").screenshot({ path: testInfo.outputPath(`form-controlled-${testInfo.project.name}.png`) });
  await complex.locator(".demo").screenshot({ path: testInfo.outputPath(`form-complex-${testInfo.project.name}.png`) });
  await wizard.locator(".demo").screenshot({ path: testInfo.outputPath(`form-steps-${testInfo.project.name}.png`) });
  await remote.locator(".demo").screenshot({ path: testInfo.outputPath(`form-remote-${testInfo.project.name}.png`) });
  await draft.locator(".demo").screenshot({ path: testInfo.outputPath(`form-draft-${testInfo.project.name}.png`) });
  await bulk.locator(".demo").screenshot({ path: testInfo.outputPath(`form-bulk-edit-${testInfo.project.name}.png`) });
});
