import { Select, Typography } from "antd";
import type { SelectProps } from "antd";
import type { ReactNode } from "react";

export interface AdminFilterSelectProps<ValueType = unknown> extends Omit<SelectProps<ValueType>, "placeholder" | "prefix"> {
  filterLabel: ReactNode;
  allLabel?: ReactNode;
}

/** A list-only select that keeps its field label visible inside the control. */
export function AdminFilterSelect<ValueType = unknown>({ allLabel = "全部", filterLabel, styles, ...props }: AdminFilterSelectProps<ValueType>) {
  return (
    <Select<ValueType>
      {...props}
      styles={(info) => {
        const supplied = typeof styles === "function" ? styles(info) : styles;
        return {
          ...supplied,
          root: { minWidth: "calc(var(--spacing-32) * 4 + var(--spacing-4))", ...supplied?.root },
          prefix: { flex: "0 0 auto", marginInlineEnd: "var(--spacing-4)", ...supplied?.prefix },
          placeholder: { color: "var(--text-text-default)", ...supplied?.placeholder },
        };
      }}
      placeholder={allLabel}
      prefix={<Typography.Text>{filterLabel}：</Typography.Text>}
    />
  );
}
