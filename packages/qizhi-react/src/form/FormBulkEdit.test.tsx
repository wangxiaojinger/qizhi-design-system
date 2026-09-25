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
});
