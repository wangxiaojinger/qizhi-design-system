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
  validateFields: (names?: FormNamePath[]) => Promise<FormValues>;
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

export interface FormListRule {
  message?: string;
  validator?: (listValue: unknown[], values: FormValues) => void | FormRuleFailure | Promise<void | FormRuleFailure>;
}
export type FormListRowRule = (
  rowValue: unknown,
  index: number,
  allValues: FormValues,
) => void | FormRuleFailure | Promise<void | FormRuleFailure>;
export interface FormListMeta { errors: string[] }
export interface FormErrorListProps {
  errors?: readonly ReactNode[];
  className?: string;
  style?: CSSProperties;
}
export interface FormListField { key: string; name: number; errors: string[] }
export interface FormListOperations {
  add: (defaultValue?: unknown, insertIndex?: number) => void;
  addMany: (values: readonly unknown[], insertIndex?: number) => void;
  remove: (index: number | readonly number[]) => void;
  move: (from: number, to: number) => void;
  canAdd: (count?: number) => boolean;
  canRemove: (index: number | readonly number[]) => boolean;
}
export interface FormListProps {
  name: FormNamePath;
  initialValue?: unknown[];
  min?: number;
  max?: number;
  rules?: FormListRule[];
  rowRules?: FormListRowRule[];
  children: (fields: FormListField[], operations: FormListOperations, meta: FormListMeta) => ReactNode;
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

export interface FormStep {
  key: string;
  fields: readonly FormNamePath[];
}

export interface FormStepsOptions {
  form: FormInstance;
  steps: readonly FormStep[];
  initialStep?: number;
  current?: number;
  onCurrentChange?: (current: number) => void;
}

export interface FormStepsController {
  current: number;
  step: FormStep | undefined;
  total: number;
  isFirst: boolean;
  isLast: boolean;
  next: () => Promise<boolean>;
  previous: () => void;
  goTo: (step: number) => Promise<boolean>;
  submit: () => Promise<boolean>;
}

export interface FormDraftRecord<TValues extends FormValues = FormValues, TMetadata = unknown> {
  key: string;
  version: string;
  revision: string;
  values: TValues;
  metadata?: TMetadata;
  updatedAt: string;
  expiresAt?: string;
}

export interface FormDraftSaveInput<TValues extends FormValues = FormValues, TMetadata = unknown> {
  key: string;
  version: string;
  values: TValues;
  metadata?: TMetadata;
  expectedRevision?: string;
  force?: boolean;
}

export type FormDraftSaveResult<TValues extends FormValues = FormValues, TMetadata = unknown> =
  | { status: "saved"; record: FormDraftRecord<TValues, TMetadata> }
  | { status: "conflict"; remote: FormDraftRecord<TValues, TMetadata> };

export interface FormDraftStorage<TValues extends FormValues = FormValues, TMetadata = unknown> {
  load: (key: string) => Promise<FormDraftRecord<TValues, TMetadata> | null>;
  save: (input: FormDraftSaveInput<TValues, TMetadata>) => Promise<FormDraftSaveResult<TValues, TMetadata>>;
  remove: (key: string, expectedRevision?: string) => Promise<void>;
}

export type FormDraftStatus = "idle" | "loading" | "ready" | "saving" | "saved" | "expired" | "version-mismatch" | "conflict" | "error";

export interface FormDraftOptions<TValues extends FormValues = FormValues, TMetadata = unknown> {
  form: FormInstance;
  draftKey: string;
  version: string;
  storage: FormDraftStorage<TValues, TMetadata>;
  selectValues: (values: FormValues) => TValues;
  getMetadata?: () => TMetadata;
  onRestoreMetadata?: (metadata: TMetadata | undefined) => void;
  autoSave?: false | { debounceMs: number };
}

export interface FormDraftController<TValues extends FormValues = FormValues, TMetadata = unknown> {
  status: FormDraftStatus;
  record: FormDraftRecord<TValues, TMetadata> | null;
  conflict: FormDraftRecord<TValues, TMetadata> | null;
  error: unknown;
  load: () => Promise<FormDraftRecord<TValues, TMetadata> | null>;
  restore: () => boolean;
  save: () => Promise<boolean>;
  remove: () => Promise<boolean>;
  useRemote: () => boolean;
  overwrite: () => Promise<boolean>;
}

export interface FormComponent {
  (props: FormProps): ReactNode;
  Item: (props: FormItemProps) => ReactNode;
  List: (props: FormListProps) => ReactNode;
  ErrorList: (props: FormErrorListProps) => ReactNode;
  useForm: () => [FormInstance];
  useWatch: (name: FormNamePath, form?: FormInstance) => unknown;
  useDirty: (form?: FormInstance) => boolean;
  useSteps: (options: FormStepsOptions) => FormStepsController;
  useDraft: <TValues extends FormValues = FormValues, TMetadata = unknown>(options: FormDraftOptions<TValues, TMetadata>) => FormDraftController<TValues, TMetadata>;
  useBulkEdit: <TRecord, TKey extends FormBulkEditKey>(options: FormBulkEditOptions<TRecord, TKey>) => FormBulkEditController<TKey>;
}
