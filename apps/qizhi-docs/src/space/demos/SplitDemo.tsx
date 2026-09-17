import { Divider, Link, Space } from "@wangxiaojinger/qizhi-react";

export default function SplitDemo() {
  return <Space split={<Divider type="vertical" />} aria-label="带分隔符的链接">
    <Link href="#component-space" hoverable={false}>Link 1</Link>
    <Link href="#component-space" hoverable={false}>Link 2</Link>
    <Link href="#component-space" hoverable={false}>Link 3</Link>
  </Space>;
}
