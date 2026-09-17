import { Button, Popover } from "@wangxiaojinger/qizhi-react";

export default function BasicDemo() {
  return (
    <Popover title="标题" content="这里是气泡卡片的内容，可以承载说明文本和轻量操作。">
      <Button type="primary" className="popover-demo-trigger">悬浮提示</Button>
    </Popover>
  );
}
