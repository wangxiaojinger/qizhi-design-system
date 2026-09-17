import { Link, Space } from "@wangxiaojinger/qizhi-react";

export default function HoverableDemo() {
  return (
    <Space size="large">
      <Link href="#components-link">显示悬浮底色</Link>
      <Link href="#components-link" hoverable={false}>隐藏悬浮底色</Link>
      <Link href="#components-link" status="error" hoverable={false}>错误状态</Link>
    </Space>
  );
}
