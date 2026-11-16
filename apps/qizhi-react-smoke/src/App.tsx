import { AdminSearchInput, Button, Card, Flex, QizhiProvider, Table } from "@wangxiaojinger/qizhi-react";

export default function App() {
  return <QizhiProvider><main><h1>QIZHI Admin 正式包消费验证</h1><Card><Flex vertical gap="var(--spacing-16)"><AdminSearchInput aria-label="搜索资源" placeholder="搜索资源" /><Table pagination={false} dataSource={[{ key: "1", name: "成员管理" }]} columns={[{ title: "资源", dataIndex: "name" }, { title: "操作", render: () => <Button type="link">查看</Button> }]} /></Flex></Card></main></QizhiProvider>;
}
