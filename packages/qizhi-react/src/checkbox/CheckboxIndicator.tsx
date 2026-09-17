interface CheckboxIndicatorProps {
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  className?: string;
}

const joinClassNames = (...names: Array<string | false | undefined>) => names.filter(Boolean).join(" ");

export function CheckboxIndicator({ checked = false, indeterminate = false, disabled = false, className }: CheckboxIndicatorProps) {
  return (
    <span
      className={joinClassNames(
        "qizhi-checkbox-mask-wrapper",
        "qizhi-checkbox-indicator",
        checked && "qizhi-checkbox-checked",
        indeterminate && "qizhi-checkbox-indeterminate",
        disabled && "qizhi-checkbox-disabled",
        className,
      )}
      aria-hidden="true"
    >
      <span className="qizhi-checkbox-mask" />
    </span>
  );
}
