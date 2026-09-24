import { expect, test } from "@playwright/test";

test("Form 保留旧站契约并覆盖复杂字段全链路与响应式几何", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#component-form");

  await expect(page.locator("#component-form article.codebox-wrapper")).toHaveCount(5);
  await expect(page.locator("#component-form .qz-demo-title").filter({ hasText: "基础用法" })).toHaveCount(1);
  await expect(page.locator("#component-form .qz-demo-title").filter({ hasText: "表单布局" })).toHaveCount(1);
  await expect(page.locator("#component-form .qz-demo-title").filter({ hasText: "受控表单" })).toHaveCount(1);
  await expect(page.getByRole("table", { name: "Form API" })).toBeVisible();
  await expect(page.getByRole("table", { name: "Form.Item API" })).toBeVisible();
  await expect(page.getByRole("table", { name: "Form.List API" })).toBeVisible();
  await expect(page.locator("#component-form .qizhi-form")).toHaveCount(5);

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
  await complex.getByRole("textbox", { name: "成员 3 名称" }).fill("成员丙");
  await complex.getByRole("button", { name: "成员 3 上移" }).click();
  await expect(complex.getByRole("textbox", { name: "成员 2 名称" })).toHaveValue("成员丙");
  await complex.getByRole("button", { name: "删除成员 3" }).click();
  await expect(complex.getByRole("textbox", { name: /成员 \d+ 名称/ })).toHaveCount(2);

  await complex.getByRole("button", { name: "模拟成员错误" }).click();
  await expect(complex.getByRole("alert")).toContainText("成员名称已存在");
  await complex.getByRole("textbox", { name: "成员 1 名称" }).fill("成员甲更新");
  await expect(complex.getByRole("alert")).toHaveCount(0);

  await complex.getByRole("textbox", { name: "登录密码" }).fill("new-password");
  await expect(complex.getByText("两次输入的密码不一致")).toBeVisible();
  await complex.getByRole("textbox", { name: "确认密码" }).fill("new-password");
  await expect(complex.getByText("两次输入的密码不一致")).toHaveCount(0);

  await expect(complex.getByRole("textbox", { name: "服务地址" })).toBeVisible();
  await complex.getByRole("combobox", { name: "服务类型" }).click();
  await page.getByRole("option", { name: "本地服务" }).click();
  await expect(complex.getByRole("textbox", { name: "服务地址" })).toHaveCount(0);
  await complex.getByRole("button", { name: "提交复杂表单" }).click();
  const submitted = complex.getByRole("status", { name: "复杂表单提交结果" });
  await expect(submitted).toContainText('"serviceType":"local"');
  await expect(submitted).not.toContainText("endpoint");

  await complex.getByRole("button", { name: "新增成员" }).focus();
  await expect(complex.getByRole("button", { name: "新增成员" })).toBeFocused();

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
});
