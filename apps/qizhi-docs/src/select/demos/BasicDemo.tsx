import { Select } from "@wangxiaojinger/qizhi-react";
import { cityOptionsWithDisabled } from "./options";

export default function BasicDemo() {
  return (
    <div className="select-docs-grid">
      <Select
        options={cityOptionsWithDisabled}
        defaultValue="北京"
        allowClear
      />
      <Select
        options={cityOptionsWithDisabled}
        defaultValue="北京"
        disabled
      />
      <Select options={cityOptionsWithDisabled} status="error" allowClear />
      <Select
        options={cityOptionsWithDisabled}
        defaultValue="北京"
        status="warning"
        allowClear
      />
    </div>
  );
}
