import { Children, cloneElement, createContext, forwardRef, isValidElement, useContext, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { ChangeEvent, FocusEvent, ReactElement } from "react";
import type { FormComponent, FormErrorField, FormErrorListProps, FormInstance, FormItemProps, FormListProps, FormListRowRule, FormListRule, FormNamePath, FormProps, FormStepsOptions, FormValidationException, FormValues } from "./Form.types";
import { createFormStore, getFormStore, isValidationCancelled, type FormStore } from "./formStore";
import { isSameOrAncestorPath } from "./formPath";
import { useDraft } from "./formDraft";
import { useBulkEdit } from "./formBulkEdit";
import "./form.css";

const joinClassNames = (...names: Array<string | undefined>) => names.filter(Boolean).join(" ");
type FieldControlProps = { value?: unknown; onChange?: (...args: unknown[]) => void; onBlur?: (event: FocusEvent<HTMLElement>) => void; status?: string; "aria-invalid"?: boolean; "aria-describedby"?: string; "aria-label"?: string; "aria-labelledby"?: string };
const FormContext = createContext<FormStore | null>(null);
const emptyListRules: FormListRule[] = [];
const emptyRowRules: FormListRowRule[] = [];
const valueFromChange = (first: unknown) => first && typeof first === "object" && "target" in first ? (first as ChangeEvent<HTMLInputElement>).target.value : first;

function useForm(): [FormInstance] { const storeRef = useRef<FormStore | null>(null); if (!storeRef.current) storeRef.current = createFormStore(); return [storeRef.current.instance]; }
function useWatch(name: FormNamePath, form?: FormInstance): unknown {
  const contextStore = useContext(FormContext); const store = form ? getFormStore(form) : contextStore;
  if (!store) throw new Error("Form.useWatch 必须在 Form 内使用或传入 form 实例。");
  return useSyncExternalStore((listener) => store.subscribePath(name, listener), () => store.instance.getFieldValue(name), () => store.instance.getFieldValue(name));
}
function useDirty(form?: FormInstance): boolean {
  const contextStore = useContext(FormContext); const store = form ? getFormStore(form) : contextStore;
  if (!store) throw new Error("Form.useDirty 必须在 Form 内使用或传入 form 实例。");
  return useSyncExternalStore((listener) => store.subscribeDirty(listener), () => store.instance.isFieldsDirty(), () => store.instance.isFieldsDirty());
}
function useSteps({ form, steps, initialStep = 1, current, onCurrentChange }: FormStepsOptions) {
  const safeStep = (step: number) => Math.min(Math.max(1, Math.floor(step)), Math.max(1, steps.length));
  const [internalCurrent, setInternalCurrent] = useState(() => safeStep(initialStep));
  const activeCurrent = current === undefined ? internalCurrent : safeStep(current);
  const pendingFocusRef = useRef<FormNamePath | undefined>(undefined);
  const navigationRequestRef = useRef(0);
  useEffect(() => {
    if (pendingFocusRef.current === undefined) return;
    const field = pendingFocusRef.current;
    pendingFocusRef.current = undefined;
    form.scrollToField(field);
  }, [activeCurrent, form]);
  const changeCurrent = (step: number) => {
    const target = safeStep(step);
    if (target === activeCurrent) return;
    if (current === undefined) setInternalCurrent(target);
    onCurrentChange?.(target);
  };
  const focusFirstError = (error: unknown) => {
    const firstError = (error as { errorFields?: FormErrorField[] }).errorFields?.[0];
    if (firstError) form.scrollToField(firstError.name);
    return false;
  };
  const validateCurrent = async () => {
    const request = ++navigationRequestRef.current;
    const fields = steps[activeCurrent - 1]?.fields ?? [];
    try { await form.validateFields([...fields]); return request === navigationRequestRef.current; }
    catch (error) { return focusFirstError(error); }
  };
  const goTo = async (step: number) => {
    const target = safeStep(step);
    if (target === activeCurrent) return true;
    if (target > activeCurrent && !await validateCurrent()) return false;
    changeCurrent(target);
    return true;
  };
  const submit = async () => {
    const request = ++navigationRequestRef.current;
    try {
      await form.validateFields();
      if (request !== navigationRequestRef.current) return false;
      getFormStore(form)?.requestValidatedSubmit();
      return true;
    }
    catch (error) {
      const firstError = (error as { errorFields?: FormErrorField[] }).errorFields?.[0];
      if (firstError) {
        const errorStep = steps.findIndex((item) => item.fields.some((field) => isSameOrAncestorPath(field, firstError.name)));
        if (errorStep >= 0 && errorStep + 1 !== activeCurrent) {
          pendingFocusRef.current = firstError.name;
          changeCurrent(errorStep + 1);
        } else form.scrollToField(firstError.name);
      }
      return false;
    }
  };
  return {
    current: activeCurrent,
    step: steps[activeCurrent - 1],
    total: steps.length,
    isFirst: activeCurrent <= 1,
    isLast: activeCurrent >= steps.length,
    next: () => goTo(activeCurrent + 1),
    previous: () => changeCurrent(activeCurrent - 1),
    goTo,
    submit,
  };
}

const FormRoot = forwardRef<HTMLFormElement, FormProps>(function Form({ layout = "vertical", form, initialValues, onValuesChange, onFinish, onFinishFailed, onValidationException, scrollToFirstError = false, preserve = true, className, children, ...formProps }, ref) {
  const [internalForm] = useForm(); const activeForm = form ?? internalForm; const store = getFormStore(activeForm);
  if (!store) throw new Error("Form 收到了无效的 form 实例。");
  store.initialize(initialValues); store.setCallbacks({ onValuesChange, onValidationException }); store.setDefaultPreserve(preserve);
  const submittingRef = useRef(false);
  return <FormContext.Provider value={store}><form {...formProps} ref={(node) => { store.setFormNode(node); if (typeof ref === "function") ref(node); else if (ref) ref.current = node; }} className={joinClassNames("qizhi-form", `qizhi-form-layout-${layout}`, className)} onSubmit={async (event) => {
    event.preventDefault(); const validatedSubmit = store.consumeValidatedSubmit(); if (submittingRef.current) return; submittingRef.current = true;
    try { try { const values = validatedSubmit ? activeForm.getFieldsValue() : await activeForm.validateFields(); await onFinish?.(values); } catch (error) { if (isValidationCancelled(error)) return; const result = error as { values?: FormValues; errorFields?: FormErrorField[] }; if (!result.errorFields || !result.values) { if ((error as FormValidationException)?.type === "network") return; throw error; } onFinishFailed?.({ values: result.values, errorFields: result.errorFields }); if (scrollToFirstError && result.errorFields[0]) activeForm.scrollToField(result.errorFields[0].name); } } finally { submittingRef.current = false; }
  }}>{children}</form></FormContext.Provider>;
});

function FormItem({ name, label, required = false, extra, rules = [], validateTrigger = "onChange", validateStatus, help, dependencies, preserve, children, className, style }: FormItemProps) {
  const store = useContext(FormContext); const [, setVersion] = useState(0);
  const labelId = useId(); const helpId = useId(); const nameKey = name === undefined ? "" : JSON.stringify(name); const dependencyKey = JSON.stringify(dependencies ?? []);
  useEffect(() => name !== undefined && store ? store.subscribeField(name, () => setVersion((value) => value + 1)) : undefined, [nameKey, store]);
  useEffect(() => name !== undefined && store ? store.registerField(name, { rules, validateTrigger, dependencies, preserve }) : undefined, [nameKey, store]);
  useEffect(() => { if (name !== undefined && store) store.updateFieldConfig(name, { rules, validateTrigger, dependencies, preserve }); }, [nameKey, dependencyKey, preserve, rules, store, validateTrigger]);
  const fieldErrors = name !== undefined && store ? store.getFieldErrors(name) : [];
  const effectiveStatus = validateStatus ?? (fieldErrors.length ? "error" : name !== undefined && store?.isFieldValidating(name) ? "validating" : "default");
  const feedback = help ?? fieldErrors[0]; const child = name !== undefined && store ? Children.only(children) : children; let control = child;
  if (name !== undefined && store && isValidElement<FieldControlProps>(child)) {
    const originalProps = child.props; const nextProps: FieldControlProps = { value: store.instance.getFieldValue(name) ?? "", onChange: (...args) => { store.setFieldValueFromControl(name, valueFromChange(args[0])); originalProps.onChange?.(...args); }, onBlur: (event) => { if (validateTrigger === "onBlur") void store.validateField(name); originalProps.onBlur?.(event); }, "aria-invalid": effectiveStatus === "error" || undefined, "aria-describedby": feedback === undefined ? originalProps["aria-describedby"] : [originalProps["aria-describedby"], helpId].filter(Boolean).join(" ") };
    if (typeof child.type !== "string") nextProps.status = effectiveStatus === "error" || effectiveStatus === "warning" ? effectiveStatus : undefined;
    if (!originalProps["aria-label"] && !originalProps["aria-labelledby"] && label !== undefined) nextProps["aria-labelledby"] = labelId;
    control = cloneElement(child as ReactElement<FieldControlProps>, nextProps);
  }
  return <div className={joinClassNames("qizhi-form-item", effectiveStatus !== "default" ? `qizhi-form-item--${effectiveStatus}` : undefined, className)} style={style} ref={(node) => { if (name !== undefined && store) store.setFieldNode(name, node); }} role="group" aria-labelledby={label === undefined ? undefined : labelId} aria-required={required || undefined}>
    {label === undefined ? null : <div id={labelId} className="qizhi-form-item-label">{required ? <span className="qizhi-form-item-required-mark" aria-hidden="true">*</span> : null}{label}</div>}
    <div className="qizhi-form-item-control">{control}{feedback === undefined ? null : <div id={helpId} className="qizhi-form-item-help" role={effectiveStatus === "error" ? "alert" : undefined}>{feedback}</div>}{extra === undefined ? null : <div className="qizhi-form-item-extra">{extra}</div>}</div>
  </div>;
}

function FormList({ name, initialValue, min, max, rules = emptyListRules, rowRules = emptyRowRules, children }: FormListProps) {
  const store = useContext(FormContext); if (!store) throw new Error("Form.List 必须在 Form 内使用。");
  const nameKey = JSON.stringify(name); store.initializeList(name, initialValue); store.updateListConfig(name, { min, max, rules, rowRules });
  const [, setVersion] = useState(0);
  useEffect(() => store.registerList(name, { min, max, rules, rowRules }), [nameKey, store]);
  useEffect(() => store.subscribeField(name, () => setVersion((value) => value + 1)), [nameKey, store]);
  useEffect(() => { void store.validateList(name); }, [nameKey, max, min, rowRules, rules, store]);
  useSyncExternalStore((listener) => store.subscribePath(name, listener), () => store.instance.getFieldValue(name), () => store.instance.getFieldValue(name));
  const keys = store.getListKeys(name); const operations = useMemo(() => ({
    add: (value?: unknown, index?: number) => store.addListValue(name, value, index),
    addMany: (values: readonly unknown[], index?: number) => store.addListValues(name, values, index),
    remove: (index: number | readonly number[]) => store.removeListValue(name, typeof index === "number" ? index : [...index]),
    move: (from: number, to: number) => store.moveListValue(name, from, to),
    canAdd: (count?: number) => store.canAddListValues(name, count),
    canRemove: (index: number | readonly number[]) => store.canRemoveListValues(name, index),
  }), [nameKey, store]);
  return children(keys.map((key, index) => ({ key, name: index, errors: store.getListRowErrors(name, key) })), operations, { errors: store.getListErrors(name) });
}

function FormErrorList({ errors = [], className, style }: FormErrorListProps) {
  if (!errors.length) return null;
  return <div className={joinClassNames("qizhi-form-error-list", className)} style={style} role="alert">
    {errors.map((error, index) => <div key={index}>{error}</div>)}
  </div>;
}

export const Form = Object.assign(FormRoot, { Item: FormItem, List: FormList, ErrorList: FormErrorList, useForm, useWatch, useDirty, useSteps, useDraft, useBulkEdit }) as FormComponent;
