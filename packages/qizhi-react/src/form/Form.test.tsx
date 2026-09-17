import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Form } from "./Form";

describe("Form", () => {
  it("renders a vertical native form by default and forwards its ref", () => {
    const ref = createRef<HTMLFormElement>();
    render(<Form ref={ref} aria-label="创建服务"><button type="submit">提交</button></Form>);

    const form = screen.getByRole("form", { name: "创建服务" });
    expect(form).toBe(ref.current);
    expect(form).toHaveClass("qizhi-form", "qizhi-form-layout-vertical");
    expect(form).not.toHaveClass("qizhi-form-layout-horizontal");
    expect(screen.getByRole("button", { name: "提交" })).toHaveAttribute("type", "submit");
  });

  it("renders the approved horizontal layout without adding state management", () => {
    render(<Form layout="horizontal" aria-label="水平表单"><input name="serviceName" /></Form>);

    expect(screen.getByRole("form", { name: "水平表单" })).toHaveClass("qizhi-form-layout-horizontal");
    expect(screen.getByRole("textbox")).toHaveAttribute("name", "serviceName");
  });
});

describe("Form.Item", () => {
  it("associates its label, required semantics and supporting text with the field group", () => {
    render(
      <Form.Item label="服务名称" required extra="支持小写字母、数字、短横线，须以字母开头。">
        <input aria-label="服务名称输入框" />
      </Form.Item>,
    );

    const group = screen.getByRole("group", { name: "服务名称" });
    expect(group).toHaveAttribute("aria-required", "true");
    expect(group.querySelector(".qizhi-form-item-required-mark")).toHaveTextContent("*");
    expect(screen.getByText("支持小写字母、数字、短横线，须以字母开头。")).toHaveClass("qizhi-form-item-extra");
    expect(screen.getByRole("textbox", { name: "服务名称输入框" })).toBeInTheDocument();
  });

  it("omits optional label and supporting nodes", () => {
    const { container } = render(<Form.Item><input aria-label="无标签字段" /></Form.Item>);

    expect(container.querySelector(".qizhi-form-item-label")).not.toBeInTheDocument();
    expect(container.querySelector(".qizhi-form-item-extra")).not.toBeInTheDocument();
    expect(screen.getByRole("group")).not.toHaveAttribute("aria-required");
  });
});

