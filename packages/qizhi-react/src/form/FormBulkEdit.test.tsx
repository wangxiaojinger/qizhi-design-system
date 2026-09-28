import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Form } from "./Form";
import type { FormBulkEditController } from "./Form.types";
import { useBulkEdit } from "./formBulkEdit";

interface Member {
  id: string;
  department: string;
  status: string;
  profile: { remark: string };
}

const initialMembers: Member[] = [
  { id: "member-1", department: "design", status: "enabled", profile: { remark: "A" } },
  { id: "member-2", department: "engineering", status: "enabled", profile: { remark: "B" } },
];

function Harness({
  records,
  onValuesChange,
  expose,
}: {
  records: readonly Member[];
  onValuesChange?: () => void;
  expose: (bulk: FormBulkEditController<string>) => void;
}) {
  const [form] = Form.useForm();
  const bulk = useBulkEdit({
    form,
    records,
    getRowKey: (record) => record.id,
    fields: ["department", "status", ["profile", "remark"]],
  });
  expose(bulk);
  return <Form form={form} onValuesChange={onValuesChange}>
    <Form.Item name="department" label="部门"><input /></Form.Item>
    <Form.Item name="status" label="状态"><input /></Form.Item>
    <Form.Item name={["profile", "remark"]} label="备注"><input /></Form.Item>
    <output aria-label="批量状态">{bulk.status}:{String(bulk.hasChanges)}</output>
  </Form>;
}

function ValidationHarness({
  records,
  expose,
  statusValidator,
}: {
  records: readonly Member[];
  expose: (bulk: FormBulkEditController<string>) => void;
  statusValidator?: () => void | Promise<void>;
}) {
  const [form] = Form.useForm();
  const bulk = useBulkEdit({ form, records, getRowKey: (record) => record.id, fields: ["department", "status", ["profile", "remark"]] });
  expose(bulk);
  return <Form form={form}>
    <Form.Item name="department" label="部门" rules={[{ required: true, message: "请选择部门" }]}><input /></Form.Item>
    <Form.Item name="status" label="状态" rules={[{ validator: statusValidator }]}><input /></Form.Item>
    <Form.Item name={["profile", "remark"]} label="备注" rules={[{ required: true, message: "请输入备注" }]}><input /></Form.Item>
  </Form>;
}

describe("Form.useBulkEdit lifecycle", () => {
  it("initializes mixed and common fields without reporting a user change", async () => {
    const onValuesChange = vi.fn();
    let bulk!: FormBulkEditController<string>;
    render(<Harness records={initialMembers} onValuesChange={onValuesChange} expose={(value) => { bulk = value; }} />);

    await waitFor(() => expect(screen.getByRole("textbox", { name: "状态" })).toHaveValue("enabled"));
    expect(screen.getByRole("textbox", { name: "部门" })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "备注" })).toHaveValue("");
    expect(bulk.getFieldState("department")).toMatchObject({ mixed: true, mode: "keep" });
    expect(bulk.getFieldState("status")).toMatchObject({ mixed: false, mode: "keep", initialValue: "enabled" });
    expect(bulk.remainingKeys).toEqual(["member-1", "member-2"]);
    expect(bulk.hasChanges).toBe(false);
    expect(onValuesChange).not.toHaveBeenCalled();
  });

  it("moves fields between keep, set, and clear and restores nested values", async () => {
    let bulk!: FormBulkEditController<string>;
    render(<Harness records={initialMembers} expose={(value) => { bulk = value; }} />);
    const department = await screen.findByRole("textbox", { name: "部门" });
    const status = screen.getByRole("textbox", { name: "状态" });
    const remark = screen.getByRole("textbox", { name: "备注" });

    fireEvent.change(department, { target: { value: "product" } });
    expect(bulk.getFieldState("department").mode).toBe("set");
    fireEvent.change(status, { target: { value: "disabled" } });
    expect(bulk.getFieldState("status").mode).toBe("set");
    fireEvent.change(status, { target: { value: "enabled" } });
    expect(bulk.getFieldState("status").mode).toBe("keep");

    act(() => bulk.clearField(["profile", "remark"]));
    expect(remark).toHaveValue("");
    expect(bulk.getFieldState(["profile", "remark"]).mode).toBe("clear");
    act(() => bulk.keepField("department"));
    expect(department).toHaveValue("");
    expect(bulk.getFieldState("department").mode).toBe("keep");
    act(() => bulk.reset());
    expect(bulk.hasChanges).toBe(false);
    expect(status).toHaveValue("enabled");
  });

  it("preserves edits across semantically equal rerenders", async () => {
    let bulk!: FormBulkEditController<string>;
    const view = render(<Harness records={initialMembers} expose={(value) => { bulk = value; }} />);
    const department = await screen.findByRole("textbox", { name: "部门" });
    fireEvent.change(department, { target: { value: "product" } });

    view.rerender(<Harness records={initialMembers.map((member) => ({ ...member, profile: { ...member.profile } }))} expose={(value) => { bulk = value; }} />);
    expect(department).toHaveValue("product");
    expect(bulk.getFieldState("department").mode).toBe("set");
    expect(bulk.status).toBe("ready");
  });

  it("protects edits from changed source data and rebases explicitly", async () => {
    let bulk!: FormBulkEditController<string>;
    const view = render(<Harness records={initialMembers} expose={(value) => { bulk = value; }} />);
    const department = await screen.findByRole("textbox", { name: "部门" });
    fireEvent.change(department, { target: { value: "product" } });

    const changed = initialMembers.map((member) => member.id === "member-1" ? { ...member, department: "operations" } : member);
    view.rerender(<Harness records={changed} expose={(value) => { bulk = value; }} />);
    await waitFor(() => expect(bulk.status).toBe("sourceChanged"));
    expect(department).toHaveValue("product");

    act(() => bulk.reset());
    await waitFor(() => expect(department).toHaveValue(""));
    await waitFor(() => expect(bulk.status).toBe("ready"));
    fireEvent.change(department, { target: { value: "product" } });
    const changedAgain = changed.map((member) => member.id === "member-2" ? { ...member, department: "sales" } : member);
    view.rerender(<Harness records={changedAgain} expose={(value) => { bulk = value; }} />);
    await waitFor(() => expect(bulk.status).toBe("sourceChanged"));
    act(() => bulk.rebase());
    await waitFor(() => expect(bulk.status).toBe("ready"));
    expect(department).toHaveValue("");
    expect(bulk.hasChanges).toBe(false);
  });

  it("automatically accepts changed records when no edit is pending", async () => {
    let bulk!: FormBulkEditController<string>;
    const view = render(<Harness records={initialMembers} expose={(value) => { bulk = value; }} />);
    await screen.findByDisplayValue("enabled");
    const changed = initialMembers.map((member) => ({ ...member, status: "disabled" }));
    view.rerender(<Harness records={changed} expose={(value) => { bulk = value; }} />);
    await waitFor(() => expect(screen.getByRole("textbox", { name: "状态" })).toHaveValue("disabled"));
    expect(bulk.status).toBe("ready");
    expect(bulk.hasChanges).toBe(false);
  });

  it("validates only bulk edits and returns stable blocked states", async () => {
    const statusValidator = vi.fn();
    let bulk!: FormBulkEditController<string>;
    const view = render(<ValidationHarness records={initialMembers} statusValidator={statusValidator} expose={(value) => { bulk = value; }} />);
    await screen.findByDisplayValue("enabled");

    await expect(bulk.validate()).rejects.toMatchObject({ code: "no-changes" });
    fireEvent.change(screen.getByRole("textbox", { name: "状态" }), { target: { value: "disabled" } });
    statusValidator.mockClear();
    await act(async () => { await expect(bulk.validate()).resolves.toMatchObject({ values: { status: "disabled" } }); });
    expect(statusValidator).toHaveBeenCalledTimes(1);

    act(() => bulk.clearField(["profile", "remark"]));
    await act(async () => {
      await expect(bulk.validate()).rejects.toMatchObject({
        errorFields: [{ name: ["profile", "remark"], errors: ["请输入备注"] }],
      });
    });

    act(() => bulk.keepField(["profile", "remark"]));
    const changed = initialMembers.map((member) => member.id === "member-1" ? { ...member, department: "operations" } : member);
    view.rerender(<ValidationHarness records={changed} statusValidator={statusValidator} expose={(value) => { bulk = value; }} />);
    await waitFor(() => expect(bulk.status).toBe("sourceChanged"));
    await expect(bulk.validate()).rejects.toMatchObject({ code: "source-changed" });
  });

  it("rejects validation when there are no target records", async () => {
    let bulk!: FormBulkEditController<string>;
    render(<ValidationHarness records={[]} expose={(value) => { bulk = value; }} />);
    await waitFor(() => expect(bulk.remainingKeys).toEqual([]));
    await expect(bulk.validate()).rejects.toMatchObject({ code: "no-targets" });
  });

  it("keeps failed records and retries only their keys", async () => {
    const records = [...initialMembers, { id: "member-3", department: "design", status: "enabled", profile: { remark: "C" } }];
    let bulk!: FormBulkEditController<string>;
    render(<Harness records={records} expose={(value) => { bulk = value; }} />);
    fireEvent.change(await screen.findByRole("textbox", { name: "部门" }), { target: { value: "product" } });
    const firstPatch = await bulk.validate();
    expect(firstPatch.targetKeys).toEqual(["member-1", "member-2", "member-3"]);

    act(() => bulk.applyResult({
      succeededKeys: ["member-1"],
      failures: [
        { key: "member-2", field: "department", message: "无部门权限" },
        { key: "member-2", field: "status", message: "状态冲突" },
        { key: "member-3", message: "记录已锁定" },
      ],
    }));
    expect(bulk.succeededKeys).toEqual(["member-1"]);
    expect(bulk.remainingKeys).toEqual(["member-2", "member-3"]);
    expect(bulk.getFieldFailures("department")).toHaveLength(1);
    await expect(bulk.validate()).resolves.toMatchObject({ targetKeys: ["member-2", "member-3"] });

    act(() => bulk.applyResult({ succeededKeys: ["member-2", "member-3"], failures: [] }));
    expect(bulk.status).toBe("complete");
    expect(bulk.remainingKeys).toEqual([]);
    expect(bulk.failures).toEqual([]);
  });

  it("rejects malformed results atomically", async () => {
    let bulk!: FormBulkEditController<string>;
    render(<Harness records={initialMembers} expose={(value) => { bulk = value; }} />);
    fireEvent.change(await screen.findByRole("textbox", { name: "部门" }), { target: { value: "product" } });

    expect(() => bulk.applyResult({ succeededKeys: ["member-1", "member-1"], failures: [{ key: "member-2", message: "失败" }] }))
      .toThrow("成功 key 不能重复");
    expect(() => bulk.applyResult({ succeededKeys: ["member-1"], failures: [{ key: "member-1", message: "失败" }, { key: "member-2", message: "失败" }] }))
      .toThrow("同时成功和失败");
    expect(() => bulk.applyResult({ succeededKeys: ["member-1"], failures: [{ key: "unknown", message: "失败" }] }))
      .toThrow("未知 key");
    expect(() => bulk.applyResult({ succeededKeys: ["member-1"], failures: [] }))
      .toThrow("缺少 key");
    expect(() => bulk.applyResult({ succeededKeys: ["member-1"], failures: [{ key: "member-2", message: "" }] }))
      .toThrow("失败原因不能为空");
    expect(() => bulk.applyResult({ succeededKeys: ["member-1"], failures: [{ key: "member-2", field: "role", message: "失败" }] }))
      .toThrow("失败字段不在 fields 中");
    expect(bulk.remainingKeys).toEqual(["member-1", "member-2"]);
    expect(bulk.succeededKeys).toEqual([]);
    expect(bulk.failures).toEqual([]);
  });

  it("does not return a stale patch after source data changes during async validation", async () => {
    let resolveValidation!: () => void;
    const pending = new Promise<void>((resolve) => { resolveValidation = resolve; });
    let bulk!: FormBulkEditController<string>;
    const view = render(<ValidationHarness records={initialMembers} statusValidator={() => pending} expose={(value) => { bulk = value; }} />);
    fireEvent.change(await screen.findByRole("textbox", { name: "状态" }), { target: { value: "disabled" } });
    const validation = bulk.validate();
    const changed = initialMembers.map((member) => member.id === "member-1" ? { ...member, status: "archived" } : member);
    view.rerender(<ValidationHarness records={changed} statusValidator={() => pending} expose={(value) => { bulk = value; }} />);
    await waitFor(() => expect(bulk.status).toBe("sourceChanged"));
    resolveValidation();
    await expect(validation).rejects.toMatchObject({ name: "FormBulkEditValidationCancelled" });
  });

  it("rejects a completed request after the source changes", async () => {
    let bulk!: FormBulkEditController<string>;
    const view = render(<Harness records={initialMembers} expose={(value) => { bulk = value; }} />);
    fireEvent.change(await screen.findByRole("textbox", { name: "部门" }), { target: { value: "product" } });
    await act(async () => {
      await expect(bulk.validate()).resolves.toMatchObject({ targetKeys: ["member-1", "member-2"] });
    });

    const changed = initialMembers.map((member) => member.id === "member-1" ? { ...member, department: "operations" } : member);
    view.rerender(<Harness records={changed} expose={(value) => { bulk = value; }} />);
    await waitFor(() => expect(bulk.status).toBe("sourceChanged"));

    expect(() => bulk.applyResult({ succeededKeys: ["member-1", "member-2"], failures: [] }))
      .toThrow(expect.objectContaining({ code: "source-changed" }));
    expect(bulk.status).toBe("sourceChanged");
    expect(bulk.remainingKeys).toEqual(["member-1", "member-2"]);
  });
});
