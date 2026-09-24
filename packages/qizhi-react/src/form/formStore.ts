import type { FormErrorField, FormInstance, FormNamePath, FormNameSegment, FormProps, FormRule, FormValidateTrigger, FormValues } from "./Form.types";
import { buildValueAtPath, encodeNamePath, getValueAtPath, isSameOrAncestorPath, normalizeNamePath, setValueAtPath, unsetValueAtPath } from "./formPath";

type FieldConfig = { rules: FormRule[]; validateTrigger: FormValidateTrigger; dependencies?: FormNamePath[]; preserve?: boolean };
type FieldState = FieldConfig & { path: FormNameSegment[] };

export interface FormStore {
  instance: FormInstance;
  initialize(values?: FormValues): void;
  setCallbacks(callbacks: Pick<FormProps, "onValuesChange">): void;
  setDefaultPreserve(value: boolean): void;
  subscribe(listener: () => void): () => void;
  subscribePath(name: FormNamePath, listener: () => void): () => void;
  subscribeField(name: FormNamePath, listener: () => void): () => void;
  registerField(name: FormNamePath, config: FieldConfig): () => void;
  updateFieldConfig(name: FormNamePath, config: FieldConfig): void;
  setFieldValueFromControl(name: FormNamePath, value: unknown): void;
  setFormNode(node: HTMLFormElement | null): void;
  setFieldNode(name: FormNamePath, node: HTMLDivElement | null): void;
  validateField(name: FormNamePath): Promise<string[]>;
  getFieldErrors(name: FormNamePath): string[];
  isFieldValidating(name: FormNamePath): boolean;
  getListKeys(name: FormNamePath): string[];
  initializeList(name: FormNamePath, initialValue?: unknown[]): void;
  addListValue(name: FormNamePath, value?: unknown, index?: number): void;
  removeListValue(name: FormNamePath, index: number | number[]): void;
  moveListValue(name: FormNamePath, from: number, to: number): void;
}

const stores = new WeakMap<FormInstance, FormStore>();
let listKey = 0;
const nextListKey = () => `qizhi-form-list-${++listKey}`;

const leafEntries = (value: unknown, path: FormNameSegment[] = []): Array<[FormNameSegment[], unknown]> => {
  if (Array.isArray(value)) return value.flatMap((item, index) => leafEntries(item, [...path, index]));
  if (value && typeof value === "object") {
    const entries = Object.entries(value as FormValues);
    return entries.length ? entries.flatMap(([key, item]) => leafEntries(item, [...path, key])) : [[path, value]];
  }
  return [[path, value]];
};

export function createFormStore(): FormStore {
  let initialized = false;
  let initialValues: FormValues = {};
  let values: FormValues = {};
  let callbacks: Pick<FormProps, "onValuesChange"> = {};
  let defaultPreserve = true;
  let formNode: HTMLFormElement | null = null;
  const fields = new Map<string, FieldState>();
  const retained = new Map<string, FormNameSegment[]>();
  const errors = new Map<string, string[]>();
  const errorPaths = new Map<string, FormNameSegment[]>();
  const errorSources = new Map<string, "client" | "server">();
  const validating = new Set<string>();
  const nodes = new Map<string, HTMLDivElement>();
  const listeners = new Set<() => void>();
  const pathListeners = new Set<{ path: FormNameSegment[]; value: unknown; listener: () => void }>();
  const fieldListeners = new Set<{ path: FormNameSegment[]; listener: () => void }>();
  const lists = new Map<string, string[]>();
  const listPaths = new Map<string, FormNameSegment[]>();
  const dependencyIndex = new Map<string, { path: FormNameSegment[]; dependents: Set<string> }>();

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
    const fieldPaths = new Map([...fields].map(([key, field]) => [key, field.path]));
    const knownPaths = new Map<string, FormNameSegment[]>([...retained, ...errorPaths, ...listPaths, ...fieldPaths]);
    const statePath = (key: string) => knownPaths.get(key);
    const isDescendant = (candidate?: FormNameSegment[]) => Boolean(candidate && isSameOrAncestorPath(path, candidate));
    values = unsetValueAtPath(values, path);
    [...fields].forEach(([key, field]) => { if (isDescendant(field.path)) fields.delete(key); });
    [...retained].forEach(([key, candidate]) => { if (isDescendant(candidate)) retained.delete(key); });
    [...errors].forEach(([key]) => { if (isDescendant(statePath(key))) errors.delete(key); });
    [...errorPaths].forEach(([key, candidate]) => { if (isDescendant(candidate)) errorPaths.delete(key); });
    [...errorSources].forEach(([key]) => { if (isDescendant(statePath(key))) errorSources.delete(key); });
    [...validating].forEach((key) => { if (isDescendant(statePath(key))) validating.delete(key); });
    [...nodes].forEach(([key]) => { if (isDescendant(statePath(key))) nodes.delete(key); });
    [...lists].forEach(([key]) => { if (isDescendant(listPaths.get(key))) lists.delete(key); });
    [...listPaths].forEach(([key, candidate]) => { if (isDescendant(candidate)) listPaths.delete(key); });
    rebuildDependencyIndex();
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
    dependentKeys.forEach((key) => { const field = fields.get(key); if (field) void store.validateField(field.path); });
  };
  const setValue = (name: FormNamePath, value: unknown, user: boolean) => {
    const previous = getValueAtPath(values, name);
    if (Object.is(previous, value)) return;
    values = setValueAtPath(values, name, value);
    const key = encodeNamePath(name);
    if (errorSources.get(key) === "server") { errors.delete(key); errorPaths.delete(key); errorSources.delete(key); }
    if (user) callbacks.onValuesChange?.(buildValueAtPath(name, value), registeredValues());
    notify(name);
    if (fields.get(key)?.validateTrigger === "onChange" && user) void store.validateField(name);
    validateDependents(name);
  };
  const instance: FormInstance = {
    getFieldsValue: registeredValues,
    getFieldValue: (name) => getValueAtPath(values, name),
    setFieldsValue: (nextValues) => {
      leafEntries(nextValues).forEach(([path, value]) => {
        values = setValueAtPath(values, path, value);
        const key = encodeNamePath(path); errors.delete(key); errorPaths.delete(key); errorSources.delete(key);
        notify(path); validateDependents(path);
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
    validateFields: async () => {
      const errorFields: FormErrorField[] = [];
      for (const field of fields.values()) {
        const fieldErrors = await store.validateField(field.path);
        if (fieldErrors.length) errorFields.push({ name: field.path.length === 1 && typeof field.path[0] === "string" ? field.path[0] : field.path, errors: fieldErrors });
      }
      const result = registeredValues();
      if (errorFields.length) throw { values: result, errorFields };
      return result;
    },
    resetFields: (names) => {
      const targets = names ?? [...fields.values()].map((field) => field.path).concat([...retained.values()]);
      targets.forEach((name) => {
        const initial = getValueAtPath(initialValues, name);
        values = initial === undefined ? unsetValueAtPath(values, name) : setValueAtPath(values, name, initial);
        const key = encodeNamePath(name); errors.delete(key); errorPaths.delete(key); errorSources.delete(key); notify(name); validateDependents(name);
      });
    },
    scrollToField: (name) => {
      const node = nodes.get(encodeNamePath(name)); if (!node) return;
      node.scrollIntoView?.({ behavior: "smooth", block: "center" });
      node.querySelector<HTMLElement>("input, textarea, select, button, [tabindex]:not([tabindex='-1'])")?.focus();
    },
    submit: () => formNode?.requestSubmit(),
  };
  const store: FormStore = {
    instance,
    initialize: (initial) => { if (!initialized) { initialized = true; initialValues = structuredClone(initial ?? {}); values = structuredClone(initialValues); } },
    setCallbacks: (next) => { callbacks = next; },
    setDefaultPreserve: (value) => { defaultPreserve = value; },
    subscribe: (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
    subscribePath: (name, listener) => { const path = normalizeNamePath(name); const entry = { path, value: getValueAtPath(values, path), listener }; pathListeners.add(entry); return () => pathListeners.delete(entry); },
    subscribeField: (name, listener) => { const entry = { path: normalizeNamePath(name), listener }; fieldListeners.add(entry); return () => fieldListeners.delete(entry); },
    registerField: (name, config) => {
      const path = normalizeNamePath(name); const key = encodeNamePath(path);
      const state = { ...config, path }; fields.set(key, state); retained.delete(key);
      rebuildDependencyIndex();
      if (getValueAtPath(values, path) === undefined) values = setValueAtPath(values, path, "");
      return () => {
        const currentPath = state.path;
        const currentKey = encodeNamePath(currentPath);
        if (currentKey !== key) return;
        if (fields.get(currentKey) !== state) return;
        fields.delete(currentKey); nodes.delete(currentKey); rebuildDependencyIndex();
        if (state.preserve ?? defaultPreserve) retained.set(currentKey, currentPath);
        else { clearPathState(currentPath); notify(currentPath); }
      };
    },
    updateFieldConfig: (name, config) => {
      const field = fields.get(encodeNamePath(name));
      if (field) { Object.assign(field, config); rebuildDependencyIndex(); }
    },
    setFieldValueFromControl: (name, value) => setValue(name, value, true),
    setFormNode: (node) => { formNode = node; },
    setFieldNode: (name, node) => { const key = encodeNamePath(name); if (node) nodes.set(key, node); else nodes.delete(key); },
    validateField: async (name) => {
      const key = encodeNamePath(name); const field = fields.get(key); if (!field) return [];
      const value = getValueAtPath(values, name); const nextErrors: string[] = [];
      for (const rule of field.rules) {
        let failed = false;
        if (rule.required && (value == null || value === "" || (Array.isArray(value) && !value.length))) failed = true;
        else if (typeof value === "string" && rule.length !== undefined && value.length !== rule.length) failed = true;
        else if (typeof value === "string" && rule.min !== undefined && value.length < rule.min) failed = true;
        else if (typeof value === "string" && rule.max !== undefined && value.length > rule.max) failed = true;
        else if (typeof value === "string" && rule.pattern && !rule.pattern.test(value)) failed = true;
        if (!failed && rule.validator) try {
          const result = rule.validator(value, values);
          if (result && typeof result.then === "function") { validating.add(key); notify(name); try { await result; } finally { validating.delete(key); notify(name); } }
        } catch (error) { nextErrors.push(error instanceof Error ? error.message : rule.message ?? String(error)); break; }
        if (failed) { nextErrors.push(rule.message ?? "该字段校验失败"); break; }
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
      if (value === undefined && initialValue) { values = setValueAtPath(values, name, initialValue); value = initialValue; }
      if (!lists.has(key)) lists.set(key, Array.from({ length: Array.isArray(value) ? value.length : 0 }, nextListKey));
      listPaths.set(key, normalizeNamePath(name));
      retained.set(key, normalizeNamePath(name));
    },
    addListValue: (name, value = {}, index) => {
      const current = [...((getValueAtPath(values, name) as unknown[]) ?? [])]; const at = Math.max(0, Math.min(index ?? current.length, current.length)); current.splice(at, 0, value);
      const key = encodeNamePath(name); const keys = [...(lists.get(key) ?? [])]; keys.splice(at, 0, nextListKey()); lists.set(key, keys);
      remapListState(name, (oldIndex) => oldIndex >= at ? oldIndex + 1 : oldIndex); setValue(name, current, true);
    },
    removeListValue: (name, index) => {
      const current = [...((getValueAtPath(values, name) as unknown[]) ?? [])]; const indexes = [...new Set(Array.isArray(index) ? index : [index])].filter((item) => item >= 0 && item < current.length).sort((a, b) => b - a);
      if (!indexes.length) return; const key = encodeNamePath(name); const keys = [...(lists.get(key) ?? [])]; indexes.forEach((item) => { current.splice(item, 1); keys.splice(item, 1); }); lists.set(key, keys);
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
