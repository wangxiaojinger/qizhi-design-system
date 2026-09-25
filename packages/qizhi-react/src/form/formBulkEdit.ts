import { useEffect, useReducer, useRef } from "react";
import type {
  FormBulkEditController,
  FormBulkEditFailure,
  FormBulkEditKey,
  FormBulkEditMode,
  FormBulkEditOptions,
  FormBulkEditResult,
  FormNamePath,
} from "./Form.types";
import {
  areBulkEditSnapshotsEqual,
  buildBulkEditPatch,
  createBulkEditBlockedError,
  createBulkEditSnapshot,
  validateBulkEditResult,
  type BulkEditSnapshot,
} from "./formBulkEditCore";
import { encodeNamePath, normalizeNamePath } from "./formPath";
import { getFormStore } from "./formStore";

export function useBulkEdit<TRecord, TKey extends FormBulkEditKey>({
  form,
  records,
  getRowKey,
  fields,
  getFieldValue,
  isEqual,
}: FormBulkEditOptions<TRecord, TKey>): FormBulkEditController<TKey> {
  const store = getFormStore(form);
  if (!store) throw new Error("Form.useBulkEdit 必须接收由 Form.useForm 创建的 form 实例。");
  const latestSnapshot = createBulkEditSnapshot({ records, getRowKey, fields, getFieldValue, isEqual });
  const latestSnapshotRef = useRef(latestSnapshot);
  latestSnapshotRef.current = latestSnapshot;
  const acceptedSnapshotRef = useRef<BulkEditSnapshot<TRecord, TKey>>(latestSnapshot);
  const initializedRef = useRef(false);
  const internalWriteRef = useRef(false);
  const modesRef = useRef(new Map<string, FormBulkEditMode>());
  const failuresRef = useRef<FormBulkEditFailure<TKey>[]>([]);
  const succeededKeysRef = useRef<TKey[]>([]);
  const remainingKeysRef = useRef<TKey[]>([...latestSnapshot.rowKeys]);
  const statusRef = useRef<"ready" | "sourceChanged" | "complete">("ready");
  const stateVersionRef = useRef(0);
  const validationRequestRef = useRef(0);
  const [, forceRender] = useReducer((value: number) => value + 1, 0);
  const fieldsKey = latestSnapshot.fields.map((field) => field.encodedName).join("|");

  const hasChanges = () => [...modesRef.current.values()].some((mode) => mode !== "keep");
  const getCurrentStatus = () => statusRef.current;
  const findAcceptedField = (name: FormNamePath) => {
    const encoded = encodeNamePath(name);
    const field = acceptedSnapshotRef.current.fields.find((candidate) => candidate.encodedName === encoded);
    if (!field) throw new Error(`Form.useBulkEdit 未声明字段：${normalizeNamePath(name).join(".")}。`);
    return field;
  };
  const writeSnapshotValues = (snapshot: BulkEditSnapshot<TRecord, TKey>) => {
    internalWriteRef.current = true;
    try {
      snapshot.fields.forEach((field) => form.setFieldValue(field.name, field.initialValue));
      form.markFieldsClean(snapshot.fields.map((field) => field.name));
    } finally {
      internalWriteRef.current = false;
    }
  };
  const acceptSnapshot = (snapshot: BulkEditSnapshot<TRecord, TKey>) => {
    acceptedSnapshotRef.current = snapshot;
    modesRef.current = new Map(snapshot.fields.map((field) => [field.encodedName, "keep" as const]));
    failuresRef.current = [];
    succeededKeysRef.current = [];
    remainingKeysRef.current = [...snapshot.rowKeys];
    statusRef.current = "ready";
    stateVersionRef.current += 1;
    validationRequestRef.current += 1;
    writeSnapshotValues(snapshot);
    forceRender();
  };

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      acceptSnapshot(latestSnapshotRef.current);
      return;
    }
    if (areBulkEditSnapshotsEqual(acceptedSnapshotRef.current, latestSnapshotRef.current, remainingKeysRef.current)) return;
    if (hasChanges()) {
      if (statusRef.current !== "sourceChanged") {
        statusRef.current = "sourceChanged";
        stateVersionRef.current += 1;
        validationRequestRef.current += 1;
        forceRender();
      }
      return;
    }
    acceptSnapshot(latestSnapshotRef.current);
  });

  useEffect(() => {
    const unsubscribers = latestSnapshot.fields.map((field) => store.subscribePath(field.name, () => {
      if (internalWriteRef.current) return;
      const acceptedField = acceptedSnapshotRef.current.fields.find((candidate) => candidate.encodedName === field.encodedName);
      if (!acceptedField) return;
      const currentValue = form.getFieldValue(field.name);
      const nextMode: FormBulkEditMode = acceptedField.mixed
        ? "set"
        : acceptedSnapshotRef.current.isEqual(currentValue, acceptedField.initialValue, acceptedField.name) ? "keep" : "set";
      const previousMode = modesRef.current.get(field.encodedName) ?? "keep";
      const nextFailures = failuresRef.current.filter((failure) => failure.field === undefined || encodeNamePath(failure.field) !== field.encodedName);
      if (previousMode === nextMode && nextFailures.length === failuresRef.current.length) return;
      modesRef.current.set(field.encodedName, nextMode);
      failuresRef.current = nextFailures;
      if (statusRef.current === "complete") statusRef.current = "ready";
      stateVersionRef.current += 1;
      forceRender();
    }));
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [fieldsKey, form, store]);

  const setFieldMode = (name: FormNamePath, mode: "keep" | "clear") => {
    const field = findAcceptedField(name);
    internalWriteRef.current = true;
    try { form.setFieldValue(field.name, mode === "clear" ? undefined : field.initialValue); }
    finally { internalWriteRef.current = false; }
    modesRef.current.set(field.encodedName, mode);
    failuresRef.current = failuresRef.current.filter((failure) => failure.field === undefined || encodeNamePath(failure.field) !== field.encodedName);
    statusRef.current = "ready";
    stateVersionRef.current += 1;
    validationRequestRef.current += 1;
    forceRender();
  };

  const validate = async () => {
    if (getCurrentStatus() === "sourceChanged") throw createBulkEditBlockedError("source-changed");
    if (!remainingKeysRef.current.length) throw createBulkEditBlockedError("no-targets");
    const changedFields = acceptedSnapshotRef.current.fields
      .filter((field) => (modesRef.current.get(field.encodedName) ?? "keep") !== "keep")
      .map((field) => field.name);
    if (!changedFields.length) throw createBulkEditBlockedError("no-changes");
    const request = ++validationRequestRef.current;
    const stateVersion = stateVersionRef.current;
    await form.validateFields(changedFields);
    if (
      request !== validationRequestRef.current
      || stateVersion !== stateVersionRef.current
      || getCurrentStatus() === "sourceChanged"
    ) {
      throw Object.assign(new Error("Form.useBulkEdit 校验结果已过期。"), { name: "FormBulkEditValidationCancelled" });
    }
    return buildBulkEditPatch(acceptedSnapshotRef.current, modesRef.current, form.getFieldsValue(), remainingKeysRef.current);
  };

  const applyResult = (result: FormBulkEditResult<TKey>) => {
    const classification = validateBulkEditResult(
      remainingKeysRef.current,
      acceptedSnapshotRef.current.fields.map((field) => field.name),
      result,
    );
    const successful = new Set(classification.succeededKeys);
    succeededKeysRef.current = [
      ...succeededKeysRef.current,
      ...remainingKeysRef.current.filter((key) => successful.has(key)),
    ];
    remainingKeysRef.current = classification.failedKeys;
    failuresRef.current = [...result.failures];
    statusRef.current = remainingKeysRef.current.length ? "ready" : "complete";
    stateVersionRef.current += 1;
    validationRequestRef.current += 1;
    forceRender();
  };

  return {
    getFieldState: (name) => {
      const field = findAcceptedField(name);
      return { name: [...field.name], mixed: field.mixed, mode: modesRef.current.get(field.encodedName) ?? "keep", initialValue: field.initialValue };
    },
    getFieldFailures: (name) => {
      const encoded = encodeNamePath(name);
      return failuresRef.current.filter((failure) => failure.field !== undefined && encodeNamePath(failure.field) === encoded);
    },
    clearField: (name) => setFieldMode(name, "clear"),
    keepField: (name) => setFieldMode(name, "keep"),
    validate,
    applyResult,
    rebase: () => acceptSnapshot(latestSnapshotRef.current),
    reset: () => acceptSnapshot(acceptedSnapshotRef.current),
    status: statusRef.current,
    failures: failuresRef.current,
    succeededKeys: succeededKeysRef.current,
    remainingKeys: remainingKeysRef.current,
    hasChanges: hasChanges(),
  };
}
