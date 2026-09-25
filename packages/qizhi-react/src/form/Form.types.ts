import type { CSSProperties, FormHTMLAttributes, ReactNode, Ref } from "react";

export type FormLayout = "vertical" | "horizontal";

export type FormValues = Record<string, unknown>;
export type FormNameSegment = string | number;
export type FormNamePath = string | readonly FormNameSegment[];
export type FormValidateTrigger = "onChange" | "onBlur";
export type FormValidateStatus = "default" | "validating" | "success" | "warning" | "error";

export interface FormRuleFailure {
  type: "field" | "network";
  message: string;
  cause?: unknown;
}

export interface FormValidationException {
  name: FormNamePath;
  type: "network";
  message: string;
  cause?: unknown;
}

export interface FormRule {
  required?: boolean;
  message?: string;
  min?: number;
  max?: number;
  length?: number;
  pattern?: RegExp;
  validator?: (value: unknown, values: FormValues) => void | FormRuleFailure | Promise<void | FormRuleFailure>;
}

export interface FormErrorField {
  name: FormNamePath;
  errors: string[];
}

export interface FormFailedResult {
  values: FormValues;
  errorFields: FormErrorField[];
}

export interface FormInstance {
  getFieldsValue: () => FormValues;
  getFieldValue: (name: FormNamePath) => unknown;
  setFieldsValue: (values: FormValues) => void;
  setFieldValue: (name: FormNamePath, value: unknown) => void;
  getFieldError: (name: FormNamePath) => string[];
  setFieldErrors: (name: FormNamePath, errors: string[]) => void;
  validateFields: () => Promise<FormValues>;
  resetFields: (names?: FormNamePath[]) => void;
  isFieldsDirty: (names?: FormNamePath[]) => boolean;
  markFieldsClean: (names?: FormNamePath[]) => void;
  scrollToField: (name: FormNamePath) => void;
  submit: () => void;
}

export interface FormProps extends Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
  layout?: FormLayout;
  form?: FormInstance;
  initialValues?: FormValues;
  onValuesChange?: (changedValues: FormValues, allValues: FormValues) => void;
  onFinish?: (values: FormValues) => void | Promise<void>;
  onFinishFailed?: (result: FormFailedResult) => void;
  onValidationException?: (exception: FormValidationException) => void;
  scrollToFirstError?: boolean;
  preserve?: boolean;
  ref?: Ref<HTMLFormElement>;
}

export interface FormItemProps {
  name?: FormNamePath;
  label?: ReactNode;
  required?: boolean;
  extra?: ReactNode;
  rules?: FormRule[];
  validateTrigger?: FormValidateTrigger;
  validateStatus?: FormValidateStatus;
  help?: ReactNode;
  dependencies?: FormNamePath[];
  preserve?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface FormListField { key: string; name: number }
export interface FormListOperations {
  add: (defaultValue?: unknown, insertIndex?: number) => void;
  remove: (index: number | number[]) => void;
  move: (from: number, to: number) => void;
}
export interface FormListProps {
  name: FormNamePath;
  initialValue?: unknown[];
  children: (fields: FormListField[], operations: FormListOperations) => ReactNode;
}

export type FormBulkEditKey = string | number;
export type FormBulkEditMode = "keep" | "set" | "clear";
export type FormBulkEditStatus = "ready" | "sourceChanged" | "complete";
export type FormBulkEditBlockedCode = "no-changes" | "no-targets" | "source-changed";

export interface FormBulkEditBlockedError extends Error {
  code: FormBulkEditBlockedCode;
}

export interface FormBulkEditOptions<TRecord, TKey extends FormBulkEditKey> {
  form: FormInstance;
  records: readonly TRecord[];
  getRowKey: (record: TRecord) => TKey;
  fields: readonly FormNamePath[];
  getFieldValue?: (record: TRecord, name: FormNamePath) => unknown;
  isEqual?: (left: unknown, right: unknown, name: FormNamePath) => boolean;
}

export interface FormBulkEditFieldState {
  name: FormNamePath;
  mixed: boolean;
  mode: FormBulkEditMode;
  initialValue: unknown;
}

export interface FormBulkEditPatch<TKey extends FormBulkEditKey> {
  targetKeys: readonly TKey[];
  values: FormValues;
  clearedFields: readonly FormNamePath[];
}

export interface FormBulkEditFailure<TKey extends FormBulkEditKey> {
  key: TKey;
  field?: FormNamePath;
  message: string;
}

export interface FormBulkEditResult<TKey extends FormBulkEditKey> {
  succeededKeys: readonly TKey[];
  failures: readonly FormBulkEditFailure<TKey>[];
}

export interface FormBulkEditController<TKey extends FormBulkEditKey> {
  getFieldState: (name: FormNamePath) => FormBulkEditFieldState;
  getFieldFailures: (name: FormNamePath) => readonly FormBulkEditFailure<TKey>[];
  clearField: (name: FormNamePath) => void;
  keepField: (name: FormNamePath) => void;
  validate: () => Promise<FormBulkEditPatch<TKey>>;
  applyResult: (result: FormBulkEditResult<TKey>) => void;
  rebase: () => void;
  reset: () => void;
  status: FormBulkEditStatus;
  failures: readonly FormBulkEditFailure<TKey>[];
  succeededKeys: readonly TKey[];
  remainingKeys: readonly TKey[];
  hasChanges: boolean;
}

export interface FormComponent {
  (props: FormProps): ReactNode;
  Item: (props: FormItemProps) => ReactNode;
  List: (props: FormListProps) => ReactNode;
  useForm: () => [FormInstance];
  useWatch: (name: FormNamePath, form?: FormInstance) => unknown;
  useDirty: (form?: FormInstance) => boolean;
  useBulkEdit: <TRecord, TKey extends FormBulkEditKey>(options: FormBulkEditOptions<TRecord, TKey>) => FormBulkEditController<TKey>;
}
