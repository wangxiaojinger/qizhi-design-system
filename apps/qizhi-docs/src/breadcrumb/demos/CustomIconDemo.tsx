import { Breadcrumb, HomeIcon } from "@wangxiaojinger/qizhi-react";

function IconBreadcrumb({
  size,
  label,
}: {
  size?: "small";
  label: string;
}) {
  return (
    <Breadcrumb size={size} aria-label={label}>
      <Breadcrumb.Item icon={<HomeIcon />} aria-label="首页" />
      <Breadcrumb.Item>频道</Breadcrumb.Item>
      <Breadcrumb.Item current>消息</Breadcrumb.Item>
    </Breadcrumb>
  );
}

export default function CustomIconDemo() {
  return (
    <div className="breadcrumb-demo-row">
      <IconBreadcrumb label="带图标的面包屑" />
      <IconBreadcrumb
        size="small"
        label="小尺寸带图标的面包屑"
      />
    </div>
  );
}
