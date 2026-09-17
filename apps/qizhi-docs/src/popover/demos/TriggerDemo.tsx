import { Button, Popover, Space } from "@wangxiaojinger/qizhi-react";

export default function TriggerDemo() {
  return (
    <Space size="large">
      <Popover content="鼠标悬停时显示。"><Button type="primary" className="popover-demo-trigger">悬停</Button></Popover>
      <Popover trigger="click" role="dialog" content="点击按钮切换显示。"><Button type="secondary" className="popover-demo-trigger">点击</Button></Popover>
      <Popover trigger="focus" content="获得焦点时显示。"><Button type="dashed" className="popover-demo-trigger">聚焦</Button></Popover>
      <Popover trigger="contextMenu" role="menu" content="右键打开菜单。"><Button type="text" className="popover-demo-trigger">右键</Button></Popover>
    </Space>
  );
}
