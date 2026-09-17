import { Button, Popconfirm } from "@wangxiaojinger/qizhi-react";

export default function InternationalDemo() {
  return (
    <Popconfirm
      title="放弃更改"
      content="确定要放弃当前未保存的更改吗？"
      okText="放弃"
      cancelText="保留"
    >
      <Button type="secondary" className="popconfirm-demo-trigger">
        放弃
      </Button>
    </Popconfirm>
  );
}
