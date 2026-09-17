import { Select } from "@wangxiaojinger/qizhi-react";
import { cityOptions } from "./options";

export default function DragDemo() {
  return (
    <Select
      className="select-docs-wide"
      mode="multiple"
      options={cityOptions}
      defaultValue={["北京", "广州", "上海"]}
      maxTagCount={3}
      dragToSort
    />
  );
}
