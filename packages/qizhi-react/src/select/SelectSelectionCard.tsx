import type { HTMLAttributes } from "react";
import type { SelectOptionCardField } from "./SelectOptionCard";

export interface SelectSelectionCardProps extends HTMLAttributes<HTMLDivElement> {
  fields: readonly SelectOptionCardField[];
}

export function SelectSelectionCard({ fields, className, ...rest }: SelectSelectionCardProps) {
  return <div {...rest} className={["qizhi-select-selection-card", className].filter(Boolean).join(" ")}>
    {fields.map((field) => <span className="qizhi-select-selection-card__field" key={field.key}>
      {field.icon != null && <span className="qizhi-select-selection-card__icon" aria-hidden="true">{field.icon}</span>}
      <span>{field.label != null && <span className="qizhi-select-selection-card__label">{field.label}：</span>}<span className="qizhi-select-selection-card__value">{field.value}</span></span>
    </span>)}
  </div>;
}
