import { EditIcon, Link, Space } from "@wangxiaojinger/qizhi-react";

export default function IconDemo() {
  return (
    <Space className="link-icon-stack" size="large">
      <Space size="large">
        <Link href="#components-link" icon>Hyperlinks</Link>
        <Link href="#components-link" icon disabled>Hyperlinks</Link>
      </Space>
      <Space size="large">
        <Link href="#components-link" icon={<EditIcon />}>Hyperlinks</Link>
        <Link href="#components-link" icon={<EditIcon />} disabled>Hyperlinks</Link>
      </Space>
    </Space>
  );
}
