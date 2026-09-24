import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormDocsIsland } from "./FormDocsIsland";
import { formApi, formInstanceApi, formItemApi, formListApi } from "./formApi";
import { formDemos } from "./formDocs.registry";

describe("Form docs", () => {
  it("preserves the four existing Demos and appends the complex fields Demo", () => {
    expect(formDemos.map((demo) => demo.title)).toEqual(["基础用法", "表单布局", "受控表单", "业务校验闭环", "复杂表单联动"]);
    expect(formDemos.map((demo) => demo.description)).toEqual([
      "非受控模式的基础用法，表单项采用垂直布局。",
      "Form 支持垂直和水平两种排列方式。",
      "表单统一收集和更新各表单项的值。",
      "演示前端校验、提交、后端字段错误回填以及修改后清除错误的完整链路。",
      "演示嵌套字段、依赖校验、条件字段保留策略和动态成员列表。",
    ]);
    formDemos.forEach((demo) => {
      expect(demo.source).toContain('from "@wangxiaojinger/qizhi-react"');
      expect(demo.source).not.toContain("Demo.tsx");
    });
  });

  it("renders the legacy field data and initial states through formal components", () => {
    render(<FormDocsIsland />);

    expect(screen.getAllByRole("button", { name: "查看代码" })).toHaveLength(5);
    expect(screen.getAllByRole("button", { name: "复制代码" })).toHaveLength(5);
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

  it("keeps API metadata aligned with the Form v3 complex-fields contract", () => {
    expect(formApi.map((item) => item.name)).toEqual(["layout", "form", "initialValues", "onValuesChange", "onFinish", "onFinishFailed", "scrollToFirstError", "preserve", "children", "className", "style"]);
    expect(formItemApi.map((item) => item.name)).toEqual(["name", "label", "required", "extra", "rules", "validateTrigger", "validateStatus", "help", "dependencies", "preserve", "children", "className", "style"]);
    expect(formListApi.map((item) => item.name)).toEqual(["name", "initialValue", "children"]);
    expect(formInstanceApi.map((item) => item.name)).toEqual(["getFieldsValue", "getFieldValue", "setFieldsValue", "setFieldValue", "getFieldError", "setFieldErrors", "validateFields", "resetFields", "scrollToField", "submit"]);
    expect(formApi.find((item) => item.name === "layout")?.defaultValue).toBe("vertical");
    expect(formItemApi.find((item) => item.name === "required")?.defaultValue).toBe("false");
  });

  it("renders the Form v3 API tables", () => {
    render(<FormDocsIsland />);
    expect(screen.getByRole("table", { name: "Form API" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Form.Item API" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Form.List API" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "FormInstance API" })).toBeInTheDocument();
  });
});
