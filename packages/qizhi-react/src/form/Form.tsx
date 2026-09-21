import { forwardRef, useId } from "react";
import type { FormComponent, FormItemProps, FormProps } from "./Form.types";
import "./form.css";

const joinClassNames = (...names: Array<string | undefined>) => names.filter(Boolean).join(" ");

const FormRoot = forwardRef<HTMLFormElement, FormProps>(function Form(
  { layout = "vertical", className, children, ...formProps },
  ref,
) {
  return (
    <form
      {...formProps}
      ref={ref}
      className={joinClassNames("qizhi-form", `qizhi-form-layout-${layout}`, className)}
    >
      {children}
    </form>
  );
});

function FormItem({ label, required = false, extra, children, className, style }: FormItemProps) {
  const labelId = useId();
  return (
    <div
      className={joinClassNames("qizhi-form-item", className)}
      style={style}
      role="group"
      aria-labelledby={label === undefined ? undefined : labelId}
      aria-required={required || undefined}
    >
      {label === undefined ? null : (
        <div id={labelId} className="qizhi-form-item-label">
          {required ? <span className="qizhi-form-item-required-mark" aria-hidden="true">*</span> : null}
          {label}
        </div>
      )}
      <div className="qizhi-form-item-control">
        {children}
        {extra === undefined ? null : <div className="qizhi-form-item-extra">{extra}</div>}
      </div>
    </div>
  );
}

export const Form = Object.assign(FormRoot, { Item: FormItem }) as FormComponent;
