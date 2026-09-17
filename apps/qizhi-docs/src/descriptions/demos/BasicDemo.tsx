import { Descriptions, Tag } from "@wangxiaojinger/qizhi-react";

export default function BasicDemo() {
  return (
    <Descriptions title="项目信息">
      <Descriptions.Item label="项目名称">QIZHI Design System</Descriptions.Item>
      <Descriptions.Item label="当前版本">1.0.0</Descriptions.Item>
      <Descriptions.Item label="负责人">Design Team</Descriptions.Item>
      <Descriptions.Item label="状态"><Tag color="green">运行中</Tag></Descriptions.Item>
      <Descriptions.Item label="创建时间">2026-06-09</Descriptions.Item>
      <Descriptions.Item label="所属模块">数据展示</Descriptions.Item>
    </Descriptions>
  );
}
