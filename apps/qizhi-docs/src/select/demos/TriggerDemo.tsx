import { Select } from "@wangxiaojinger/qizhi-react";
import { cityOptions } from "./options";

export default function TriggerDemo() {
  return (
    <Select
      mode="multiple"
      options={cityOptions}
      trigger={({ valueText, ...props }) => (
        <button {...props} type="button" className="select-docs-trigger">
          最喜欢的城市：{valueText || "无"}
        </button>
      )}
    />
  );
}
