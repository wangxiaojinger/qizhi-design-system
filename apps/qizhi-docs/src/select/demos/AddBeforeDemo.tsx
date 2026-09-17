import { Select } from "@wangxiaojinger/qizhi-react";
import { cityOptions } from "./options";

export default function AddBeforeDemo() {
  return (
    <div className="select-docs-row">
      <Select
        options={cityOptions}
        defaultValue="上海"
        addBefore="城市"
        allowClear
      />
      <Select
        mode="multiple"
        options={cityOptions}
        defaultValue={["上海", "广州"]}
        addBefore="城市"
        allowClear
      />
    </div>
  );
}
