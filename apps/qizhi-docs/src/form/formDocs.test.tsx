import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormDocsIsland } from "./FormDocsIsland";
import { formApi, formBulkEditApi, formDraftApi, formErrorListApi, formInstanceApi, formItemApi, formListApi, formStepsApi } from "./formApi";
import { formDemos } from "./formDocs.registry";

describe("Form docs", () => {
  it("preserves the existing Demos and appends the Draft Demo", () => {
    expect(formDemos.map((demo) => demo.title)).toEqual(["基础用法", "表单布局", "受控表单", "业务校验闭环", "复杂表单联动", "多步骤表单", "远程联动与未保存修改", "表单草稿", "高级动态列表", "批量编辑"]);
    expect(formDemos.map((demo) => demo.description)).toEqual([
      "非受控模式的基础用法，表单项采用垂直布局。",
      "Form 支持垂直和水平两种排列方式。",
      "表单统一收集和更新各表单项的值。",
      "演示前端校验、提交、后端字段错误回填以及修改后清除错误的完整链路。",
      "演示嵌套字段、依赖校验、条件字段保留策略和动态成员列表。",
      "按步骤校验字段并保留跨步骤数据，提交失败时返回首个错误所在步骤。",
      "演示异步校验竞态、网络异常分流、远程查询四态、条件字段清理和未保存修改判断。",
      "通过业务方提供的存储适配器保存和恢复指定字段，并处理版本、过期与并发冲突。",
      "演示数量限制、列表与整行校验、批量新增以及嵌套列表状态迁移。",
      "演示混合值、仅提交改动字段、主动清空、部分失败回填以及失败记录重试。",
    ]);
    formDemos.forEach((demo) => {
      expect(demo.source).toContain('from "@wangxiaojinger/qizhi-react"');
      expect(demo.source).not.toContain("Demo.tsx");
    });
    expect(formDemos.at(-1)?.source).toContain("Form.useBulkEdit");
  });

  it("renders the legacy field data and initial states through formal components", () => {
    render(<FormDocsIsland />);

    expect(screen.getAllByRole("button", { name: "查看代码" })).toHaveLength(10);
    expect(screen.getAllByRole("button", { name: "复制代码" })).toHaveLength(10);
    expect(screen.getAllByText("支持小写字母、数字、短横线，须以字母开头。")).toHaveLength(3);

    const basic = document.getElementById("表单-基础用法")!;
    expect(within(basic).getByRole("textbox", { name: "服务名称" })).toHaveValue("");
    expect(within(basic).getByText("0/32")).toBeInTheDocument();
    expect(within(basic).getByRole("combobox", { name: "所属项目" })).toHaveAttribute("placeholder", "请选择");

    fireEvent.click(within(basic).getByRole("combobox", { name: "所属项目" }));
    expect(screen.getByRole("option", { name: "公共项目" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "模型开发项目" })).toBeInTheDocument();

    const controlled = document.getElementById("表单-受控表单")!;
    expect(within(controlled).getByRole("radio", { name: "官方镜像" })).toBeChecked();
    expect(within(controlled).getByRole("button", { name: "选择模型" }))
      .toHaveClass("form-docs-model-button");
    expect(within(controlled).getByRole("button", { name: "刷新计算类型组" }))
      .toHaveClass("form-docs-refresh");
    expect(within(controlled).getByRole("textbox", { name: "运行命令" }).tagName)
      .toBe("INPUT");
    expect(within(controlled).getByRole("button", { name: "运行命令说明" }))
      .toHaveClass("form-docs-info-button");
    expect(within(controlled).getByRole("button", { name: "端口号说明" }))
      .toHaveClass("form-docs-info-button");
    expect(within(controlled).getByPlaceholderText("输入端口号")).toHaveValue("");
    expect(within(controlled).getByPlaceholderText("请输入描述文本")).toHaveValue("");
  });

  it("demonstrates list operations, dependent validation, conditional cleanup and nested server errors", async () => {
    render(<FormDocsIsland />);
    const demo = document.getElementById("表单-复杂表单联动")!;

    expect(within(demo).getAllByRole("textbox", { name: /成员 \d+ 名称/ })).toHaveLength(2);
    fireEvent.click(within(demo).getByRole("button", { name: "新增成员" }));
    expect(within(demo).getAllByRole("textbox", { name: /成员 \d+ 名称/ })).toHaveLength(3);

    fireEvent.change(within(demo).getByRole("textbox", { name: "成员 2 名称" }), { target: { value: "成员乙" } });
    fireEvent.click(within(demo).getByRole("button", { name: "成员 2 上移" }));
    expect(within(demo).getByRole("textbox", { name: "成员 1 名称" })).toHaveValue("成员乙");
    fireEvent.click(within(demo).getByRole("button", { name: "删除成员 3" }));
    expect(within(demo).getAllByRole("textbox", { name: /成员 \d+ 名称/ })).toHaveLength(2);

    fireEvent.click(within(demo).getByRole("button", { name: "模拟成员错误" }));
    expect(await within(demo).findByRole("alert")).toHaveTextContent("成员名称已存在");

    fireEvent.change(within(demo).getByRole("textbox", { name: "登录密码" }), { target: { value: "new-password" } });
    expect(await within(demo).findByText("两次输入的密码不一致")).toBeInTheDocument();

    expect(within(demo).getByRole("textbox", { name: "服务地址" })).toBeInTheDocument();
    fireEvent.click(within(demo).getByRole("combobox", { name: "服务类型" }));
    fireEvent.click(screen.getByRole("option", { name: "本地服务" }));
    expect(within(demo).queryByRole("textbox", { name: "服务地址" })).not.toBeInTheDocument();
  });

  it.each([
    ["表单-复杂表单联动", "提交复杂表单"],
    ["表单-远程联动与未保存修改", "提交远程表单"],
  ])("%s rejects incomplete service URLs before submission", async (demoId, submitName) => {
    render(<FormDocsIsland />);
    const demo = document.getElementById(demoId)!;
    const endpoint = within(demo).getByRole("textbox", { name: "服务地址" });

    fireEvent.change(endpoint, { target: { value: "https://api.q" } });
    fireEvent.click(within(demo).getByRole("button", { name: submitName }));
    expect(await within(demo).findByRole("alert")).toHaveTextContent("请输入完整的 HTTP(S) 服务地址");

    fireEvent.change(endpoint, { target: { value: "https://api.qizhi.cn" } });
    expect(within(demo).queryByText("请输入完整的 HTTP(S) 服务地址")).not.toBeInTheDocument();
  });

  it("blocks invalid step email, empty member names and invalid remote service names", async () => {
    render(<FormDocsIsland />);

    const wizard = document.getElementById("表单-多步骤表单")!;
    fireEvent.change(within(wizard).getByRole("textbox", { name: "服务名称" }), { target: { value: "valid-service" } });
    fireEvent.click(within(wizard).getByRole("button", { name: "下一步" }));
    fireEvent.change(await within(wizard).findByRole("textbox", { name: "联系邮箱" }), { target: { value: "invalid-email" } });
    fireEvent.click(within(wizard).getByRole("button", { name: "下一步" }));
    expect(await within(wizard).findByRole("alert")).toHaveTextContent("请输入有效的邮箱地址");

    const complex = document.getElementById("表单-复杂表单联动")!;
    fireEvent.click(within(complex).getByRole("button", { name: "新增成员" }));
    fireEvent.click(within(complex).getByRole("button", { name: "提交复杂表单" }));
    expect(await within(complex).findByText("请输入成员名称")).toBeInTheDocument();
    expect(within(complex).queryByRole("status", { name: "复杂表单提交结果" })).not.toBeInTheDocument();

    const remote = document.getElementById("表单-远程联动与未保存修改")!;
    const remoteName = within(remote).getByRole("textbox", { name: "远程服务名称" });
    fireEvent.change(remoteName, { target: { value: "Invalid Name" } });
    fireEvent.click(within(remote).getByRole("button", { name: "提交远程表单" }));
    expect(await within(remote).findByText("须以小写字母开头，仅支持小写字母、数字和短横线")).toBeInTheDocument();
    expect(within(remote).queryByRole("status", { name: "远程表单提交结果" })).not.toBeInTheDocument();
  });

  it("demonstrates frontend validation and server field-error recovery", async () => {
    render(<FormDocsIsland />);
    const demo = document.getElementById("表单-业务校验闭环")!;
    const input = within(demo).getByRole("textbox", { name: "服务名称" });

    fireEvent.click(within(demo).getByRole("button", { name: "提交" }));
    expect(await within(demo).findByRole("alert")).toHaveTextContent("请输入服务名称");

    fireEvent.change(input, { target: { value: "existing-service" } });
    fireEvent.click(within(demo).getByRole("button", { name: "提交" }));
    expect(await within(demo).findByRole("alert")).toHaveTextContent("服务名称已存在");

    fireEvent.change(input, { target: { value: "service-a" } });
    expect(within(demo).queryByRole("alert")).not.toBeInTheDocument();
  });

  it("demonstrates remote states, exception separation, conditional cleanup and dirty recovery", async () => {
    render(<FormDocsIsland />);
    const demo = document.getElementById("表单-远程联动与未保存修改")!;
    const serviceName = within(demo).getByRole("textbox", { name: "远程服务名称" });
    const region = within(demo).getByRole("combobox", { name: "部署区域" });

    expect(within(demo).getByRole("status", { name: "未保存修改状态" })).toHaveTextContent("所有修改已保存");
    fireEvent.change(serviceName, { target: { value: "changed-service" } });
    expect(within(demo).getByRole("status", { name: "未保存修改状态" })).toHaveTextContent("有未保存修改");
    fireEvent.click(within(demo).getByRole("button", { name: "保存当前修改" }));
    expect(within(demo).getByRole("status", { name: "未保存修改状态" })).toHaveTextContent("所有修改已保存");

    fireEvent.change(region, { target: { value: "loading" } });
    expect(within(demo).getByText("正在加载")).toBeInTheDocument();
    fireEvent.change(region, { target: { value: "empty" } });
    expect(within(demo).getByText("暂无匹配区域")).toBeInTheDocument();
    fireEvent.change(region, { target: { value: "error" } });
    expect(within(demo).getByRole("alert")).toHaveTextContent("区域查询失败");
    fireEvent.click(within(demo).getByRole("button", { name: "重试" }));
    expect(within(demo).getByRole("option", { name: "华北" })).toBeInTheDocument();

    fireEvent.change(serviceName, { target: { value: "slow-invalid" } });
    fireEvent.change(serviceName, { target: { value: "valid-service" } });
    await new Promise((resolve) => window.setTimeout(resolve, 150));
    expect(within(demo).queryByText("旧请求返回的名称错误")).not.toBeInTheDocument();

    fireEvent.change(serviceName, { target: { value: "network-service" } });
    await waitFor(() => expect(within(demo).getByRole("alert")).toHaveTextContent("名称校验服务暂不可用"));
    expect(serviceName).not.toHaveAttribute("aria-invalid", "true");

    fireEvent.click(within(demo).getByRole("combobox", { name: "远程服务类型" }));
    fireEvent.click(screen.getByRole("option", { name: "本地服务" }));
    expect(within(demo).queryByRole("textbox", { name: "服务地址" })).not.toBeInTheDocument();
    expect(within(demo).queryByRole("combobox", { name: "部署区域" })).not.toBeInTheDocument();
  });

  it("switches only the layout Demo and keeps controlled fields controlled by the Demo", () => {
    render(<FormDocsIsland />);
    const layout = document.getElementById("表单-表单布局")!;
    const form = within(layout).getByRole("form");
    expect(form).toHaveClass("qizhi-form-layout-vertical");
    fireEvent.click(within(layout).getByRole("radio", { name: "水平的" }));
    expect(form).toHaveClass("qizhi-form-layout-horizontal");

    const controlled = document.getElementById("表单-受控表单")!;
    const name = within(controlled).getByRole("textbox", { name: "服务名称" });
    fireEvent.change(name, { target: { value: "service-a" } });
    expect(name).toHaveValue("service-a");
    expect(within(controlled).getByText("9/32")).toBeInTheDocument();
    fireEvent.click(within(controlled).getByRole("radio", { name: "个人可见镜像" }));
    expect(within(controlled).getByRole("radio", { name: "个人可见镜像" })).toBeChecked();
  });

  it("keeps API metadata aligned with the Form v4 business-state contract", () => {
    expect(formApi.map((item) => item.name)).toEqual(["layout", "form", "initialValues", "onValuesChange", "onFinish", "onFinishFailed", "onValidationException", "scrollToFirstError", "preserve", "children", "className", "style"]);
    expect(formItemApi.map((item) => item.name)).toEqual(["name", "label", "required", "extra", "rules", "validateTrigger", "validateStatus", "help", "dependencies", "preserve", "children", "className", "style"]);
    expect(formListApi.map((item) => item.name)).toEqual(["name", "initialValue", "min", "max", "rules", "rowRules", "children"]);
    expect(formErrorListApi.map((item) => item.name)).toEqual(["errors", "className", "style"]);
    expect(formStepsApi.map((item) => item.name)).toEqual(["form", "steps", "initialStep", "current", "onCurrentChange"]);
    expect(formDraftApi.map((item) => item.name)).toEqual(["form", "draftKey", "version", "storage", "selectValues", "getMetadata", "onRestoreMetadata", "autoSave"]);
    expect(formBulkEditApi.map((item) => item.name)).toEqual(["form", "records", "getRowKey", "fields", "getFieldValue", "isEqual", "getFieldState", "getFieldFailures", "clearField", "keepField", "validate", "applyResult", "rebase", "reset", "status", "failures", "succeededKeys", "remainingKeys", "hasChanges"]);
    expect(formInstanceApi.map((item) => item.name)).toEqual(["getFieldsValue", "getFieldValue", "setFieldsValue", "setFieldValue", "getFieldError", "setFieldErrors", "validateFields", "resetFields", "isFieldsDirty", "markFieldsClean", "scrollToField", "submit"]);
    expect(formApi.find((item) => item.name === "layout")?.defaultValue).toBe("vertical");
    expect(formItemApi.find((item) => item.name === "required")?.defaultValue).toBe("false");
  });

  it("renders the Form v4 API tables", () => {
    render(<FormDocsIsland />);
    expect(screen.getByRole("table", { name: "Form API" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Form.Item API" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Form.List API" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Form.ErrorList API" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Form.useSteps API" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Form.useDraft API" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Form.useBulkEdit API" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "FormInstance API" })).toBeInTheDocument();
  });

  it("demonstrates mixed values, changed-only patches, partial recovery and rebase", async () => {
    render(<FormDocsIsland />);
    const demo = document.getElementById("表单-批量编辑")!;
    const department = within(demo).getByRole("combobox", { name: "统一部门" });
    const mixedDescription = within(demo).getByText("多个不同值");
    expect(department).toHaveAttribute("aria-describedby", mixedDescription.id);

    fireEvent.click(department);
    fireEvent.click(screen.getByRole("option", { name: "产品部" }));
    expect(department).not.toHaveAttribute("aria-describedby");
    fireEvent.click(within(demo).getByRole("button", { name: "清空备注" }));
    expect(within(demo).getByRole("textbox", { name: "统一备注" })).not.toHaveAttribute("aria-describedby");
    fireEvent.click(within(demo).getByRole("button", { name: "校验并生成补丁" }));
    const patch = await within(demo).findByRole("status", { name: "批量编辑补丁" });
    expect(patch).toHaveTextContent('"department": "product"');
    expect(patch).toHaveTextContent('"profile"');
    expect(patch).toHaveTextContent('"remark"');
    expect(patch).not.toHaveTextContent('"status"');

    fireEvent.click(within(demo).getByRole("button", { name: "模拟部分成功" }));
    expect(await within(demo).findByText("成功 1 条，失败 2 条")).toBeInTheDocument();
    expect(within(demo).getAllByText(/没有修改部门的权限/)).toHaveLength(2);
    const failureItems = within(demo).getAllByRole("listitem");
    expect(failureItems).toHaveLength(2);
    failureItems.forEach((item) => expect(item).toHaveAttribute("tabindex", "0"));
    failureItems[0]?.focus();
    expect(failureItems[0]).toHaveFocus();

    fireEvent.click(within(demo).getByRole("button", { name: "模拟外部数据变化" }));
    expect(await within(demo).findByRole("alert", { name: "批量编辑数据变化" })).toHaveTextContent("源数据已变化");
    expect(department).toHaveValue("产品部");
    fireEvent.click(within(demo).getByRole("button", { name: "基于最新数据重新开始" }));
    await waitFor(() => expect(within(demo).queryByRole("alert", { name: "批量编辑数据变化" })).not.toBeInTheDocument());

    fireEvent.click(department);
    fireEvent.click(screen.getByRole("option", { name: "产品部" }));
    fireEvent.click(within(demo).getByRole("button", { name: "清空备注" }));
    fireEvent.click(within(demo).getByRole("button", { name: "校验并生成补丁" }));
    fireEvent.click(await within(demo).findByRole("button", { name: "模拟部分成功" }));
    fireEvent.click(within(demo).getByRole("button", { name: "仅重试失败成员" }));
    expect(await within(demo).findByText("本次目标：member-2、member-3")).toBeInTheDocument();
    expect(await within(demo).findByText("重试成功 2 条，失败 0 条")).toBeInTheDocument();
  });
});
