import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Form } from "./Form";

describe("Form.List", () => {
  it("向渲染函数提供数量守卫、批量新增、列表错误和行错误", async () => {
    const user = userEvent.setup();
    render(
      <Form initialValues={{ members: [{ name: "A", start: 2, end: 1 }] }}>
        <Form.List
          name="members"
          min={1}
          max={2}
          rules={[{ validator: (rows) => rows.length === 1 ? { type: "field", message: "需要第二位成员" } : undefined }]}
          rowRules={[(row) => (row as { start: number; end: number }).start < (row as { start: number; end: number }).end ? undefined : { type: "field", message: "开始值必须小于结束值" }]}
        >
          {(fields, operations, meta) => <>
            <button type="button" disabled={!operations.canAdd(1)} onClick={() => operations.addMany([{ name: "B", start: 1, end: 2 }])}>批量新增</button>
            <button type="button" disabled={!operations.canRemove(0)} onClick={() => operations.remove(0)}>删除首行</button>
            {fields.map((field) => <Form.ErrorList key={field.key} errors={field.errors} />)}
            <Form.ErrorList errors={meta.errors} />
          </>}
        </Form.List>
      </Form>,
    );

    expect(screen.getByRole("button", { name: "删除首行" })).toBeDisabled();
    expect(await screen.findByText("需要第二位成员")).toBeInTheDocument();
    expect(screen.getByText("开始值必须小于结束值")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "批量新增" }));
    expect(screen.getByRole("button", { name: "批量新增" })).toBeDisabled();
    expect(screen.queryByText("需要第二位成员")).not.toBeInTheDocument();
  });

  it("程序化恢复会同步列表数量、值和嵌套列表", async () => {
    let form: ReturnType<typeof Form.useForm>[0] | undefined;

    function Example() {
      const [instance] = Form.useForm();
      form = instance;
      return (
        <Form form={instance} initialValues={{ team: { members: [{ name: "A", aliases: ["A1"] }, { name: "B", aliases: [] }] } }}>
          <Form.List name={["team", "members"]}>{(fields) => fields.map((field) => (
            <div key={field.key}>
              <Form.Item name={["team", "members", field.name, "name"]}>
                <input aria-label={`恢复成员 ${field.name + 1}`} />
              </Form.Item>
              <Form.List name={["team", "members", field.name, "aliases"]}>{(aliases) => aliases.map((alias) => (
                <Form.Item key={alias.key} name={["team", "members", field.name, "aliases", alias.name]}>
                  <input aria-label={`成员 ${field.name + 1} 别名 ${alias.name + 1}`} />
                </Form.Item>
              ))}</Form.List>
            </div>
          ))}</Form.List>
        </Form>
      );
    }

    render(<Example />);
    expect(await screen.findAllByRole("textbox", { name: /恢复成员/ })).toHaveLength(2);

    act(() => form?.setFieldsValue({ team: { members: [
      { name: "A", aliases: ["A1", "A2"] },
      { name: "B", aliases: [] },
      { name: "C", aliases: [] },
      { name: "D", aliases: [] },
      { name: "E", aliases: [] },
    ] } }));
    expect(screen.getAllByRole("textbox", { name: /恢复成员/ })).toHaveLength(5);
    expect(screen.getAllByRole("textbox", { name: /别名/ })).toHaveLength(2);

    act(() => form?.setFieldsValue({ team: { members: [{ name: "Z", aliases: [] }] } }));
    expect(screen.getAllByRole("textbox", { name: /恢复成员/ })).toHaveLength(1);
    expect(screen.getByRole("textbox", { name: "恢复成员 1" })).toHaveValue("Z");
    expect(screen.queryByRole("textbox", { name: /别名/ })).not.toBeInTheDocument();
  });

  it("缩短列表恢复时不会让旧字段清理掉新值或首项节点", async () => {
    let form: ReturnType<typeof Form.useForm>[0] | undefined;
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;

    function Example({ preserve }: { preserve: boolean }) {
      const [instance] = Form.useForm();
      form = instance;
      return <Form form={instance} initialValues={{ members: [{ name: "A" }, { name: "B" }] }}>
        <Form.List name="members">{(fields) => fields.map((field) => (
          <Form.Item key={field.key} name={["members", field.name, "name"]} preserve={preserve}>
            <input aria-label={`恢复成员 ${field.name + 1}`} data-list-key={field.key} />
          </Form.Item>
        ))}</Form.List>
      </Form>;
    }

    const view = render(<Example preserve={false} />);
    const firstKey = (await screen.findByRole("textbox", { name: "恢复成员 1" })).getAttribute("data-list-key");
    act(() => form?.setFieldsValue({ members: [{ name: "restored" }] }));
    expect(screen.getByRole("textbox", { name: "恢复成员 1" })).toHaveValue("restored");
    expect(screen.getByRole("textbox", { name: "恢复成员 1" })).toHaveAttribute("data-list-key", firstKey);

    view.rerender(<Example preserve />);
    act(() => {
      form?.setFieldsValue({ members: [{ name: "again" }] });
      form?.scrollToField(["members", 0]);
    });
    expect(screen.getByRole("textbox", { name: "恢复成员 1" })).toHaveValue("again");
    expect(scrollIntoView).toHaveBeenCalled();
  });

  it("渲染初始条目，新增后只通知一次并提交数组值", async () => {
    const user = userEvent.setup();
    const onValuesChange = vi.fn();
    const onFinish = vi.fn();

    render(
      <Form initialValues={{ members: [{ name: "A" }] }} onValuesChange={onValuesChange} onFinish={onFinish}>
        <Form.List name="members">
          {(fields, operations) => <>
            {fields.map((field) => (
              <Form.Item key={field.key} name={["members", field.name, "name"]}>
                <input aria-label={`成员 ${field.name + 1}`} data-list-key={field.key} />
              </Form.Item>
            ))}
            <button type="button" onClick={() => operations.add({ name: "B" })}>新增成员</button>
          </>}
        </Form.List>
        <button type="submit">提交成员</button>
      </Form>,
    );

    expect(await screen.findByRole("textbox", { name: "成员 1" })).toHaveValue("A");
    await user.click(screen.getByRole("button", { name: "新增成员" }));
    expect(await screen.findByRole("textbox", { name: "成员 2" })).toHaveValue("B");
    expect(onValuesChange).toHaveBeenCalledTimes(1);
    expect(onValuesChange).toHaveBeenLastCalledWith(
      { members: [{ name: "A" }, { name: "B" }] },
      { members: [{ name: "A" }, { name: "B" }] },
    );

    await user.click(screen.getByRole("button", { name: "提交成员" }));
    await waitFor(() => expect(onFinish).toHaveBeenCalledWith({ members: [{ name: "A" }, { name: "B" }] }));
  });

  it("删除和移动时让值、错误与稳定 key 一起迁移", async () => {
    let form: ReturnType<typeof Form.useForm>[0] | undefined;
    let operations: { remove(index: number | number[]): void; move(from: number, to: number): void } | undefined;

    function Example() {
      const [instance] = Form.useForm();
      form = instance;
      return (
        <Form form={instance} initialValues={{ members: [{ name: "A" }, { name: "B" }, { name: "C" }] }}>
          <Form.List name="members">{(fields, nextOperations) => {
            operations = nextOperations;
            return fields.map((field) => (
              <Form.Item key={field.key} name={["members", field.name, "name"]}>
                <input aria-label={`成员 ${field.name + 1}`} data-list-key={field.key} />
              </Form.Item>
            ));
          }}</Form.List>
        </Form>
      );
    }

    render(<Example />);
    const initialInputs = await screen.findAllByRole("textbox");
    const cKey = initialInputs[2]?.getAttribute("data-list-key");
    act(() => {
      form?.setFieldErrors(["members", 0, "name"], ["错误 A"]);
      form?.setFieldErrors(["members", 1, "name"], ["错误 B"]);
      form?.setFieldErrors(["members", 2, "name"], ["错误 C"]);
      operations?.remove([1, 1, -1, 99]);
    });

    expect(form?.getFieldValue("members")).toEqual([{ name: "A" }, { name: "C" }]);
    expect(form?.getFieldError(["members", 1, "name"])).toEqual(["错误 C"]);
    expect(screen.getByRole("textbox", { name: "成员 2" })).toHaveAttribute("data-list-key", cKey);

    act(() => operations?.move(1, 0));
    expect(form?.getFieldValue("members")).toEqual([{ name: "C" }, { name: "A" }]);
    expect(form?.getFieldError(["members", 0, "name"])).toEqual(["错误 C"]);
    expect(screen.getByRole("textbox", { name: "成员 1" })).toHaveAttribute("data-list-key", cKey);

    const beforeInvalidMoves = form?.getFieldValue("members");
    act(() => {
      operations?.move(-1, 0);
      operations?.move(0, 99);
      operations?.remove([-1, 99]);
    });
    expect(form?.getFieldValue("members")).toEqual(beforeInvalidMoves);
  });

  it("移动 preserve=false 字段后不会按旧索引误清理其他条目", async () => {
    let operations: { move(from: number, to: number): void } | undefined;
    let form: ReturnType<typeof Form.useForm>[0] | undefined;

    function Example() {
      const [instance] = Form.useForm();
      form = instance;
      return (
        <Form form={instance} initialValues={{ members: [{ name: "A" }, { name: "B" }] }}>
          <Form.List name="members">{(fields, nextOperations) => {
            operations = nextOperations;
            return fields.map((field) => (
              <Form.Item key={field.key} name={["members", field.name, "name"]} preserve={false}>
                <input aria-label={`移动成员 ${field.name + 1}`} />
              </Form.Item>
            ));
          }}</Form.List>
        </Form>
      );
    }

    render(<Example />);
    await screen.findAllByRole("textbox");
    act(() => operations?.move(1, 0));

    expect(form?.getFieldValue("members")).toEqual([{ name: "B" }, { name: "A" }]);
    expect(screen.getByRole("textbox", { name: "移动成员 1" })).toHaveValue("B");
    expect(screen.getByRole("textbox", { name: "移动成员 2" })).toHaveValue("A");
  });

  it("重置父路径时同步恢复列表条目和值", async () => {
    let form: ReturnType<typeof Form.useForm>[0] | undefined;
    let operations: { add(value?: unknown): void; remove(index: number | number[]): void } | undefined;

    function Example() {
      const [instance] = Form.useForm();
      form = instance;
      return (
        <Form form={instance} initialValues={{ team: { members: [{ name: "A" }, { name: "B" }] } }}>
          <Form.List name={["team", "members"]}>{(fields, nextOperations) => {
            operations = nextOperations;
            return fields.map((field) => (
              <Form.Item key={field.key} name={["team", "members", field.name, "name"]}>
                <input aria-label={`重置成员 ${field.name + 1}`} />
              </Form.Item>
            ));
          }}</Form.List>
        </Form>
      );
    }

    render(<Example />);
    expect(await screen.findAllByRole("textbox")).toHaveLength(2);
    act(() => {
      operations?.remove(0);
      operations?.add({ name: "C" });
      operations?.add({ name: "D" });
    });
    expect(screen.getAllByRole("textbox")).toHaveLength(3);

    act(() => form?.resetFields([["team"]]));
    expect(screen.getAllByRole("textbox")).toHaveLength(2);
    expect(screen.getByRole("textbox", { name: "重置成员 1" })).toHaveValue("A");
    expect(screen.getByRole("textbox", { name: "重置成员 2" })).toHaveValue("B");
    expect(form?.isFieldsDirty()).toBe(false);
  });
});
