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
  registerField(name: FormNamePath, config: FieldConfig): () => void;
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
  const errorSources = new Map<string, "client" | "server">();
  const validating = new Set<string>();
  const nodes = new Map<string, HTMLDivElement>();
  const listeners = new Set<() => void>();
  const pathListeners = new Set<{ path: FormNameSegment[]; listener: () => void }>();
  const lists = new Map<string, string[]>();

  const registeredValues = () => {
    let result: FormValues = {};
    const paths = [...fields.values()].map((field) => field.path).concat([...retained.values()]);
    paths.forEach((path) => { result = setValueAtPath(result, path, getValueAtPath(values, path)); });
    return result;
  };
  const notify = (changed?: FormNamePath) => {
    listeners.forEach((listener) => listener());
    if (changed) pathListeners.forEach((entry) => {
      if (isSameOrAncestorPath(entry.path, changed) || isSameOrAncestorPath(changed, entry.path)) entry.listener();
    });
  };
  const validateDependents = (changed: FormNamePath) => {
    fields.forEach((field) => {
      if (field.dependencies?.some((dependency) => isSameOrAncestorPath(dependency, changed) || isSameOrAncestorPath(changed, dependency))) void store.validateField(field.path);
    });
  };
  const setValue = (name: FormNamePath, value: unknown, user: boolean) => {
    const previous = getValueAtPath(values, name);
    if (Object.is(previous, value)) return;
    values = setValueAtPath(values, name, value);
    const key = encodeNamePath(name);
    if (errorSources.get(key) === "server") { errors.delete(key); errorSources.delete(key); }
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
        const key = encodeNamePath(path); errors.delete(key); errorSources.delete(key);
        notify(path); validateDependents(path);
      });
    },
    setFieldValue: (name, value) => setValue(name, value, false),
    getFieldError: (name) => [...(errors.get(encodeNamePath(name)) ?? [])],
    setFieldErrors: (name, nextErrors) => {
      const key = encodeNamePath(name); errors.set(key, [...nextErrors]);
      if (nextErrors.length) errorSources.set(key, "server"); else errorSources.delete(key);
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
        const key = encodeNamePath(name); errors.delete(key); errorSources.delete(key); notify(name); validateDependents(name);
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
    subscribePath: (name, listener) => { const entry = { path: normalizeNamePath(name), listener }; pathListeners.add(entry); return () => pathListeners.delete(entry); },
    registerField: (name, config) => {
      const path = normalizeNamePath(name); const key = encodeNamePath(path);
      fields.set(key, { ...config, path }); retained.delete(key);
      if (getValueAtPath(values, path) === undefined) values = setValueAtPath(values, path, "");
      return () => {
        fields.delete(key); nodes.delete(key);
        if (config.preserve ?? defaultPreserve) retained.set(key, path);
        else { retained.delete(key); values = unsetValueAtPath(values, path); errors.delete(key); errorSources.delete(key); validating.delete(key); notify(path); }
      };
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
      errors.set(key, nextErrors); if (nextErrors.length) errorSources.set(key, "client"); else errorSources.delete(key); notify(name); return nextErrors;
    },
    getFieldErrors: (name) => errors.get(encodeNamePath(name)) ?? [],
    isFieldValidating: (name) => validating.has(encodeNamePath(name)),
    getListKeys: (name) => [...(lists.get(encodeNamePath(name)) ?? [])],
    initializeList: (name, initialValue) => {
      const key = encodeNamePath(name); let value = getValueAtPath(values, name);
      if (value === undefined && initialValue) { values = setValueAtPath(values, name, initialValue); value = initialValue; }
      if (!lists.has(key)) lists.set(key, Array.from({ length: Array.isArray(value) ? value.length : 0 }, nextListKey));
    },
    addListValue: (name, value = {}, index) => {
      const current = [...((getValueAtPath(values, name) as unknown[]) ?? [])]; const at = Math.max(0, Math.min(index ?? current.length, current.length)); current.splice(at, 0, value);
      const key = encodeNamePath(name); const keys = [...(lists.get(key) ?? [])]; keys.splice(at, 0, nextListKey()); lists.set(key, keys); setValue(name, current, true);
    },
    removeListValue: (name, index) => {
      const current = [...((getValueAtPath(values, name) as unknown[]) ?? [])]; const indexes = [...new Set(Array.isArray(index) ? index : [index])].filter((item) => item >= 0 && item < current.length).sort((a, b) => b - a);
      if (!indexes.length) return; const key = encodeNamePath(name); const keys = [...(lists.get(key) ?? [])]; indexes.forEach((item) => { current.splice(item, 1); keys.splice(item, 1); }); lists.set(key, keys); setValue(name, current, true);
    },
    moveListValue: (name, from, to) => {
      const current = [...((getValueAtPath(values, name) as unknown[]) ?? [])]; if (from < 0 || to < 0 || from >= current.length || to >= current.length || from === to) return;
      const key = encodeNamePath(name); const keys = [...(lists.get(key) ?? [])]; const [item] = current.splice(from, 1); current.splice(to, 0, item); const [itemKey] = keys.splice(from, 1); keys.splice(to, 0, itemKey); lists.set(key, keys); setValue(name, current, true);
    },
  };
  stores.set(instance, store);
  return store;
}

export const getFormStore = (form: FormInstance) => stores.get(form);
