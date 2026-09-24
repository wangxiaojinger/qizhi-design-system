import type { CSSProperties, FormHTMLAttributes, ReactNode, Ref } from "react";

export type FormLayout = "vertical" | "horizontal";

export type FormValues = Record<string, unknown>;
export type FormNameSegment = string | number;
export type FormNamePath = string | readonly FormNameSegment[];
export type FormValidateTrigger = "onChange" | "onBlur";
export type FormValidateStatus = "default" | "validating" | "success" | "warning" | "error";

export interface FormRule {
  required?: boolean;
  message?: string;
  min?: number;
  max?: number;
  length?: number;
  pattern?: RegExp;
  validator?: (value: unknown, values: FormValues) => void | Promise<void>;
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

export interface FormComponent {
  (props: FormProps): ReactNode;
  Item: (props: FormItemProps) => ReactNode;
  List: (props: FormListProps) => ReactNode;
  useForm: () => [FormInstance];
  useWatch: (name: FormNamePath, form?: FormInstance) => unknown;
}
