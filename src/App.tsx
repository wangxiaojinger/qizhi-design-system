import { useState } from "react";
import {
  AdminFilterSelect,
  AdminSearchInput,
  Button,
  Card,
  Flex,
  ListPageCard,
  PageHeader,
  QizhiProvider,
  SectionCard,
  Space,
  Table,
  TableActions,
  TableActionButton,
  Tag,
  Typography,
} from "@wangxiaojinger/qizhi-react";

const rows = [
  { key: "1", name: "智能运营后台", owner: "平台团队", status: "已启用" },
  { key: "2", name: "模型资源管理", owner: "基础设施团队", status: "草稿" },
];

export function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  return (
    <QizhiProvider theme={theme}>
      <main className="docs-shell">
        <Flex className="docs-topbar" justify="space-between" align="center" wrap gap="var(--spacing-16)">
          <Flex vertical gap="var(--spacing-2)">
            <Typography.Text strong>QIZHI</Typography.Text>
            <Typography.Text type="secondary">Admin Design System · v1</Typography.Text>
          </Flex>
          <Button onClick={() => setTheme((current) => current === "light" ? "dark" : "light")}>切换{theme === "light" ? "深色" : "浅色"}模式</Button>
        </Flex>

        <PageHeader
          title="企业后台设计规范"
          description="基于 Ant Design 的中性后台标准：Token 提供语义，QizhiProvider 同步主题，业务页面只组合公开组件。"
          actions={<Button type="primary">创建资源</Button>}
        />

        <section className="docs-section" aria-labelledby="quick-start">
          <Typography.Title level={2} id="quick-start">接入方式</Typography.Title>
          <Card>
            <pre>{`pnpm add @wangxiaojinger/qizhi-tokens @wangxiaojinger/qizhi-react antd\n\nimport "@wangxiaojinger/qizhi-react/style.css";\nimport { QizhiProvider, Button } from "@wangxiaojinger/qizhi-react";\n\nexport function App() {\n  return <QizhiProvider><Button type="primary">保存</Button></QizhiProvider>;\n}`}</pre>
          </Card>
        </section>

        <section className="docs-section" aria-labelledby="tokens">
          <Typography.Title level={2} id="tokens">后台 Token</Typography.Title>
          <Flex wrap gap="var(--spacing-16)">
            <Card className="token-card" title="基础与语义层"><Typography.Paragraph>间距、字体、圆角与层级是全局基础；`--admin-*`、`--text-*`、`--border-*` 描述页面中的实际角色。</Typography.Paragraph></Card>
            <Card className="token-card" title="组件层"><Typography.Paragraph>表格表头与悬停、输入框、抽屉与遮罩均由 `--component-*` 语义变量驱动。</Typography.Paragraph></Card>
          </Flex>
        </section>

        <section className="docs-section" aria-labelledby="example">
          <Typography.Title level={2} id="example">后台列表组合示例</Typography.Title>
          <SectionCard>
            <ListPageCard
              toolbar={<Flex justify="space-between" wrap gap="var(--spacing-12)" style={{ width: "100%" }}><Space wrap><AdminSearchInput placeholder="搜索项目" /><AdminFilterSelect filterLabel="状态" allLabel="全部" options={[{ value: "enabled", label: "已启用" }, { value: "draft", label: "草稿" }]} /></Space><Button type="primary">新建项目</Button></Flex>}
            >
              <Table
                pagination={false}
                dataSource={rows}
                columns={[
                  { title: "项目名称", dataIndex: "name" },
                  { title: "负责人", dataIndex: "owner" },
                  { title: "状态", dataIndex: "status", render: (status: string) => <Tag color={status === "已启用" ? "success" : "default"}>{status}</Tag> },
                  { title: "操作", key: "actions", render: () => <TableActions><TableActionButton type="link">查看</TableActionButton><TableActionButton type="link">编辑</TableActionButton></TableActions> },
                ]}
              />
            </ListPageCard>
          </SectionCard>
        </section>
      </main>
    </QizhiProvider>
  );
}
