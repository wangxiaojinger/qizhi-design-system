import { Input } from "@wangxiaojinger/qizhi-react";

export default function WordLimitDemo() {
  return (
    <div className="input-word-limit-demo">
      <Input maxLength={10} showWordLimit placeholder="最多输入 10 个字符" />
      <Input.TextArea
        maxLength={50}
        showWordLimit
        placeholder="最多输入 50 个字符"
      />
      <Input
        defaultValue="超过 10 个字符将显示错误"
        maxLength={{ length: 10, errorOnly: true }}
        showWordLimit
      />
      <Input.TextArea
        maxLength={{ length: 50, errorOnly: true }}
        showWordLimit
        placeholder="超过 50 个字符将显示错误"
      />
      <Input.TextArea
        maxLength={50}
        showWordLimit
        wordLimitPlacement="outside"
        placeholder="字数统计显示在文本域下方"
      />
    </div>
  );
}
