import { Divider, Input } from "@wangxiaojinger/qizhi-react";

export default function AutoWidthDemo() {
  return (
    <div className="input-demo-stack input-auto-width-demo">
      <Divider>{'{"minWidth":0,"maxWidth":500}'}</Divider>
      <Input
        autoWidth={{ minWidth: 0, maxWidth: 500 }}
        placeholder="请输入内容"
      />
      <Divider>{'{"minWidth":300,"maxWidth":500}'}</Divider>
      <Input
        autoWidth={{ minWidth: 300, maxWidth: 500 }}
        placeholder="请输入内容"
      />
      <Input
        autoWidth={{ minWidth: 300, maxWidth: 500 }}
        prefix="前缀"
        placeholder="请输入内容"
      />
      <Input
        addBefore="前置"
        autoWidth={{ minWidth: 220, maxWidth: 420 }}
        prefix="前缀"
        placeholder="请输入内容"
      />
    </div>
  );
}
