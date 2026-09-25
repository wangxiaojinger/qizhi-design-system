import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Form } from "./Form";

const steps = [
  { key: "base", fields: ["name"] },
  { key: "contact", fields: ["email"] },
] as const;

describe("Form.useSteps", () => {
  it("并发步骤提交中被后续校验取消的请求不能误提交", async () => {
    const onFinish = vi.fn();
    const rejecters: Array<(error: Error) => void> = [];
    let wizard: ReturnType<typeof Form.useSteps> | undefined;

    function Example() {
      const [form] = Form.useForm();
      wizard = Form.useSteps({ form, steps });
      return <Form form={form} initialValues={{ name: "invalid" }} onFinish={onFinish}>
        <Form.Item name="name" rules={[{ validator: () => new Promise((_, reject) => rejecters.push(reject)) }]}>
          <input aria-label="名称" />
        </Form.Item>
      </Form>;
    }

    render(<Example />);
    let first: Promise<boolean>;
    let second: Promise<boolean>;
    await act(async () => {
      first = wizard!.submit();
      second = wizard!.submit();
      rejecters[0]?.(new Error("第一次失败"));
      rejecters[1]?.(new Error("第二次失败"));
      expect(await first).toBe(false);
      expect(await second).toBe(false);
    });
    expect(onFinish).not.toHaveBeenCalled();
  });

  it("受控模式以 current 为真实状态并只在导航成功后通知", async () => {
    const user = userEvent.setup();
    const onCurrentChange = vi.fn();

    function Example({ current }: { current: number }) {
      const [form] = Form.useForm();
      const wizard = Form.useSteps({ form, steps, current, onCurrentChange });
      return (
        <Form form={form} initialValues={{ name: "ready" }}>
          <output aria-label="当前步骤">{wizard.current}</output>
          <Form.Item name="name" rules={[{ required: true }]}><input aria-label="名称" /></Form.Item>
          <button type="button" onClick={() => void wizard.next()}>下一步</button>
        </Form>
      );
    }

    const view = render(<Example current={1} />);
    await user.click(screen.getByRole("button", { name: "下一步" }));
    expect(onCurrentChange).toHaveBeenCalledWith(2);
    expect(screen.getByRole("status", { name: "当前步骤" })).toHaveTextContent("1");

    view.rerender(<Example current={2} />);
    expect(screen.getByRole("status", { name: "当前步骤" })).toHaveTextContent("2");
  });

  it("受控模式校验失败时不通知步骤变化", async () => {
    const user = userEvent.setup();
    const onCurrentChange = vi.fn();

    function Example() {
      const [form] = Form.useForm();
      const wizard = Form.useSteps({ form, steps, current: 1, onCurrentChange });
      return (
        <Form form={form}>
          <Form.Item name="name" rules={[{ required: true }]}><input aria-label="名称" /></Form.Item>
          <button type="button" onClick={() => void wizard.next()}>下一步</button>
        </Form>
      );
    }

    render(<Example />);
    await user.click(screen.getByRole("button", { name: "下一步" }));
    expect(onCurrentChange).not.toHaveBeenCalled();
  });

  it("校验当前步骤并在失败时定位首个错误", async () => {
    const user = userEvent.setup();
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;

    function Example() {
      const [form] = Form.useForm();
      const wizard = Form.useSteps({ form, steps });
      return (
        <Form form={form}>
          <output aria-label="当前步骤">{wizard.current}</output>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: "请输入名称" }]}>
            <input />
          </Form.Item>
          <button type="button" onClick={() => void wizard.next()}>下一步</button>
        </Form>
      );
    }

    render(<Example />);
    await user.click(screen.getByRole("button", { name: "下一步" }));

    expect(screen.getByRole("status", { name: "当前步骤" })).toHaveTextContent("1");
    expect(screen.getByRole("alert")).toHaveTextContent("请输入名称");
    expect(screen.getByRole("textbox", { name: "名称" })).toHaveFocus();
    expect(scrollIntoView).toHaveBeenCalledOnce();
  });

  it("前后切换时保留跨步骤数据并限制边界", async () => {
    const user = userEvent.setup();

    function Example() {
      const [form] = Form.useForm();
      const wizard = Form.useSteps({ form, steps });
      return (
        <Form form={form}>
          <output aria-label="当前步骤">{wizard.current}</output>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><input /></Form.Item>
          <Form.Item name="email" label="邮箱"><input /></Form.Item>
          <button type="button" onClick={() => void wizard.next()}>下一步</button>
          <button type="button" onClick={wizard.previous}>上一步</button>
        </Form>
      );
    }

    render(<Example />);
    await user.type(screen.getByRole("textbox", { name: "名称" }), "QIZHI");
    await user.click(screen.getByRole("button", { name: "下一步" }));
    expect(screen.getByRole("status", { name: "当前步骤" })).toHaveTextContent("2");
    await user.click(screen.getByRole("button", { name: "下一步" }));
    expect(screen.getByRole("status", { name: "当前步骤" })).toHaveTextContent("2");
    await user.click(screen.getByRole("button", { name: "上一步" }));
    expect(screen.getByRole("textbox", { name: "名称" })).toHaveValue("QIZHI");
  });

  it("goTo 向前校验当前步骤且向后不校验", async () => {
    const user = userEvent.setup();

    function Example() {
      const [form] = Form.useForm();
      const wizard = Form.useSteps({ form, steps });
      return (
        <Form form={form}>
          <output aria-label="当前步骤">{wizard.current}</output>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: "请输入名称" }]}><input /></Form.Item>
          <button type="button" onClick={() => void wizard.goTo(2)}>前往第二步</button>
          <button type="button" onClick={() => void wizard.goTo(1)}>返回第一步</button>
        </Form>
      );
    }

    render(<Example />);
    await user.click(screen.getByRole("button", { name: "前往第二步" }));
    expect(screen.getByRole("status", { name: "当前步骤" })).toHaveTextContent("1");
    await user.type(screen.getByRole("textbox", { name: "名称" }), "QIZHI");
    await user.click(screen.getByRole("button", { name: "前往第二步" }));
    expect(screen.getByRole("status", { name: "当前步骤" })).toHaveTextContent("2");
    await user.clear(screen.getByRole("textbox", { name: "名称" }));
    await user.click(screen.getByRole("button", { name: "返回第一步" }));
    expect(screen.getByRole("status", { name: "当前步骤" })).toHaveTextContent("1");
  });

  it("步骤卸载并重新挂载后保留默认 preserve 数据", async () => {
    const user = userEvent.setup();

    function Example() {
      const [form] = Form.useForm();
      const wizard = Form.useSteps({ form, steps });
      return (
        <Form form={form}>
          {wizard.current === 1 ? <Form.Item name="name" label="名称"><input /></Form.Item> : null}
          {wizard.current === 2 ? <Form.Item name="email" label="邮箱"><input /></Form.Item> : null}
          <button type="button" onClick={() => void wizard.next()}>下一步</button>
          <button type="button" onClick={wizard.previous}>上一步</button>
        </Form>
      );
    }

    render(<Example />);
    await user.type(screen.getByRole("textbox", { name: "名称" }), "QIZHI");
    await user.click(screen.getByRole("button", { name: "下一步" }));
    expect(screen.queryByRole("textbox", { name: "名称" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "上一步" }));
    expect(screen.getByRole("textbox", { name: "名称" })).toHaveValue("QIZHI");
  });

  it("全量提交失败时回到首错步骤并聚焦字段", async () => {
    const user = userEvent.setup();

    function Example() {
      const [form] = Form.useForm();
      const wizard = Form.useSteps({ form, steps, initialStep: 2 });
      return (
        <Form form={form}>
          <output aria-label="当前步骤">{wizard.current}</output>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: "请输入名称" }]}><input /></Form.Item>
          <Form.Item name="email" label="邮箱"><input /></Form.Item>
          <button type="button" onClick={() => void wizard.submit()}>提交向导</button>
        </Form>
      );
    }

    render(<Example />);
    await user.click(screen.getByRole("button", { name: "提交向导" }));
    expect(screen.getByRole("status", { name: "当前步骤" })).toHaveTextContent("1");
    expect(screen.getByRole("textbox", { name: "名称" })).toHaveFocus();
  });

  it("字段卸载时仍参与全量提交校验并在回跳后聚焦", async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();

    function Example() {
      const [form] = Form.useForm();
      const wizard = Form.useSteps({ form, steps });
      return (
        <Form form={form} initialValues={{ name: "QIZHI" }} onFinish={onFinish}>
          <output aria-label="当前步骤">{wizard.current}</output>
          {wizard.current === 1 ? (
            <Form.Item name="name" label="名称" rules={[{ required: true, message: "请输入名称" }]}><input /></Form.Item>
          ) : (
            <Form.Item name="email" label="邮箱"><input /></Form.Item>
          )}
          <button type="button" onClick={() => void wizard.next()}>下一步</button>
          <button type="button" onClick={() => form.setFieldValue("name", "")}>使历史步骤失效</button>
          <button type="button" onClick={() => void wizard.submit()}>提交向导</button>
        </Form>
      );
    }

    render(<Example />);
    await user.click(screen.getByRole("button", { name: "下一步" }));
    await user.click(screen.getByRole("button", { name: "使历史步骤失效" }));
    await user.click(screen.getByRole("button", { name: "提交向导" }));

    expect(screen.getByRole("status", { name: "当前步骤" })).toHaveTextContent("1");
    expect(screen.getByRole("textbox", { name: "名称" })).toHaveFocus();
    expect(onFinish).not.toHaveBeenCalled();
  });

  it("空字段步骤向前切换时不校验其他步骤", async () => {
    const user = userEvent.setup();
    const emptyMiddleStep = [
      { key: "base", fields: ["name"] },
      { key: "review", fields: [] },
      { key: "done", fields: ["email"] },
    ] as const;

    function Example() {
      const [form] = Form.useForm();
      const wizard = Form.useSteps({ form, steps: emptyMiddleStep, initialStep: 2 });
      return (
        <Form form={form}>
          <output aria-label="当前步骤">{wizard.current}</output>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><input /></Form.Item>
          <button type="button" onClick={() => void wizard.next()}>下一步</button>
        </Form>
      );
    }

    render(<Example />);
    await user.click(screen.getByRole("button", { name: "下一步" }));
    expect(screen.getByRole("status", { name: "当前步骤" })).toHaveTextContent("3");
  });

  it("成功提交只执行一轮异步校验", async () => {
    const user = userEvent.setup();
    const validator = vi.fn(async () => undefined);
    const onFinish = vi.fn();

    function Example() {
      const [form] = Form.useForm();
      const wizard = Form.useSteps({ form, steps });
      return (
        <Form form={form} initialValues={{ name: "QIZHI" }} onFinish={onFinish}>
          <Form.Item name="name" rules={[{ validator }]}><input aria-label="名称" /></Form.Item>
          <button type="button" onClick={() => void wizard.submit()}>提交向导</button>
        </Form>
      );
    }

    render(<Example />);
    await user.click(screen.getByRole("button", { name: "提交向导" }));
    expect(onFinish).toHaveBeenCalledWith({ name: "QIZHI" });
    expect(validator).toHaveBeenCalledOnce();
  });
});
