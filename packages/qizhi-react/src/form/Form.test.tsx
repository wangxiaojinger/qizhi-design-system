import { createRef, useState } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Form } from "./Form";
import type { FormInstance } from "./Form.types";
import { Input } from "../input/Input";
import { Select } from "../select/Select";

describe("Form", () => {
  it("v4 脏状态接口初始为干净并可通过 Hook 读取", () => {
    let form: FormInstance | undefined;

    function DirtyState() {
      const [instance] = Form.useForm();
      form = instance;
      const dirty = Form.useDirty(instance);
      return <Form form={instance} initialValues={{ serviceName: "initial" }}><output aria-label="修改状态">{dirty ? "有修改" : "已保存"}</output></Form>;
    }

    render(<DirtyState />);
    expect(form?.isFieldsDirty()).toBe(false);
    expect(screen.getByRole("status", { name: "修改状态" })).toHaveTextContent("已保存");
  });
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

  it("收集命名字段并通知用户触发的值变化", async () => {
    const user = userEvent.setup();
    const changes: Array<[Record<string, unknown>, Record<string, unknown>]> = [];
    let form: FormInstance | undefined;

    function Example() {
      const [instance] = Form.useForm();
      form = instance;
      return (
        <Form
          form={instance}
          initialValues={{ serviceName: "initial" }}
          onValuesChange={(changedValues, allValues) => changes.push([changedValues, allValues])}
        >
          <Form.Item name="serviceName" label="服务名称">
            <input />
          </Form.Item>
        </Form>
      );
    }

    render(<Example />);

    const input = screen.getByRole("textbox", { name: "服务名称" });
    expect(input).toHaveValue("initial");

    await user.clear(input);
    await user.type(input, "service-a");

    expect(form?.getFieldValue("serviceName")).toBe("service-a");
    expect(form?.getFieldsValue()).toEqual({ serviceName: "service-a" });
    expect(changes.at(-1)).toEqual([
      { serviceName: "service-a" },
      { serviceName: "service-a" },
    ]);
  });

  it("聚合表单值时只包含已注册字段", async () => {
    const user = userEvent.setup();
    const changes: Array<Record<string, unknown>> = [];
    let form: FormInstance | undefined;

    function Example() {
      const [instance] = Form.useForm();
      form = instance;
      return (
        <Form
          form={instance}
          initialValues={{ serviceName: "initial", internalFlag: "private" }}
          onValuesChange={(_changedValues, allValues) => changes.push(allValues)}
        >
          <Form.Item name="serviceName" label="服务名称">
            <input />
          </Form.Item>
        </Form>
      );
    }

    render(<Example />);

    expect(form?.getFieldsValue()).toEqual({ serviceName: "initial" });
    await user.type(screen.getByRole("textbox", { name: "服务名称" }), "-new");
    expect(changes.at(-1)).toEqual({ serviceName: "initial-new" });
    await expect(form?.validateFields()).resolves.toEqual({ serviceName: "initial-new" });
  });

  it("使用数组路径收集嵌套值并提交真实对象结构", async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();

    render(
      <Form onFinish={onFinish}>
        <Form.Item name={["user", "email"]} label="邮箱">
          <input />
        </Form.Item>
        <button type="submit">提交嵌套表单</button>
      </Form>,
    );

    await user.type(screen.getByRole("textbox", { name: "邮箱" }), "a@qizhi.cn");
    await user.click(screen.getByRole("button", { name: "提交嵌套表单" }));

    expect(onFinish).toHaveBeenCalledWith({ user: { email: "a@qizhi.cn" } });
  });

  it("嵌套字段校验失败时返回数组路径和嵌套值", async () => {
    const user = userEvent.setup();
    const onFinishFailed = vi.fn();

    render(
      <Form onFinishFailed={onFinishFailed}>
        <Form.Item name={["user", "email"]} label="邮箱" rules={[{ required: true, message: "请输入邮箱" }]}>
          <input />
        </Form.Item>
        <button type="submit">校验嵌套表单</button>
      </Form>,
    );

    await user.click(screen.getByRole("button", { name: "校验嵌套表单" }));

    expect(onFinishFailed).toHaveBeenCalledWith({
      values: { user: { email: "" } },
      errorFields: [{ name: ["user", "email"], errors: ["请输入邮箱"] }],
    });
  });

  it("阻止无效提交并在修正后提交收集的值", async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    const onFinishFailed = vi.fn();

    render(
      <Form onFinish={onFinish} onFinishFailed={onFinishFailed}>
        <Form.Item
          name="serviceName"
          label="服务名称"
          rules={[
            { required: true, message: "请输入服务名称" },
            { pattern: /^[a-z][a-z0-9-]*$/, message: "服务名称格式不正确" },
          ]}
        >
          <Input />
        </Form.Item>
        <button type="submit">提交</button>
      </Form>,
    );

    const input = screen.getByRole("textbox", { name: "服务名称" });
    await user.click(screen.getByRole("button", { name: "提交" }));

    expect(onFinish).not.toHaveBeenCalled();
    expect(onFinishFailed).toHaveBeenCalledWith({
      values: { serviceName: "" },
      errorFields: [{ name: "serviceName", errors: ["请输入服务名称"] }],
    });
    const error = screen.getByRole("alert");
    expect(error).toHaveTextContent("请输入服务名称");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", error.id);

    await user.type(input, "service-a");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "提交" }));

    expect(onFinish).toHaveBeenCalledWith({ serviceName: "service-a" });
  });

  it("回填后端字段错误并在用户修改该字段后清除", async () => {
    const user = userEvent.setup();
    let form: FormInstance | undefined;

    function Example() {
      const [instance] = Form.useForm();
      form = instance;
      return (
        <Form form={instance} initialValues={{ serviceName: "service-a" }}>
          <Form.Item name="serviceName" label="服务名称">
            <input />
          </Form.Item>
        </Form>
      );
    }

    render(<Example />);
    act(() => form?.setFieldErrors("serviceName", ["服务名称已存在"]));

    expect(form?.getFieldError("serviceName")).toEqual(["服务名称已存在"]);
    expect(screen.getByRole("alert")).toHaveTextContent("服务名称已存在");

    await user.type(screen.getByRole("textbox", { name: "服务名称" }), "-new");

    expect(form?.getFieldError("serviceName")).toEqual([]);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("提交失败后滚动并聚焦第一个错误字段", async () => {
    const user = userEvent.setup();
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: scrollIntoView });

    render(
      <Form scrollToFirstError>
        <Form.Item name="serviceName" label="服务名称" rules={[{ required: true, message: "请输入服务名称" }]}>
          <input />
        </Form.Item>
        <button type="submit">提交</button>
      </Form>,
    );

    const input = screen.getByRole("textbox", { name: "服务名称" });
    await user.click(screen.getByRole("button", { name: "提交" }));

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "center" });
    expect(input).toHaveFocus();
  });

  it("程序化赋值不伪装用户变更，并可恢复初始值", () => {
    const onValuesChange = vi.fn();
    let form: FormInstance | undefined;

    function Example() {
      const [instance] = Form.useForm();
      form = instance;
      return (
        <Form form={instance} initialValues={{ serviceName: "initial", project: "public" }} onValuesChange={onValuesChange}>
          <Form.Item name="serviceName" label="服务名称"><input /></Form.Item>
          <Form.Item name="project" label="项目"><input /></Form.Item>
        </Form>
      );
    }

    render(<Example />);
    act(() => form?.setFieldsValue({ serviceName: "changed", project: "private" }));
    expect(screen.getByRole("textbox", { name: "服务名称" })).toHaveValue("changed");
    expect(screen.getByRole("textbox", { name: "项目" })).toHaveValue("private");
    expect(onValuesChange).not.toHaveBeenCalled();

    act(() => form?.resetFields(["serviceName"]));
    expect(screen.getByRole("textbox", { name: "服务名称" })).toHaveValue("initial");
    expect(screen.getByRole("textbox", { name: "项目" })).toHaveValue("private");
  });

  it("按字段与表单 preserve 策略处理条件字段且不伪造用户变更", async () => {
    const user = userEvent.setup();
    const onValuesChange = vi.fn();
    let form: FormInstance | undefined;

    function Example() {
      const [instance] = Form.useForm();
      const [visible, setVisible] = useState(true);
      form = instance;
      return (
        <Form form={instance} preserve={false} initialValues={{ kept: "A", removed: "B" }} onValuesChange={onValuesChange}>
          {visible ? <>
            <Form.Item name="kept" preserve><input aria-label="保留字段" /></Form.Item>
            <Form.Item name="removed"><input aria-label="清理字段" /></Form.Item>
          </> : null}
          <button type="button" onClick={() => setVisible(false)}>隐藏字段</button>
        </Form>
      );
    }

    render(<Example />);
    await user.click(screen.getByRole("button", { name: "隐藏字段" }));

    expect(form?.getFieldValue("kept")).toBe("A");
    expect(form?.getFieldValue("removed")).toBeUndefined();
    expect(onValuesChange).not.toHaveBeenCalled();
  });

  it("默认保留卸载字段，字段级 preserve=false 可显式清理", async () => {
    const user = userEvent.setup();
    let form: FormInstance | undefined;

    function Example() {
      const [instance] = Form.useForm();
      const [visible, setVisible] = useState(true);
      form = instance;
      return (
        <Form form={instance} initialValues={{ kept: "A", removed: "B" }}>
          {visible ? <>
            <Form.Item name="kept"><input aria-label="默认保留字段" /></Form.Item>
            <Form.Item name="removed" preserve={false}><input aria-label="显式清理字段" /></Form.Item>
          </> : null}
          <button type="button" onClick={() => setVisible(false)}>卸载字段</button>
        </Form>
      );
    }

    render(<Example />);
    await user.click(screen.getByRole("button", { name: "卸载字段" }));

    expect(form?.getFieldValue("kept")).toBe("A");
    expect(form?.getFieldValue("removed")).toBeUndefined();
  });

  it("useWatch 响应目标路径变化并忽略无关兄弟字段", () => {
    const parentRender = vi.fn();
    const emailRender = vi.fn();
    let form: FormInstance | undefined;

    function ParentWatcher() {
      const value = Form.useWatch(["user"]);
      parentRender();
      return <output aria-label="用户对象">{JSON.stringify(value)}</output>;
    }
    function EmailWatcher() {
      const value = Form.useWatch(["user", "email"]);
      emailRender();
      return <output aria-label="邮箱监听">{String(value)}</output>;
    }
    function Example() {
      const [instance] = Form.useForm();
      form = instance;
      return (
        <Form form={instance} initialValues={{ user: { email: "old@qizhi.cn", name: "Iris" } }}>
          <ParentWatcher />
          <EmailWatcher />
          <Form.Item name={["user", "email"]}><input aria-label="邮箱字段" /></Form.Item>
          <Form.Item name={["user", "name"]}><input aria-label="姓名字段" /></Form.Item>
        </Form>
      );
    }

    render(<Example />);
    expect(screen.getByLabelText("邮箱监听")).toHaveTextContent("old@qizhi.cn");
    const emailRenderCount = emailRender.mock.calls.length;

    act(() => form?.setFieldValue(["user", "name"], "MaoMao"));
    expect(parentRender.mock.calls.length).toBeGreaterThan(1);
    expect(emailRender).toHaveBeenCalledTimes(emailRenderCount);

    act(() => form?.setFieldValue(["user", "email"], "new@qizhi.cn"));
    expect(screen.getByLabelText("邮箱监听")).toHaveTextContent("new@qizhi.cn");
    act(() => form?.resetFields([["user", "email"]]));
    expect(screen.getByLabelText("邮箱监听")).toHaveTextContent("old@qizhi.cn");
  });

  it("useWatch 在 Form 上下文外且无显式实例时抛出清晰错误", () => {
    function InvalidWatcher() {
      Form.useWatch("field");
      return null;
    }

    expect(() => render(<InvalidWatcher />)).toThrow("Form.useWatch 必须在 Form 内使用或传入 form 实例。");
  });

  it("在异步校验期间暴露校验中状态并展示失败原因", async () => {
    const user = userEvent.setup();
    let rejectValidation: ((reason: Error) => void) | undefined;

    render(
      <Form>
        <Form.Item
          name="serviceName"
          label="服务名称"
          validateTrigger="onBlur"
          rules={[{
            validator: () => new Promise<void>((_resolve, reject) => { rejectValidation = reject; }),
          }]}
        >
          <Input />
        </Form.Item>
        <button type="button">其他操作</button>
      </Form>,
    );

    const input = screen.getByRole("textbox", { name: "服务名称" });
    await user.type(input, "service-a");
    await user.click(screen.getByRole("button", { name: "其他操作" }));

    expect(input.closest(".qizhi-form-item")).toHaveClass("qizhi-form-item--validating");
    expect(input.closest(".qizhi-input")).not.toHaveClass("qizhi-input--validating");

    await act(async () => rejectValidation?.(new Error("服务名称已存在")));
    expect(await screen.findByRole("alert")).toHaveTextContent("服务名称已存在");
  });

  it("选择器失去焦点时执行 onBlur 校验", async () => {
    const user = userEvent.setup();

    render(
      <Form>
        <Form.Item
          name="project"
          label="所属项目"
          validateTrigger="onBlur"
          rules={[{ required: true, message: "请选择所属项目" }]}
        >
          <Select options={[{ label: "公共项目", value: "public" }]} />
        </Form.Item>
        <button type="button">其他操作</button>
      </Form>,
    );

    await user.click(screen.getByRole("combobox", { name: "所属项目" }));
    await user.click(screen.getByRole("button", { name: "其他操作" }));

    const error = await screen.findByRole("alert");
    const select = screen.getByRole("combobox", { name: "所属项目" });
    expect(error).toHaveTextContent("请选择所属项目");
    expect(select).toHaveAttribute("aria-invalid", "true");
    expect(select).toHaveAttribute("aria-describedby", error.id);
  });

  it("提交处理未结束时忽略重复提交", async () => {
    const user = userEvent.setup();
    let finishSubmission: (() => void) | undefined;
    const onFinish = vi.fn(() => new Promise<void>((resolve) => { finishSubmission = resolve; }));

    render(
      <Form initialValues={{ serviceName: "service-a" }} onFinish={onFinish}>
        <Form.Item name="serviceName" label="服务名称"><input /></Form.Item>
        <button type="submit">提交</button>
      </Form>,
    );

    const submit = screen.getByRole("button", { name: "提交" });
    await user.click(submit);
    await user.click(submit);
    expect(onFinish).toHaveBeenCalledTimes(1);

    await act(async () => finishSubmission?.());
    await user.click(submit);
    expect(onFinish).toHaveBeenCalledTimes(2);
  });

  it("可通过表单控制对象触发与用户提交相同的流程", async () => {
    const onFinish = vi.fn();
    let form: FormInstance | undefined;

    function Example() {
      const [instance] = Form.useForm();
      form = instance;
      return (
        <Form form={instance} initialValues={{ serviceName: "service-a" }} onFinish={onFinish}>
          <Form.Item name="serviceName" label="服务名称"><input /></Form.Item>
        </Form>
      );
    }

    render(<Example />);
    act(() => form?.submit());

    await waitFor(() => expect(onFinish).toHaveBeenCalledWith({ serviceName: "service-a" }));
  });

  it("按长度与格式规则校验字符串字段", async () => {
    let form: FormInstance | undefined;

    function Example() {
      const [instance] = Form.useForm();
      form = instance;
      return (
        <Form form={instance} initialValues={{ exact: "a", short: "a", long: "abcd", pattern: "A" }}>
          <Form.Item name="exact" rules={[{ length: 2, message: "长度必须为 2" }]}><input aria-label="固定长度" /></Form.Item>
          <Form.Item name="short" rules={[{ min: 2, message: "长度不能小于 2" }]}><input aria-label="最小长度" /></Form.Item>
          <Form.Item name="long" rules={[{ max: 3, message: "长度不能大于 3" }]}><input aria-label="最大长度" /></Form.Item>
          <Form.Item name="pattern" rules={[{ pattern: /^[a-z]+$/, message: "只允许小写字母" }]}><input aria-label="格式" /></Form.Item>
        </Form>
      );
    }

    render(<Example />);

    await act(async () => {
      await expect(form?.validateFields()).rejects.toMatchObject({
        errorFields: [
          { name: "exact", errors: ["长度必须为 2"] },
          { name: "short", errors: ["长度不能小于 2"] },
          { name: "long", errors: ["长度不能大于 3"] },
          { name: "pattern", errors: ["只允许小写字母"] },
        ],
      });
    });
  });
});
