import type { SelectOption } from "../select/Select.types";

export interface GranularityOption extends Omit<SelectOption, "label"> { readonly label: string }

export interface GranularitySelectProps {
  /** Business-defined granularity options. The key auto is reserved. */
  readonly options: readonly GranularityOption[];
  readonly value: string | number;
  readonly resolvedValue?: string | number;
  readonly onChange: (value: string | number) => void;
  readonly disabled?: boolean;
  readonly className?: string;
}
