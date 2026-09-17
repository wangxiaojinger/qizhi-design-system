import { Select } from "@wangxiaojinger/qizhi-react";
import { cityOptions } from "./options";

const tokenOptions = [
  ...cityOptions,
  { label: "南京", value: "南京" },
  { label: "西安", value: "西安" },
  { label: "杭州", value: "杭州" },
];

export default function TokenDemo() {
  return (
    <Select
      className="select-docs-wide"
      mode="multiple"
      options={tokenOptions}
      tokenSeparators={[",", "|", "/"]}
      allowClear
    />
  );
}
