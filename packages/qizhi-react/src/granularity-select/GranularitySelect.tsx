import { Select } from "../select/Select";
import type { GranularitySelectProps } from "./GranularitySelect.types";

export function GranularitySelect({ options, value, resolvedValue, onChange, disabled, className }: GranularitySelectProps) {
  const manualOptions = options.filter(option => option.value !== "auto");
  const resolved = manualOptions.find(option => option.value === resolvedValue);
  return <Select aria-label="聚合粒度" value={value} disabled={disabled} className={className}
    options={[{ value: "auto", label: resolved ? `自动（${resolved.label}）` : "自动" }, ...manualOptions]}
    onChange={next => { if (next !== undefined) onChange(next); }} />;
}
