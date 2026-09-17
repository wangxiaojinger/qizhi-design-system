import { Link, Space } from "@wangxiaojinger/qizhi-react";

export default function StatusDemo() {
  return (
    <Space size="large">
      <Link href="#components-link">Default Link</Link>
      <Link href="#components-link" status="error">Error Link</Link>
      <Link href="#components-link" status="success">Success Link</Link>
      <Link href="#components-link" status="warning">Warning Link</Link>
      <Link href="#components-link" status="error" disabled>Disabled Link</Link>
    </Space>
  );
}
