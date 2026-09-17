import type { ReactNode } from "react";

export interface SelectOptionCardField {
  key: string;
  label?: ReactNode;
  value: ReactNode;
  icon?: ReactNode;
}

export interface SelectOptionCardProps {
  name: ReactNode;
  fields: readonly SelectOptionCardField[];
}

export function SelectOptionCard({ name, fields }: SelectOptionCardProps) {
  return <span className="qizhi-select-option-card">
    <span className="qizhi-select-option-card__name">{name}</span>
    <span className="qizhi-select-option-card__fields">{fields.map((field) => <span className="qizhi-select-option-card__field" key={field.key}>
      {field.icon != null && <span className="qizhi-select-option-card__icon" aria-hidden="true">{field.icon}</span>}
      <span>{field.label != null && <span className="qizhi-select-option-card__label">{field.label}：</span>}<span className="qizhi-select-option-card__value">{field.value}</span></span>
    </span>)}</span>
  </span>;
}
