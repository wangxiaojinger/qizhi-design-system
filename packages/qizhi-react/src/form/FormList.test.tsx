import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Form } from "./Form";

describe("Form.List", () => {
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
});
