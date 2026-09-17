import { Select } from "@wangxiaojinger/qizhi-react";
import { cityOptions } from "./options";

export default function OptionsDemo() {
  return (
    <div className="select-docs-row">
      <Select
        className="select-docs-narrow"
        options={cityOptions}
        defaultValue="深圳"
      />
      <Select
        className="select-docs-wide"
        mode="multiple"
        options={cityOptions}
        defaultValue={["北京", "上海"]}
      />
    </div>
  );
}
