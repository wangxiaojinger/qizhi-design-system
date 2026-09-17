import { Select } from "@wangxiaojinger/qizhi-react";
import { cityOptionsWithDisabled } from "./options";

export default function ClearDemo() {
  return (
    <Select
      className="select-docs-narrow"
      options={cityOptionsWithDisabled}
      defaultValue="上海"
      allowClear
    />
  );
}
