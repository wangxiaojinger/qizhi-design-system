import { Breadcrumb } from "@wangxiaojinger/qizhi-react";

export default function BasicDemo() {
  return (
    <Breadcrumb aria-label="基础面包屑">
      <Breadcrumb.Item>首页</Breadcrumb.Item>
      <Breadcrumb.Item href="#components-navigation">
        频道
      </Breadcrumb.Item>
      <Breadcrumb.Item current>消息</Breadcrumb.Item>
    </Breadcrumb>
  );
}
