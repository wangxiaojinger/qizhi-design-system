import { useState } from "react";
import { InputTag } from "@wangxiaojinger/qizhi-react";
import type { InputTagValue } from "@wangxiaojinger/qizhi-react";

export default function ValidateDemo() {
  const [message, setMessage] = useState("输入长度需大于 3 后按回车。");
  const [words, setWords] = useState<InputTagValue[]>([]);
  return (
    <div className="input-tag-demo-row">
      <div className="input-tag-demo-stack">
        <InputTag
          validate={(input) => {
            const valid = input.length > 3;
            setMessage(valid ? "" : "长度必须大于 3");
            return valid;
          }}
          placeholder="请输入标签"
          aria-label="校验标签"
        />
        <span className="input-tag-demo-message">{message}</span>
      </div>
      <div className="input-tag-demo-stack">
        <InputTag
          value={words}
          onChange={setWords}
          validate={(input) => ({ word: input })}
          placeholder="格式化输入内容"
          aria-label="格式化标签"
        />
        <pre className="input-tag-demo-result">{JSON.stringify(words)}</pre>
      </div>
    </div>
  );
}
