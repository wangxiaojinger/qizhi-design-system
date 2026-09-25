import type {
  FormBulkEditBlockedCode,
  FormBulkEditBlockedError,
  FormBulkEditKey,
  FormBulkEditMode,
  FormBulkEditPatch,
  FormBulkEditResult,
  FormNamePath,
  FormNameSegment,
  FormValues,
} from "./Form.types";
import { encodeNamePath, getValueAtPath, normalizeNamePath, setValueAtPath } from "./formPath";

export interface BulkEditSnapshotField {
  name: readonly FormNameSegment[];
  encodedName: string;
  mixed: boolean;
  initialValue: unknown;
}

export interface BulkEditSnapshot<TRecord, TKey extends FormBulkEditKey> {
  records: readonly TRecord[];
  rowKeys: readonly TKey[];
  fields: readonly BulkEditSnapshotField[];
  valuesByField: ReadonlyMap<string, readonly unknown[]>;
  isEqual: (left: unknown, right: unknown, name: FormNamePath) => boolean;
}

export interface CreateBulkEditSnapshotOptions<TRecord, TKey extends FormBulkEditKey> {
  records: readonly TRecord[];
  getRowKey: (record: TRecord) => TKey;
  fields: readonly FormNamePath[];
  getFieldValue?: (record: TRecord, name: FormNamePath) => unknown;
  isEqual?: (left: unknown, right: unknown, name: FormNamePath) => boolean;
}

const messageByCode: Record<FormBulkEditBlockedCode, string> = {
  "no-changes": "暂无可提交的修改。",
  "no-targets": "暂无可批量编辑的记录。",
  "source-changed": "批量编辑期间源数据已变化，请基于最新数据重新开始。",
};

export const createBulkEditBlockedError = (code: FormBulkEditBlockedCode): FormBulkEditBlockedError =>
  Object.assign(new Error(messageByCode[code]), { name: "FormBulkEditBlockedError", code });

const isPlainObject = (value: object) => {
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

function defaultFormValueEqual(left: unknown, right: unknown, leftStack: object[] = [], rightStack: object[] = []): boolean {
  if (Object.is(left, right)) return true;
  if (left instanceof Date || right instanceof Date) {
    return left instanceof Date && right instanceof Date && left.getTime() === right.getTime();
  }
  if (!left || !right || typeof left !== "object" || typeof right !== "object") return false;
  if (leftStack.includes(left) || rightStack.includes(right)) {
    throw new Error("Form.useBulkEdit 默认比较器不支持循环引用，请提供 isEqual。");
  }
  const nextLeftStack = [...leftStack, left];
  const nextRightStack = [...rightStack, right];
  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false;
    for (let index = 0; index < left.length; index += 1) {
      if ((index in left) !== (index in right)) return false;
      if (index in left && !defaultFormValueEqual(left[index], right[index], nextLeftStack, nextRightStack)) return false;
    }
    return true;
  }
  if (!isPlainObject(left) || !isPlainObject(right)) return false;
  const leftKeys = Object.keys(left).sort();
  const rightKeys = Object.keys(right).sort();
  if (leftKeys.length !== rightKeys.length || leftKeys.some((key, index) => key !== rightKeys[index])) return false;
  return leftKeys.every((key) => defaultFormValueEqual(
    (left as Record<string, unknown>)[key],
    (right as Record<string, unknown>)[key],
    nextLeftStack,
    nextRightStack,
  ));
}

const displayPath = (path: readonly FormNameSegment[]) => path.join(".");
const isPathPrefix = (left: readonly FormNameSegment[], right: readonly FormNameSegment[]) =>
  left.length < right.length && left.every((segment, index) => Object.is(segment, right[index]));

export function createBulkEditSnapshot<TRecord, TKey extends FormBulkEditKey>({
  records,
  getRowKey,
  fields,
  getFieldValue = (record, name) => getValueAtPath(record, name),
  isEqual = (left, right) => defaultFormValueEqual(left, right),
}: CreateBulkEditSnapshotOptions<TRecord, TKey>): BulkEditSnapshot<TRecord, TKey> {
  if (!fields.length) throw new Error("Form.useBulkEdit fields 至少需要一个字段。");
  const normalizedFields = fields.map((field) => normalizeNamePath(field));
  const encodedFields = normalizedFields.map((field) => encodeNamePath(field));
  encodedFields.forEach((encoded, index) => {
    if (encodedFields.indexOf(encoded) !== index) {
      throw new Error(`Form.useBulkEdit fields 不能包含重复路径：${displayPath(normalizedFields[index]!)}。`);
    }
  });
  normalizedFields.forEach((field, index) => normalizedFields.slice(index + 1).forEach((candidate) => {
    if (isPathPrefix(field, candidate) || isPathPrefix(candidate, field)) {
      throw new Error(`Form.useBulkEdit fields 不能包含重叠路径：${displayPath(field)} 与 ${displayPath(candidate)}。`);
    }
  }));

  const rowKeys = records.map(getRowKey);
  const seenKeys = new Set<FormBulkEditKey>();
  rowKeys.forEach((key) => {
    if (typeof key !== "string" && typeof key !== "number") {
      throw new Error("Form.useBulkEdit 的记录 key 必须是 string 或 number。");
    }
    if (seenKeys.has(key)) throw new Error(`Form.useBulkEdit 的记录 key 不能重复：${String(key)}。`);
    seenKeys.add(key);
  });

  return {
    records,
    rowKeys,
    fields: normalizedFields.map((name, index) => {
      const values = records.map((record) => getFieldValue(record, name));
      const firstValue = values[0];
      const mixed = values.slice(1).some((value) => !isEqual(firstValue, value, name));
      return {
        name,
        encodedName: encodedFields[index]!,
        mixed,
        initialValue: mixed ? undefined : firstValue,
      };
    }),
    valuesByField: new Map(normalizedFields.map((name, index) => [
      encodedFields[index]!,
      records.map((record) => getFieldValue(record, name)),
    ])),
    isEqual,
  };
}

export function areBulkEditSnapshotsEqual<TRecord, TKey extends FormBulkEditKey>(
  accepted: BulkEditSnapshot<TRecord, TKey>,
  latest: BulkEditSnapshot<TRecord, TKey>,
  keys: readonly TKey[] = accepted.rowKeys,
): boolean {
  if (accepted.fields.length !== latest.fields.length) return false;
  if (accepted.fields.some((field, index) => field.encodedName !== latest.fields[index]?.encodedName)) return false;
  if (keys.length === accepted.rowKeys.length && (
    latest.rowKeys.length !== accepted.rowKeys.length
    || accepted.rowKeys.some((key, index) => !Object.is(key, latest.rowKeys[index]))
  )) return false;
  return keys.every((key) => {
    const acceptedIndex = accepted.rowKeys.findIndex((candidate) => Object.is(candidate, key));
    const latestIndex = latest.rowKeys.findIndex((candidate) => Object.is(candidate, key));
    if (acceptedIndex < 0 || latestIndex < 0) return false;
    return accepted.fields.every((field) => latest.isEqual(
      accepted.valuesByField.get(field.encodedName)?.[acceptedIndex],
      latest.valuesByField.get(field.encodedName)?.[latestIndex],
      field.name,
    ));
  });
}

export function buildBulkEditPatch<TRecord, TKey extends FormBulkEditKey>(
  snapshot: BulkEditSnapshot<TRecord, TKey>,
  modes: ReadonlyMap<string, FormBulkEditMode>,
  currentValues: FormValues,
  targetKeys: readonly TKey[],
): FormBulkEditPatch<TKey> {
  if (!targetKeys.length) throw createBulkEditBlockedError("no-targets");
  let values: FormValues = {};
  const clearedFields: FormNamePath[] = [];
  let changed = false;
  snapshot.fields.forEach((field) => {
    const mode = modes.get(field.encodedName) ?? "keep";
    if (mode === "set") {
      values = setValueAtPath(values, field.name, getValueAtPath(currentValues, field.name));
      changed = true;
    }
    if (mode === "clear") {
      clearedFields.push([...field.name]);
      changed = true;
    }
  });
  if (!changed) throw createBulkEditBlockedError("no-changes");
  return { targetKeys: [...targetKeys], values, clearedFields };
}

export function validateBulkEditResult<TKey extends FormBulkEditKey>(
  targetKeys: readonly TKey[],
  fields: readonly FormNamePath[],
  result: FormBulkEditResult<TKey>,
): { succeededKeys: TKey[]; failedKeys: TKey[] } {
  const targetSet = new Set(targetKeys);
  const fieldSet = new Set(fields.map(encodeNamePath));
  const succeededSet = new Set<TKey>();
  result.succeededKeys.forEach((key) => {
    if (succeededSet.has(key)) throw new Error(`Form.useBulkEdit 结果中的成功 key 不能重复：${String(key)}。`);
    if (!targetSet.has(key)) throw new Error(`Form.useBulkEdit 结果包含未知 key：${String(key)}。`);
    succeededSet.add(key);
  });
  const failedSet = new Set<TKey>();
  result.failures.forEach((failure) => {
    if (!targetSet.has(failure.key)) throw new Error(`Form.useBulkEdit 结果包含未知 key：${String(failure.key)}。`);
    if (succeededSet.has(failure.key)) throw new Error(`Form.useBulkEdit 同一个 key 不能同时成功和失败：${String(failure.key)}。`);
    if (!failure.message.trim()) throw new Error(`Form.useBulkEdit key ${String(failure.key)} 的失败原因不能为空。`);
    if (failure.field !== undefined && !fieldSet.has(encodeNamePath(failure.field))) {
      throw new Error(`Form.useBulkEdit 失败字段不在 fields 中：${displayPath(normalizeNamePath(failure.field))}。`);
    }
    failedSet.add(failure.key);
  });
  targetKeys.forEach((key) => {
    if (!succeededSet.has(key) && !failedSet.has(key)) throw new Error(`Form.useBulkEdit 结果缺少 key：${String(key)}。`);
  });
  return {
    succeededKeys: targetKeys.filter((key) => succeededSet.has(key)),
    failedKeys: targetKeys.filter((key) => failedSet.has(key)),
  };
}
