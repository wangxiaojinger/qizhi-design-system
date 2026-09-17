import { Input } from "@wangxiaojinger/qizhi-react";

const content = "这是文本域中的内容。";
const longContent = Array.from({ length: 24 }, () => content).join(" ");

export default function AutoSizeDemo() {
  return (
    <div className="input-textarea-demo input-textarea-auto-demo">
      <Input.TextArea autoSize defaultValue={content} />
      <Input.TextArea
        autoSize={{ minRows: 2, maxRows: 6 }}
        defaultValue={longContent}
      />
    </div>
  );
}
