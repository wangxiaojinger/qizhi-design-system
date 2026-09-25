import type { FormErrorField, FormInstance, FormListRowRule, FormListRule, FormNamePath, FormNameSegment, FormProps, FormRule, FormRuleFailure, FormValidationException, FormValidateTrigger, FormValues } from "./Form.types";
import { buildValueAtPath, encodeNamePath, getValueAtPath, isSameOrAncestorPath, normalizeNamePath, setValueAtPath, unsetValueAtPath } from "./formPath";

type FieldConfig = { rules: FormRule[]; validateTrigger: FormValidateTrigger; dependencies?: FormNamePath[]; preserve?: boolean };
type FieldState = FieldConfig & { path: FormNameSegment[] };
type ListConfig = { path: FormNameSegment[]; min?: number; max?: number; rules: FormListRule[]; rowRules: FormListRowRule[] };

export interface FormStore {
  instance: FormInstance;
  initialize(values?: FormValues): void;
  setCallbacks(callbacks: Pick<FormProps, "onValuesChange" | "onValidationException">): void;
  setDefaultPreserve(value: boolean): void;
  subscribe(listener: () => void): () => void;
  subscribePath(name: FormNamePath, listener: () => void): () => void;
  subscribeDirty(listener: () => void): () => void;
  subscribeField(name: FormNamePath, listener: () => void): () => void;
  markValuesClean(values: FormValues): void;
  registerField(name: FormNamePath, config: FieldConfig): () => void;
  updateFieldConfig(name: FormNamePath, config: FieldConfig): void;
  setFieldValueFromControl(name: FormNamePath, value: unknown): void;
  setFormNode(node: HTMLFormElement | null): void;
  requestValidatedSubmit(): void;
  consumeValidatedSubmit(): boolean;
  setFieldNode(name: FormNamePath, node: HTMLDivElement | null): void;
  validateField(name: FormNamePath, cancelOnStale?: boolean): Promise<string[]>;
  getFieldErrors(name: FormNamePath): string[];
  isFieldValidating(name: FormNamePath): boolean;
  getListKeys(name: FormNamePath): string[];
  initializeList(name: FormNamePath, initialValue?: unknown[]): void;
  registerList(name: FormNamePath, config: Omit<ListConfig, "path">): () => void;
  updateListConfig(name: FormNamePath, config: Omit<ListConfig, "path">): void;
  canAddListValues(name: FormNamePath, count?: number): boolean;
  canRemoveListValues(name: FormNamePath, index: number | readonly number[]): boolean;
  addListValues(name: FormNamePath, values: readonly unknown[], index?: number): void;
  validateList(name: FormNamePath, cancelOnStale?: boolean): Promise<{ errors: string[]; rowErrors: Array<{ index: number; errors: string[] }> }>;
  getListErrors(name: FormNamePath): string[];
  getListRowErrors(name: FormNamePath, rowKey: string): string[];
  addListValue(name: FormNamePath, value?: unknown, index?: number): void;
  removeListValue(name: FormNamePath, index: number | readonly number[]): void;
  moveListValue(name: FormNamePath, from: number, to: number): void;
}

const stores = new WeakMap<FormInstance, FormStore>();
let listKey = 0;
const nextListKey = () => `qizhi-form-list-${++listKey}`;
const validationCancelled = Symbol("qizhi-form-validation-cancelled");
const assertListLimits = (min?: number, max?: number) => {
  if (min !== undefined && (!Number.isSafeInteger(min) || min < 0)) throw new Error("Form.List min 必须是非负安全整数。");
  if (max !== undefined && (!Number.isSafeInteger(max) || max < 0)) throw new Error("Form.List max 必须是非负安全整数。");
  if (min !== undefined && max !== undefined && min > max) throw new Error("Form.List min 不能大于 max。");
};
const validRemovalIndexes = (length: number, input: number | readonly number[]) =>
  [...new Set(typeof input === "number" ? [input] : input)]
    .filter((index) => Number.isSafeInteger(index) && index >= 0 && index < length)
    .sort((left, right) => right - left);

export const isValidationCancelled = (error: unknown): boolean => error === validationCancelled;

const isEqualValue = (left: unknown, right: unknown): boolean => {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left) && Array.isArray(right) && left.length === right.length && left.every((item, index) => isEqualValue(item, right[index]));
  }
  if (left && right && typeof left === "object" && typeof right === "object") {
    const leftEntries = Object.entries(left as FormValues);
    const rightRecord = right as FormValues;
    return leftEntries.length === Object.keys(rightRecord).length && leftEntries.every(([key, value]) => Object.prototype.hasOwnProperty.call(rightRecord, key) && isEqualValue(value, rightRecord[key]));
  }
  return false;
};

const valueEntries = (value: unknown, path: FormNameSegment[] = []): Array<[FormNameSegment[], unknown]> => {
  if (Array.isArray(value)) return [[path, value]];
  if (value && typeof value === "object") {
    const entries = Object.entries(value as FormValues);
    return entries.length ? entries.flatMap(([key, item]) => valueEntries(item, [...path, key])) : [[path, value]];
  }
  return [[path, value]];
};

export function createFormStore(): FormStore {
  let initialized = false;
  let initialValues: FormValues = {};
  let values: FormValues = {};
  let cleanValues: FormValues = {};
  let callbacks: Pick<FormProps, "onValuesChange" | "onValidationException"> = {};
  let defaultPreserve = true;
  let formNode: HTMLFormElement | null = null;
  let validatedSubmitPending = false;
  const fields = new Map<string, FieldState>();
  const retained = new Map<string, FormNameSegment[]>();
  const retainedFields = new Map<string, FieldState>();
  const errors = new Map<string, string[]>();
  const errorPaths = new Map<string, FormNameSegment[]>();
  const errorSources = new Map<string, "client" | "server">();
  const validating = new Set<string>();
  const validationVersions = new Map<string, number>();
  const nodes = new Map<string, HTMLDivElement>();
  const listeners = new Set<() => void>();
  const dirtyListeners = new Set<() => void>();
  const pathListeners = new Set<{ path: FormNameSegment[]; value: unknown; listener: () => void }>();
  const fieldListeners = new Set<{ path: FormNameSegment[]; listener: () => void }>();
  const lists = new Map<string, string[]>();
  const listPaths = new Map<string, FormNameSegment[]>();
  const listConfigs = new Map<string, ListConfig>();
  const listErrors = new Map<string, string[]>();
  const listRowErrors = new Map<string, Map<string, string[]>>();
  const listValidationVersions = new Map<string, number>();
  const dependencyIndex = new Map<string, { path: FormNameSegment[]; dependents: Set<string> }>();
  let lastDirty = false;

  const isDirty = (names?: FormNamePath[]) => names?.length
    ? names.some((name) => !isEqualValue(getValueAtPath(values, name), getValueAtPath(cleanValues, name)))
    : !isEqualValue(values, cleanValues);
  const notifyDirty = () => {
    const nextDirty = isDirty();
    if (nextDirty === lastDirty) return;
    lastDirty = nextDirty;
    dirtyListeners.forEach((listener) => listener());
  };

  const nextValidationVersion = (key: string) => {
    const version = (validationVersions.get(key) ?? 0) + 1;
    validationVersions.set(key, version);
    return version;
  };
  const invalidateValidationPath = (name: FormNamePath) => {
    const path = normalizeNamePath(name);
    fields.forEach((field, key) => {
      if (isSameOrAncestorPath(path, field.path)) {
        nextValidationVersion(key);
        validating.delete(key);
      }
    });
  };
  const isRuleFailure = (value: unknown): value is FormRuleFailure => Boolean(
    value && typeof value === "object" && "type" in value && ((value as FormRuleFailure).type === "field" || (value as FormRuleFailure).type === "network") && typeof (value as FormRuleFailure).message === "string",
  );
  const publicNamePath = (name: FormNamePath): FormNamePath => {
    const path = normalizeNamePath(name);
    return path.length === 1 && typeof path[0] === "string" ? path[0] : path;
  };

  const rebuildDependencyIndex = () => {
    dependencyIndex.clear();
    fields.forEach((field, dependentKey) => {
      field.dependencies?.forEach((dependency) => {
        const path = normalizeNamePath(dependency);
        const sourceKey = encodeNamePath(path);
        const entry = dependencyIndex.get(sourceKey) ?? { path, dependents: new Set<string>() };
        entry.dependents.add(dependentKey);
        dependencyIndex.set(sourceKey, entry);
      });
    });
  };

  const clearPathState = (name: FormNamePath) => {
    const path = normalizeNamePath(name);
    invalidateValidationPath(path);
    const fieldPaths = new Map([...fields].map(([key, field]) => [key, field.path]));
    const knownPaths = new Map<string, FormNameSegment[]>([...retained, ...errorPaths, ...listPaths, ...fieldPaths]);
    const statePath = (key: string) => knownPaths.get(key);
    const isDescendant = (candidate?: FormNameSegment[]) => Boolean(candidate && isSameOrAncestorPath(path, candidate));
    values = unsetValueAtPath(values, path);
    [...fields].forEach(([key, field]) => { if (isDescendant(field.path)) fields.delete(key); });
    [...retained].forEach(([key, candidate]) => { if (isDescendant(candidate)) retained.delete(key); });
    [...retainedFields].forEach(([key, field]) => { if (isDescendant(field.path)) retainedFields.delete(key); });
    [...errors].forEach(([key]) => { if (isDescendant(statePath(key))) errors.delete(key); });
    [...errorPaths].forEach(([key, candidate]) => { if (isDescendant(candidate)) errorPaths.delete(key); });
    [...errorSources].forEach(([key]) => { if (isDescendant(statePath(key))) errorSources.delete(key); });
    [...validating].forEach((key) => { if (isDescendant(statePath(key))) validating.delete(key); });
    [...nodes].forEach(([key]) => { if (isDescendant(statePath(key))) nodes.delete(key); });
    [...lists].forEach(([key]) => { if (isDescendant(listPaths.get(key))) lists.delete(key); });
    [...listPaths].forEach(([key, candidate]) => { if (isDescendant(candidate)) listPaths.delete(key); });
    [...listConfigs].forEach(([key, config]) => { if (isDescendant(config.path)) listConfigs.delete(key); });
    [...listErrors].forEach(([key]) => { if (!listConfigs.has(key)) listErrors.delete(key); });
    [...listRowErrors].forEach(([key]) => { if (!listConfigs.has(key)) listRowErrors.delete(key); });
    rebuildDependencyIndex();
    notifyDirty();
  };

  const remapListState = (name: FormNamePath, mapIndex: (index: number) => number | undefined) => {
    const listPath = normalizeNamePath(name);
    const originalFieldPaths = new Map([...fields].map(([key, field]) => [key, [...field.path]]));
    const originalErrorPaths = new Map([...errorPaths].map(([key, path]) => [key, [...path]]));
    const pathForKey = (key: string) => originalErrorPaths.get(key) ?? originalFieldPaths.get(key);
    const remapPath = (path: FormNameSegment[]) => {
      if (!isSameOrAncestorPath(listPath, path) || path.length <= listPath.length) return path;
      const index = path[listPath.length];
      if (typeof index !== "number") return path;
      const nextIndex = mapIndex(index);
      return nextIndex === undefined ? undefined : [...path.slice(0, listPath.length), nextIndex, ...path.slice(listPath.length + 1)];
    };
    const nextFields = new Map<string, FieldState>();
    fields.forEach((field) => {
      const path = remapPath(field.path);
      if (!path) return;
      field.path = path;
      field.dependencies = field.dependencies?.map((dependency) => remapPath(normalizeNamePath(dependency))).filter((dependency): dependency is FormNameSegment[] => Boolean(dependency));
      nextFields.set(encodeNamePath(path), field);
    });
    fields.clear(); nextFields.forEach((field, key) => fields.set(key, field));
    rebuildDependencyIndex();

    const nextRetained = new Map<string, FormNameSegment[]>();
    retained.forEach((path) => { const nextPath = remapPath(path); if (nextPath) nextRetained.set(encodeNamePath(nextPath), nextPath); });
    retained.clear(); nextRetained.forEach((path, key) => retained.set(key, path));

    const nextRetainedFields = new Map<string, FieldState>();
    retainedFields.forEach((field) => {
      const path = remapPath(field.path);
      if (!path) return;
      field.path = path;
      field.dependencies = field.dependencies?.map((dependency) => remapPath(normalizeNamePath(dependency))).filter((dependency): dependency is FormNameSegment[] => Boolean(dependency));
      nextRetainedFields.set(encodeNamePath(path), field);
    });
    retainedFields.clear(); nextRetainedFields.forEach((field, key) => retainedFields.set(key, field));

    const nextErrors = new Map<string, string[]>();
    const nextErrorPaths = new Map<string, FormNameSegment[]>();
    errors.forEach((value, key) => {
      const sourcePath = pathForKey(key);
      if (!sourcePath) return;
      const path = remapPath(sourcePath);
      if (!path) return;
      const nextKey = encodeNamePath(path); nextErrors.set(nextKey, value); nextErrorPaths.set(nextKey, path);
    });
    errors.clear(); nextErrors.forEach((value, key) => errors.set(key, value));
    errorPaths.clear(); nextErrorPaths.forEach((path, key) => errorPaths.set(key, path));

    const nextSources = new Map<string, "client" | "server">();
    errorSources.forEach((source, key) => { const sourcePath = pathForKey(key); const path = sourcePath && remapPath(sourcePath); if (path) nextSources.set(encodeNamePath(path), source); });
    errorSources.clear(); nextSources.forEach((source, key) => errorSources.set(key, source));

    const nextValidating = new Set<string>();
    validating.forEach((key) => { const sourcePath = pathForKey(key); const path = sourcePath && remapPath(sourcePath); if (path) nextValidating.add(encodeNamePath(path)); });
    validating.clear(); nextValidating.forEach((key) => validating.add(key));

    const nextNodes = new Map<string, HTMLDivElement>();
    nodes.forEach((node, key) => { const sourcePath = pathForKey(key); const path = sourcePath && remapPath(sourcePath); if (path) nextNodes.set(encodeNamePath(path), node); });
    nodes.clear(); nextNodes.forEach((node, key) => nodes.set(key, node));

    const originalListPaths: Array<[string, FormNameSegment[]]> = [...listPaths.entries()].map(([key, path]) => [key, [...path]]);
    originalListPaths.forEach(([oldKey, originalPath]) => {
      if (!isSameOrAncestorPath(listPath, originalPath) || originalPath.length <= listPath.length) return;
      const nextPath = remapPath(originalPath);
      const keys = lists.get(oldKey); const config = listConfigs.get(oldKey); const currentErrors = listErrors.get(oldKey); const rowErrors = listRowErrors.get(oldKey); const version = listValidationVersions.get(oldKey);
      lists.delete(oldKey); listPaths.delete(oldKey); listConfigs.delete(oldKey); listErrors.delete(oldKey); listRowErrors.delete(oldKey); listValidationVersions.delete(oldKey);
      if (!nextPath) return;
      const nextKey = encodeNamePath(nextPath);
      if (keys) lists.set(nextKey, keys); listPaths.set(nextKey, nextPath);
      if (config) listConfigs.set(nextKey, { ...config, path: nextPath });
      if (currentErrors) listErrors.set(nextKey, currentErrors);
      if (rowErrors) listRowErrors.set(nextKey, rowErrors);
      if (version !== undefined) listValidationVersions.set(nextKey, version + 1);
    });
  };

  const registeredValues = () => {
    let result: FormValues = {};
    const paths = [...fields.values()].map((field) => field.path).concat([...retained.values()]);
    paths.forEach((path) => { result = setValueAtPath(result, path, getValueAtPath(values, path)); });
    return result;
  };
  const notify = (changed?: FormNamePath) => {
    listeners.forEach((listener) => listener());
    if (changed) {
      fieldListeners.forEach((entry) => {
        if (isSameOrAncestorPath(entry.path, changed) || isSameOrAncestorPath(changed, entry.path)) entry.listener();
      });
      pathListeners.forEach((entry) => {
        if (!isSameOrAncestorPath(entry.path, changed) && !isSameOrAncestorPath(changed, entry.path)) return;
        const nextValue = getValueAtPath(values, entry.path);
        if (Object.is(entry.value, nextValue)) return;
        entry.value = nextValue;
        entry.listener();
      });
    }
  };
  const validateDependents = (changed: FormNamePath) => {
    const dependentKeys = new Set<string>();
    dependencyIndex.forEach((entry) => {
      if (isSameOrAncestorPath(entry.path, changed) || isSameOrAncestorPath(changed, entry.path)) {
        entry.dependents.forEach((key) => dependentKeys.add(key));
      }
    });
    dependentKeys.forEach((key) => { const field = fields.get(key); if (field) void store.validateField(field.path).catch(() => undefined); });
  };
  const clearDescendantErrors = (name: FormNamePath) => {
    const path = normalizeNamePath(name);
    [...errorPaths].forEach(([key, errorPath]) => {
      if (!isSameOrAncestorPath(path, errorPath)) return;
      errors.delete(key);
      errorPaths.delete(key);
      errorSources.delete(key);
    });
  };
  const syncAffectedLists = (changed: FormNamePath) => {
    listPaths.forEach((listPath, listKeyValue) => {
      if (!isSameOrAncestorPath(changed, listPath)) return;
      const listValue = getValueAtPath(values, listPath);
      const nextLength = Array.isArray(listValue) ? listValue.length : 0;
      remapListState(listPath, (index) => index < nextLength ? index : undefined);
      const nextKeys = (lists.get(listKeyValue) ?? []).slice(0, nextLength);
      while (nextKeys.length < nextLength) nextKeys.push(nextListKey());
      lists.set(listKeyValue, nextKeys);
      listPaths.forEach((nestedPath, nestedKey) => {
        if (!isSameOrAncestorPath(listPath, nestedPath) || nestedPath.length <= listPath.length) return;
        const index = nestedPath[listPath.length];
        if (typeof index !== "number" || index < nextLength) return;
        lists.delete(nestedKey);
        listPaths.delete(nestedKey);
      });
    });
  };
  const setValue = (name: FormNamePath, value: unknown, user: boolean) => {
    const previous = getValueAtPath(values, name);
    if (Object.is(previous, value)) return;
    values = setValueAtPath(values, name, value);
    const key = encodeNamePath(name);
    if (errorSources.get(key) === "server") { errors.delete(key); errorPaths.delete(key); errorSources.delete(key); }
    if (user) callbacks.onValuesChange?.(buildValueAtPath(name, value), registeredValues());
    notify(name);
    notifyDirty();
    if (fields.get(key)?.validateTrigger === "onChange" && user) void store.validateField(name).catch(() => undefined);
    validateDependents(name);
    listConfigs.forEach((config) => {
      if (isSameOrAncestorPath(config.path, name) || isSameOrAncestorPath(name, config.path)) void store.validateList(config.path).catch(() => undefined);
    });
  };
  const instance: FormInstance = {
    getFieldsValue: registeredValues,
    getFieldValue: (name) => getValueAtPath(values, name),
    setFieldsValue: (nextValues) => {
      valueEntries(nextValues).forEach(([path, value]) => {
        values = setValueAtPath(values, path, value);
        invalidateValidationPath(path);
        clearDescendantErrors(path);
        syncAffectedLists(path);
        notify(path); notifyDirty(); validateDependents(path);
        listConfigs.forEach((config) => { if (isSameOrAncestorPath(config.path, path) || isSameOrAncestorPath(path, config.path)) void store.validateList(config.path).catch(() => undefined); });
      });
    },
    setFieldValue: (name, value) => setValue(name, value, false),
    getFieldError: (name) => [...(errors.get(encodeNamePath(name)) ?? [])],
    setFieldErrors: (name, nextErrors) => {
      const key = encodeNamePath(name); errors.set(key, [...nextErrors]);
      if (nextErrors.length) { errorSources.set(key, "server"); errorPaths.set(key, normalizeNamePath(name)); }
      else { errorSources.delete(key); errorPaths.delete(key); }
      notify(name);
    },
    validateFields: async (names) => {
      const errorFields: FormErrorField[] = [];
      const allFields = [...fields.values(), ...retainedFields.values()];
      const selectedFields = names === undefined
        ? allFields
        : allFields.filter((field) => names.some((name) => isSameOrAncestorPath(name, field.path)));
      for (const field of selectedFields) {
        const fieldErrors = await store.validateField(field.path, true);
        if (fieldErrors.length) errorFields.push({ name: field.path.length === 1 && typeof field.path[0] === "string" ? field.path[0] : field.path, errors: fieldErrors });
      }
      const selectedLists = [...listConfigs.values()].filter((list) => names === undefined || names.some((name) => isSameOrAncestorPath(name, list.path) || isSameOrAncestorPath(list.path, name)));
      for (const list of selectedLists) {
        const result = await store.validateList(list.path, true);
        if (result.errors.length) errorFields.push({ name: publicNamePath(list.path), errors: result.errors });
        result.rowErrors.forEach(({ index, errors: currentErrors }) => {
          if (currentErrors.length) errorFields.push({ name: [...list.path, index], errors: currentErrors });
        });
      }
      const result = registeredValues();
      if (errorFields.length) throw { values: result, errorFields };
      return result;
    },
    resetFields: (names) => {
      const targets = names ?? [...fields.values()].map((field) => field.path).concat([...retained.values()]);
      if (!names) {
        targets.forEach(invalidateValidationPath);
        values = structuredClone(initialValues);
        errors.clear(); errorPaths.clear(); errorSources.clear(); validating.clear(); listErrors.clear(); listRowErrors.clear();
        listValidationVersions.forEach((_version, key) => listValidationVersions.set(key, (_version ?? 0) + 1));
        listPaths.forEach((listPath, listKeyValue) => {
          const listValue = getValueAtPath(values, listPath);
          lists.set(listKeyValue, Array.from({ length: Array.isArray(listValue) ? listValue.length : 0 }, nextListKey));
        });
        targets.forEach((name) => { notify(name); validateDependents(name); });
        notifyDirty();
        return;
      }
      targets.forEach((name) => {
        invalidateValidationPath(name);
        const targetPath = normalizeNamePath(name);
        listConfigs.forEach((config, listKeyValue) => {
          if (!isSameOrAncestorPath(targetPath, config.path) && !isSameOrAncestorPath(config.path, targetPath)) return;
          listErrors.delete(listKeyValue); listRowErrors.delete(listKeyValue);
          listValidationVersions.set(listKeyValue, (listValidationVersions.get(listKeyValue) ?? 0) + 1);
        });
        [...errorPaths].forEach(([errorKey, errorPath]) => {
          if (!isSameOrAncestorPath(targetPath, errorPath)) return;
          errors.delete(errorKey); errorPaths.delete(errorKey); errorSources.delete(errorKey);
        });
        const initial = getValueAtPath(initialValues, name);
        values = initial === undefined ? unsetValueAtPath(values, name) : setValueAtPath(values, name, initial);
        listPaths.forEach((listPath, listKeyValue) => {
          if (!isSameOrAncestorPath(targetPath, listPath)) return;
          const listValue = getValueAtPath(values, listPath);
          lists.set(listKeyValue, Array.from({ length: Array.isArray(listValue) ? listValue.length : 0 }, nextListKey));
        });
        const key = encodeNamePath(name); errors.delete(key); errorPaths.delete(key); errorSources.delete(key); notify(name); validateDependents(name);
      });
      notifyDirty();
    },
    isFieldsDirty: (names) => isDirty(names),
    markFieldsClean: (names) => {
      if (!names?.length) cleanValues = structuredClone(values);
      else names.forEach((name) => {
        const current = getValueAtPath(values, name);
        cleanValues = current === undefined ? unsetValueAtPath(cleanValues, name) : setValueAtPath(cleanValues, name, structuredClone(current));
      });
      notifyDirty();
    },
    scrollToField: (name) => {
      const targetPath = normalizeNamePath(name);
      const node = nodes.get(encodeNamePath(name)) ?? [...nodes].find(([key]) => {
        const field = fields.get(key) ?? retainedFields.get(key);
        return field ? isSameOrAncestorPath(targetPath, field.path) : false;
      })?.[1];
      if (!node) return;
      node.scrollIntoView?.({ behavior: "smooth", block: "center" });
      node.querySelector<HTMLElement>("input, textarea, select, button, [tabindex]:not([tabindex='-1'])")?.focus();
    },
    submit: () => formNode?.requestSubmit(),
  };
  const store: FormStore = {
    instance,
    initialize: (initial) => { if (!initialized) { initialized = true; initialValues = structuredClone(initial ?? {}); values = structuredClone(initialValues); cleanValues = structuredClone(initialValues); lastDirty = false; } },
    setCallbacks: (next) => { callbacks = next; },
    setDefaultPreserve: (value) => { defaultPreserve = value; },
    subscribe: (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
    subscribePath: (name, listener) => { const path = normalizeNamePath(name); const entry = { path, value: getValueAtPath(values, path), listener }; pathListeners.add(entry); return () => pathListeners.delete(entry); },
    subscribeDirty: (listener) => { dirtyListeners.add(listener); return () => dirtyListeners.delete(listener); },
    subscribeField: (name, listener) => { const entry = { path: normalizeNamePath(name), listener }; fieldListeners.add(entry); return () => fieldListeners.delete(entry); },
    markValuesClean: (nextValues) => {
      valueEntries(nextValues).forEach(([path, value]) => {
        cleanValues = value === undefined
          ? unsetValueAtPath(cleanValues, path)
          : setValueAtPath(cleanValues, path, structuredClone(value));
      });
      notifyDirty();
    },
    registerField: (name, config) => {
      const path = normalizeNamePath(name); const key = encodeNamePath(path);
      const state = { ...config, path }; fields.set(key, state); retained.delete(key); retainedFields.delete(key);
      rebuildDependencyIndex();
      if (getValueAtPath(values, path) === undefined) {
        values = setValueAtPath(values, path, "");
        if (getValueAtPath(cleanValues, path) === undefined) cleanValues = setValueAtPath(cleanValues, path, "");
      }
      return () => {
        const currentPath = state.path;
        const currentKey = encodeNamePath(currentPath);
        if (currentKey !== key) return;
        if (fields.get(currentKey) !== state) return;
        nextValidationVersion(currentKey); validating.delete(currentKey);
        fields.delete(currentKey); nodes.delete(currentKey); rebuildDependencyIndex();
        if (state.preserve ?? defaultPreserve) { retained.set(currentKey, currentPath); retainedFields.set(currentKey, state); }
        else { clearPathState(currentPath); notify(currentPath); }
      };
    },
    updateFieldConfig: (name, config) => {
      const field = fields.get(encodeNamePath(name));
      if (field) { Object.assign(field, config); rebuildDependencyIndex(); }
    },
    setFieldValueFromControl: (name, value) => setValue(name, value, true),
    setFormNode: (node) => { formNode = node; },
    requestValidatedSubmit: () => {
      if (!formNode) return;
      validatedSubmitPending = true;
      formNode.requestSubmit();
    },
    consumeValidatedSubmit: () => {
      const pending = validatedSubmitPending;
      validatedSubmitPending = false;
      return pending;
    },
    setFieldNode: (name, node) => { const key = encodeNamePath(name); if (node) nodes.set(key, node); else nodes.delete(key); },
    validateField: async (name, cancelOnStale = false) => {
      const key = encodeNamePath(name); const field = fields.get(key) ?? retainedFields.get(key); if (!field) return [];
      const version = nextValidationVersion(key);
      const isLatest = () => validationVersions.get(key) === version && (fields.get(key) ?? retainedFields.get(key)) === field;
      const value = getValueAtPath(values, name); const nextErrors: string[] = [];
      for (const rule of field.rules) {
        let failed = false;
        if (rule.required && (value == null || value === "" || (Array.isArray(value) && !value.length))) failed = true;
        else if (typeof value === "string" && rule.length !== undefined && value.length !== rule.length) failed = true;
        else if (typeof value === "string" && rule.min !== undefined && value.length < rule.min) failed = true;
        else if (typeof value === "string" && rule.max !== undefined && value.length > rule.max) failed = true;
        else if (typeof value === "string" && rule.pattern && !rule.pattern.test(value)) failed = true;
        if (!failed && rule.validator) try {
          let result = rule.validator(value, values);
          if (result && typeof result === "object" && "then" in result && typeof result.then === "function") {
            validating.add(key); notify(name);
            try { result = await result; }
            finally { if (isLatest()) { validating.delete(key); notify(name); } }
          }
          if (!isLatest()) {
            if (cancelOnStale) throw validationCancelled;
            return [];
          }
          if (isRuleFailure(result)) {
            if (result.type === "network") {
              const exception: FormValidationException = { name: publicNamePath(name), type: "network", message: result.message, cause: result.cause };
              callbacks.onValidationException?.(exception);
              throw exception;
            }
            nextErrors.push(result.message); break;
          }
        } catch (error) {
          if (!isLatest()) {
            if (cancelOnStale) throw validationCancelled;
            return [];
          }
          if (isRuleFailure(error) && error.type === "network") {
            if (!("name" in error)) callbacks.onValidationException?.({ name: publicNamePath(name), type: "network", message: error.message, cause: error.cause });
            throw error;
          }
          nextErrors.push(error instanceof Error ? error.message : rule.message ?? String(error)); break;
        }
        if (failed) { nextErrors.push(rule.message ?? "该字段校验失败"); break; }
      }
      if (!isLatest()) {
        if (cancelOnStale) throw validationCancelled;
        return [];
      }
      errors.set(key, nextErrors);
      if (nextErrors.length) { errorSources.set(key, "client"); errorPaths.set(key, normalizeNamePath(name)); }
      else { errorSources.delete(key); errorPaths.delete(key); }
      notify(name); return nextErrors;
    },
    getFieldErrors: (name) => errors.get(encodeNamePath(name)) ?? [],
    isFieldValidating: (name) => validating.has(encodeNamePath(name)),
    getListKeys: (name) => [...(lists.get(encodeNamePath(name)) ?? [])],
    initializeList: (name, initialValue) => {
      const key = encodeNamePath(name); let value = getValueAtPath(values, name);
      if (value === undefined && initialValue) { values = setValueAtPath(values, name, initialValue); cleanValues = setValueAtPath(cleanValues, name, structuredClone(initialValue)); value = initialValue; }
      if (!lists.has(key)) lists.set(key, Array.from({ length: Array.isArray(value) ? value.length : 0 }, nextListKey));
      listPaths.set(key, normalizeNamePath(name));
      retained.set(key, normalizeNamePath(name));
    },
    registerList: (name, config) => {
      assertListLimits(config.min, config.max);
      const path = normalizeNamePath(name); const key = encodeNamePath(path); const state = { ...config, path };
      listConfigs.set(key, state);
      return () => { if (listConfigs.get(key) === state) listConfigs.delete(key); };
    },
    updateListConfig: (name, config) => {
      assertListLimits(config.min, config.max);
      const path = normalizeNamePath(name); const key = encodeNamePath(path); const current = listConfigs.get(key);
      if (current) Object.assign(current, config);
      else listConfigs.set(key, { ...config, path });
    },
    validateList: async (name, cancelOnStale = false) => {
      const key = encodeNamePath(name); const config = listConfigs.get(key);
      if (!config) return { errors: [], rowErrors: [] };
      const version = (listValidationVersions.get(key) ?? 0) + 1; listValidationVersions.set(key, version);
      const isLatest = () => listValidationVersions.get(key) === version && listConfigs.get(key) === config;
      const value = getValueAtPath(values, name); const rows = Array.isArray(value) ? value : [];
      const keys = [...(lists.get(key) ?? [])]; const nextErrors: string[] = [];
      if (config.min !== undefined && rows.length < config.min) nextErrors.push(`至少需要 ${config.min} 项`);
      if (config.max !== undefined && rows.length > config.max) nextErrors.push(`最多允许 ${config.max} 项`);
      for (const rule of config.rules) {
        if (!rule.validator) continue;
        try {
          const result = await rule.validator(rows, values);
          if (!isLatest()) { if (cancelOnStale) throw validationCancelled; return { errors: [], rowErrors: [] }; }
          if (isRuleFailure(result)) {
            if (result.type === "network") { const exception: FormValidationException = { name: publicNamePath(name), type: "network", message: result.message, cause: result.cause }; callbacks.onValidationException?.(exception); throw exception; }
            nextErrors.push(result.message);
          }
        } catch (error) {
          if (!isLatest()) { if (cancelOnStale) throw validationCancelled; return { errors: [], rowErrors: [] }; }
          if (isRuleFailure(error) && error.type === "network") throw error;
          nextErrors.push(error instanceof Error ? error.message : rule.message ?? String(error));
        }
      }
      const nextRowErrors = new Map<string, string[]>();
      for (let index = 0; index < rows.length; index += 1) {
        const rowKey = keys[index]; if (!rowKey) continue; const currentErrors: string[] = [];
        for (const rule of config.rowRules) {
          try {
            const result = await rule(rows[index], index, values);
            if (!isLatest() || lists.get(key)?.[index] !== rowKey) { if (cancelOnStale) throw validationCancelled; return { errors: [], rowErrors: [] }; }
            if (isRuleFailure(result)) {
              if (result.type === "network") { const exception: FormValidationException = { name: [...config.path, index], type: "network", message: result.message, cause: result.cause }; callbacks.onValidationException?.(exception); throw exception; }
              currentErrors.push(result.message);
            }
          } catch (error) {
            if (!isLatest()) { if (cancelOnStale) throw validationCancelled; return { errors: [], rowErrors: [] }; }
            if (isRuleFailure(error) && error.type === "network") throw error;
            currentErrors.push(error instanceof Error ? error.message : String(error));
          }
        }
        if (currentErrors.length) nextRowErrors.set(rowKey, currentErrors);
      }
      if (!isLatest()) { if (cancelOnStale) throw validationCancelled; return { errors: [], rowErrors: [] }; }
      listErrors.set(key, nextErrors); listRowErrors.set(key, nextRowErrors); notify(name);
      return { errors: [...nextErrors], rowErrors: keys.map((rowKey, index) => ({ index, errors: [...(nextRowErrors.get(rowKey) ?? [])] })) };
    },
    getListErrors: (name) => [...(listErrors.get(encodeNamePath(name)) ?? [])],
    getListRowErrors: (name, rowKey) => [...(listRowErrors.get(encodeNamePath(name))?.get(rowKey) ?? [])],
    canAddListValues: (name, count = 1) => {
      if (!Number.isSafeInteger(count) || count < 0) throw new Error("Form.List count 必须是非负安全整数。");
      const current = getValueAtPath(values, name); const length = Array.isArray(current) ? current.length : 0;
      const max = listConfigs.get(encodeNamePath(name))?.max;
      return max === undefined || length + count <= max;
    },
    canRemoveListValues: (name, index) => {
      const current = getValueAtPath(values, name); const length = Array.isArray(current) ? current.length : 0;
      const indexes = validRemovalIndexes(length, index); const min = listConfigs.get(encodeNamePath(name))?.min;
      return min === undefined || length - indexes.length >= min;
    },
    addListValues: (name, nextValues, index) => {
      if (!nextValues.length || !store.canAddListValues(name, nextValues.length)) return;
      const current = [...((getValueAtPath(values, name) as unknown[]) ?? [])]; const at = Math.max(0, Math.min(index ?? current.length, current.length)); current.splice(at, 0, ...nextValues);
      const key = encodeNamePath(name); const keys = [...(lists.get(key) ?? [])]; keys.splice(at, 0, ...nextValues.map(() => nextListKey())); lists.set(key, keys);
      remapListState(name, (oldIndex) => oldIndex >= at ? oldIndex + 1 : oldIndex); setValue(name, current, true);
    },
    addListValue: (name, value = {}, index) => store.addListValues(name, [value], index),
    removeListValue: (name, index) => {
      const current = [...((getValueAtPath(values, name) as unknown[]) ?? [])]; const indexes = validRemovalIndexes(current.length, index);
      if (!indexes.length || !store.canRemoveListValues(name, indexes)) return; const key = encodeNamePath(name); const keys = [...(lists.get(key) ?? [])]; const removedKeys = indexes.map((item) => keys[item]).filter((item): item is string => Boolean(item)); indexes.forEach((item) => { current.splice(item, 1); keys.splice(item, 1); }); lists.set(key, keys);
      removedKeys.forEach((rowKey) => listRowErrors.get(key)?.delete(rowKey));
      const removed = new Set(indexes); remapListState(name, (oldIndex) => removed.has(oldIndex) ? undefined : oldIndex - indexes.filter((item) => item < oldIndex).length); setValue(name, current, true);
    },
    moveListValue: (name, from, to) => {
      const current = [...((getValueAtPath(values, name) as unknown[]) ?? [])]; if (from < 0 || to < 0 || from >= current.length || to >= current.length || from === to) return;
      const key = encodeNamePath(name); const keys = [...(lists.get(key) ?? [])]; const [item] = current.splice(from, 1); current.splice(to, 0, item); const [itemKey] = keys.splice(from, 1); keys.splice(to, 0, itemKey); lists.set(key, keys);
      remapListState(name, (oldIndex) => {
        if (oldIndex === from) return to;
        if (from < to && oldIndex > from && oldIndex <= to) return oldIndex - 1;
        if (to < from && oldIndex >= to && oldIndex < from) return oldIndex + 1;
        return oldIndex;
      }); setValue(name, current, true);
    },
  };
  stores.set(instance, store);
  return store;
}

export const getFormStore = (form: FormInstance) => stores.get(form);
