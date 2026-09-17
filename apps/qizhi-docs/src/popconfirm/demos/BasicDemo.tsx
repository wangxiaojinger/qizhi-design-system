import { Button, Popconfirm } from "@wangxiaojinger/qizhi-react";

export default function BasicDemo() {
  return (
    <Popconfirm
      title="确认删除"
      content="确定要删除这条内容吗？"
    >
      <Button type="secondary" className="popconfirm-demo-trigger">
        删除
      </Button>
    </Popconfirm>
  );
}
