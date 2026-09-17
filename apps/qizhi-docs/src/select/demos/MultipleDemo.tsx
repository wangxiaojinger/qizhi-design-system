import { Select } from "@wangxiaojinger/qizhi-react";
import { cityOptions } from "./options";

export default function MultipleDemo() {
  return (
    <div className="select-docs-stack">
      <Select
        mode="multiple"
        options={cityOptions}
        defaultValue={["北京", "深圳"]}
        allowClear
      />
      <Select
        mode="multiple"
        options={cityOptions}
        defaultValue={["北京", "深圳", "广州"]}
        maxTagCount={2}
        allowClear
      />
      <Select
        mode="multiple"
        options={cityOptions}
        defaultValue={["北京", "深圳", "广州"]}
        maxTagCount={2}
        renderMore={(count) => `+${count} 个更多`}
        allowClear
      />
      <Select
        mode="multiple"
        options={cityOptions}
        defaultValue={["北京", "广州", "深圳"]}
        maxTagCount={0}
        renderMore={() => "已选择 3 个城市"}
      />
    </div>
  );
}
