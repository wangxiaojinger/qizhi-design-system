import { Select } from "@wangxiaojinger/qizhi-react";
import { cityOptions } from "./options";

export default function CreateDemo() {
  return (
    <div className="select-docs-row select-docs-wide-row">
      <Select
        options={cityOptions}
        defaultValue="自定义项目"
        allowCreate
        allowClear
      />
      <Select
        mode="multiple"
        options={cityOptions}
        defaultValue={["项目10"]}
        allowCreate={{ formatter: (value) => `输入创建：${value}` }}
        allowClear
      />
    </div>
  );
}
