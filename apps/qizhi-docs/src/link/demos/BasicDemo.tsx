import { Link, Space } from "@wangxiaojinger/qizhi-react";

export default function BasicDemo() {
  return (
    <Space size="large">
      <Link href="#components-link">Link</Link>
      <Link href="#components-link" disabled>Link</Link>
    </Space>
  );
}
