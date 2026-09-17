import { Button, Popconfirm } from "@wangxiaojinger/qizhi-react";

const wait = () => new Promise<void>((resolve) => {
  window.setTimeout(resolve, 2000);
});

export default function AsyncDemo() {
  return (
    <Popconfirm
      position="right"
      title="确认删除"
      content="确定要删除这条内容吗？"
      onOk={wait}
    >
      <Button type="secondary" className="popconfirm-demo-trigger">
        异步关闭
      </Button>
    </Popconfirm>
  );
}
