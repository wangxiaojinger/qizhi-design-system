import { InputTag } from "@wangxiaojinger/qizhi-react";

export default function SaveOnBlurDemo() {
  return (
    <InputTag
      saveOnBlur
      placeholder="输入后失焦保存"
      aria-label="失焦保存标签"
    />
  );
}
