import { describe, expect, it } from "vitest";
import {
  buildBulkEditPatch,
  createBulkEditSnapshot,
  validateBulkEditResult,
} from "./formBulkEditCore";

const members = [
  { id: "member-1", department: "design", status: "enabled", profile: { remark: "A" } },
  { id: "member-2", department: "engineering", status: "enabled", profile: { remark: "B" } },
];

describe("Form Bulk Edit core", () => {
  it("rejects empty, duplicate, and overlapping field declarations", () => {
    expect(() => createBulkEditSnapshot({ records: members, getRowKey: (row) => row.id, fields: [] }))
      .toThrow("Form.useBulkEdit fields 至少需要一个字段。");
    expect(() => createBulkEditSnapshot({ records: members, getRowKey: (row) => row.id, fields: ["department", ["department"]] }))
      .toThrow("Form.useBulkEdit fields 不能包含重复路径：department。");
    expect(() => createBulkEditSnapshot({ records: members, getRowKey: (row) => row.id, fields: ["profile", ["profile", "remark"]] }))
      .toThrow("Form.useBulkEdit fields 不能包含重叠路径：profile 与 profile.remark。");
  });

  it("rejects invalid and duplicate row keys", () => {
    expect(() => createBulkEditSnapshot({ records: members, getRowKey: (() => true) as unknown as (row: typeof members[number]) => string, fields: ["status"] }))
      .toThrow("Form.useBulkEdit 的记录 key 必须是 string 或 number。");
    expect(() => createBulkEditSnapshot({ records: members, getRowKey: () => "same", fields: ["status"] }))
      .toThrow("Form.useBulkEdit 的记录 key 不能重复：same。");
  });

  it("derives mixed and common values from nested paths", () => {
    const snapshot = createBulkEditSnapshot({
      records: members,
      getRowKey: (row) => row.id,
      fields: ["department", "status", ["profile", "remark"]],
    });

    expect(snapshot.fields).toMatchObject([
      { name: ["department"], mixed: true, initialValue: undefined },
      { name: ["status"], mixed: false, initialValue: "enabled" },
      { name: ["profile", "remark"], mixed: true, initialValue: undefined },
    ]);
    expect(snapshot.rowKeys).toEqual(["member-1", "member-2"]);
  });

  it("compares supported form values deterministically", () => {
    const sparse = Array(2); sparse[1] = "x";
    const explicit = [undefined, "x"];
    const records = [
      { id: 1, nan: Number.NaN, date: new Date("2026-09-25T00:00:00Z"), object: { a: 1, b: { c: 2 } }, array: [1, { x: 2 }], sparse },
      { id: 2, nan: Number.NaN, date: new Date("2026-09-25T00:00:00Z"), object: { b: { c: 2 }, a: 1 }, array: [1, { x: 2 }], sparse: explicit },
    ];
    const snapshot = createBulkEditSnapshot({ records, getRowKey: (row) => row.id, fields: ["nan", "date", "object", "array", "sparse"] });

    expect(snapshot.fields.map((field) => field.mixed)).toEqual([false, false, false, false, true]);
  });

  it("uses a custom comparator and rejects cycles in the default comparator", () => {
    const left: { value: string; self?: unknown } = { value: "A" }; left.self = left;
    const right: { value: string; self?: unknown } = { value: "a" }; right.self = right;
    expect(() => createBulkEditSnapshot({ records: [{ id: 1, item: left }, { id: 2, item: right }], getRowKey: (row) => row.id, fields: ["item"] }))
      .toThrow("Form.useBulkEdit 默认比较器不支持循环引用，请提供 isEqual。");

    const snapshot = createBulkEditSnapshot({
      records: [{ id: 1, value: "A" }, { id: 2, value: "a" }],
      getRowKey: (row) => row.id,
      fields: ["value"],
      isEqual: (leftValue, rightValue) => String(leftValue).toLowerCase() === String(rightValue).toLowerCase(),
    });
    expect(snapshot.fields[0]?.mixed).toBe(false);
  });

  it("builds only set and clear fields into a nested patch", () => {
    const snapshot = createBulkEditSnapshot({
      records: members,
      getRowKey: (row) => row.id,
      fields: ["department", "status", ["profile", "remark"]],
    });
    const modes = new Map([[snapshot.fields[0]!.encodedName, "set"], [snapshot.fields[1]!.encodedName, "keep"], [snapshot.fields[2]!.encodedName, "clear"]] as const);

    expect(buildBulkEditPatch(snapshot, modes, { department: "product", status: "enabled" }, snapshot.rowKeys)).toEqual({
      targetKeys: ["member-1", "member-2"],
      values: { department: "product" },
      clearedFields: [["profile", "remark"]],
    });
  });

  it("returns stable blocked errors for empty targets and unchanged fields", () => {
    const snapshot = createBulkEditSnapshot({ records: members, getRowKey: (row) => row.id, fields: ["status"] });
    expect(() => buildBulkEditPatch(snapshot, new Map(), {}, [])).toThrow(expect.objectContaining({ name: "FormBulkEditBlockedError", code: "no-targets" }));
    expect(() => buildBulkEditPatch(snapshot, new Map(), {}, snapshot.rowKeys)).toThrow(expect.objectContaining({ name: "FormBulkEditBlockedError", code: "no-changes" }));
  });

  it("accepts complete results with multiple failures for one key", () => {
    expect(validateBulkEditResult(["member-1", "member-2"], ["department", "status"], {
      succeededKeys: ["member-1"],
      failures: [
        { key: "member-2", field: "department", message: "部门失败" },
        { key: "member-2", field: "status", message: "状态失败" },
      ],
    })).toEqual({ succeededKeys: ["member-1"], failedKeys: ["member-2"] });
  });

  it.each([
    [{ succeededKeys: ["member-1", "member-1"], failures: [{ key: "member-2", message: "失败" }] }, "成功 key 不能重复"],
    [{ succeededKeys: ["member-1"], failures: [{ key: "member-1", message: "失败" }, { key: "member-2", message: "失败" }] }, "同一个 key 不能同时成功和失败"],
    [{ succeededKeys: ["member-1"], failures: [{ key: "unknown", message: "失败" }] }, "结果包含未知 key"],
    [{ succeededKeys: ["member-1"], failures: [] }, "结果缺少 key"],
    [{ succeededKeys: ["member-1"], failures: [{ key: "member-2", message: "" }] }, "失败原因不能为空"],
    [{ succeededKeys: ["member-1"], failures: [{ key: "member-2", field: "role", message: "失败" }] }, "失败字段不在 fields 中"],
  ])("rejects ambiguous result %#", (result, message) => {
    expect(() => validateBulkEditResult(["member-1", "member-2"], ["department", "status"], result as never)).toThrow(message);
  });
});
