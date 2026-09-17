import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormDocsIsland } from "./FormDocsIsland";
import { formApi, formItemApi } from "./formApi";
import { formDemos } from "./formDocs.registry";

describe("Form docs", () => {
  it("preserves the three legacy Demo titles, descriptions, order and raw TSX source", () => {
    expect(formDemos.map((demo) => demo.title)).toEqual(["基础用法", "表单布局", "受控表单"]);
    expect(formDemos.map((demo) => demo.description)).toEqual([
      "非受控模式的基础用法，表单项采用垂直布局。",
      "Form 支持垂直和水平两种排列方式。",
      "表单统一收集和更新各表单项的值。",
    ]);
    formDemos.forEach((demo) => {
      expect(demo.source).toContain('from "@wangxiaojinger/qizhi-react"');
      expect(demo.source).not.toContain("Demo.tsx");
    });
  });

  it("renders the legacy field data and initial states through formal components", () => {
    render(<FormDocsIsland />);

    expect(screen.getAllByRole("button", { name: "查看代码" })).toHaveLength(3);
    expect(screen.getAllByRole("button", { name: "复制代码" })).toHaveLength(3);
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

  it("keeps API metadata aligned with the approved conservative contract", () => {
    expect(formApi.map((item) => item.name)).toEqual(["layout", "children", "className", "style"]);
    expect(formItemApi.map((item) => item.name)).toEqual(["label", "required", "extra", "children", "className", "style"]);
    expect(formApi.find((item) => item.name === "layout")?.defaultValue).toBe("vertical");
    expect(formItemApi.find((item) => item.name === "required")?.defaultValue).toBe("false");
  });
});
