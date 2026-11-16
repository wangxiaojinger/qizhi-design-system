import { SearchOutlined } from "@ant-design/icons";
import { Input } from "antd";
import type { InputProps } from "antd";
import type { ChangeEvent, KeyboardEvent } from "react";

export interface AdminSearchInputProps extends Omit<InputProps, "prefix" | "type"> {
  onSearch?: (value: string) => void;
}

/** Search input convention for list-page toolbars. */
export function AdminSearchInput({ allowClear = true, onChange, onPressEnter, onSearch, ...props }: AdminSearchInputProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    if (event.target.value === "") onSearch?.("");
  };
  const handlePressEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    onPressEnter?.(event);
    if (!event.defaultPrevented) onSearch?.(event.currentTarget.value);
  };
  return <Input {...props} allowClear={allowClear} onChange={handleChange} onPressEnter={handlePressEnter} prefix={<SearchOutlined aria-hidden="true" />} type="search" />;
}
