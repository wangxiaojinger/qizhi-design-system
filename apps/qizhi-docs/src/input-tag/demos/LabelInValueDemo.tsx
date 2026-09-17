import { useState } from "react";
import { InputTag } from "@wangxiaojinger/qizhi-react";
import type { InputTagValue } from "@wangxiaojinger/qizhi-react";

const initialValue = [{ label: "选项一", value: "1" }];

export default function LabelInValueDemo() {
  const [value, setValue] = useState<InputTagValue[]>(initialValue);
  return (
    <div className="input-tag-demo-stack">
      <InputTag
        labelInValue
        value={value}
        onChange={setValue}
        placeholder="请输入标签"
        aria-label="选项标签"
      />
      <pre className="input-tag-demo-result">{JSON.stringify(value)}</pre>
    </div>
  );
}
