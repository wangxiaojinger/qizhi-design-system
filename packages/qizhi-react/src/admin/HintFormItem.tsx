import { Form } from "antd";
import type { FormItemProps } from "antd";

/** Hides neutral guidance only while the field has an actual validation error. */
export function HintFormItem<Values = Record<string, unknown>>({ extra, ...props }: FormItemProps<Values>) {
  return (
    <Form.Item<Values> noStyle shouldUpdate>
      {(form) => <Form.Item<Values> {...props} extra={props.name !== undefined && form.getFieldError(props.name).length ? undefined : extra} />}
    </Form.Item>
  );
}
