import { useState } from "react";
import {
  Link,
  Empty,
  Space,
  Switch,
  Table,
  type TableColumn,
} from "@wangxiaojinger/qizhi-react";

type Project = {
  key: string;
  project: string;
  description: string;
  owner: string;
  status: string;
  updatedAt: string;
};

const data: Project[] = [
  {
    key: "1",
    project: "设计系统基础库",
    description: "沉淀令牌、基础组件与跨产品的公共交互规则。",
    owner: "林猫猫",
    status: "进行中",
    updatedAt: "2026-10-14",
  },
  {
    key: "2",
    project: "研发效能工作台",
    description: "集中查看项目健康度、构建结果和待处理事项。",
    owner: "周青",
    status: "待发布",
    updatedAt: "2026-10-10",
  },
];

const fullWidth = { width: "100%", minWidth: 0 };

const constrainedColumns: TableColumn<Project>[] = [
  {
    key: "project",
    title: "项目名称",
    dataIndex: "project",
    minWidth: 180,
    width: 220,
    maxWidth: 260,
    grow: 1,
    shrinkPriority: 1,
  },
  {
    key: "description",
    title: "说明",
    dataIndex: "description",
    minWidth: 180,
    width: 300,
    maxWidth: 360,
    grow: 2,
    shrinkPriority: 0,
  },
  {
    key: "status",
    title: "状态",
    dataIndex: "status",
    width: 96,
    minWidth: 96,
    grow: 1,
    growPriority: 1,
    shrink: 0,
    align: "center",
  },
  {
    key: "updatedAt",
    title: "更新时间",
    dataIndex: "updatedAt",
    width: 152,
    minWidth: 152,
    grow: 1,
    growPriority: 1,
    shrink: 0,
    align: "left",
  },
  {
    key: "action",
    title: "操作",
    width: 64,
    fixed: "right",
    render: () => <Link hoverable={false}>查看</Link>,
  },
];

type EngineeringRow = {
  key: string;
  name: string;
  description: string;
  count: number | null;
};
const engineeringRows: EngineeringRow[] = [
  {
    key: "one",
    name: "跨产品设计系统基础组件与可访问性工程项目 g/j/p/q/y_",
    description: "EnglishUnbrokenIdentifier_gjpqy_".repeat(8),
    count: 0,
  },
  { key: "two", name: "短名称", description: "普通内容无需全文提示", count: null },
];
const engineeringColumns: TableColumn<EngineeringRow>[] = [
  {
    key: "name", title: "名称", dataIndex: "name", fixed: "left",
    width: 240, minWidth: 180, maxWidth: 260, grow: 1,
    shrinkPriority: 1, ellipsis: { rows: 2, tooltip: true },
  },
  {
    key: "description", title: "说明", dataIndex: "description",
    width: 260, minWidth: 160, maxWidth: 320, grow: 1,
    shrinkPriority: 0, ellipsis: { rows: 2, tooltip: true },
  },
  {
    key: "count", title: "数量", dataIndex: "count",
    width: 96, minWidth: 96, grow: 1, growPriority: 1, shrink: 0,
  },
  {
    key: "action", title: "操作", width: 64, fixed: "right",
    render: () => <Link hoverable={false}>查看</Link>,
  },
];

const compactColumns: TableColumn<Project>[] = [
  {
    key: "project",
    title: "项目",
    dataIndex: "project",
    minWidth: 144,
    grow: 1,
  },
  { key: "owner", title: "负责人", dataIndex: "owner", width: 88 },
  {
    key: "status",
    title: "状态",
    dataIndex: "status",
    width: 96,
    align: "center",
  },
];

const fixedData: Project[] = [
  { ...data[0], project: "基础库" },
  { ...data[1], project: "工作台" },
];

const autoColumns: TableColumn<Project>[] = [
  {
    key: "project",
    title: "项目名称",
    dataIndex: "project",
    minWidth: 220,
  },
  { key: "owner", title: "负责人", dataIndex: "owner", width: 112, minWidth: 112 },
  {
    key: "updatedAt",
    title: "更新时间",
    dataIndex: "updatedAt",
    width: 152,
    minWidth: 152,
    align: "left",
  },
];

const fixedColumns: TableColumn<Project>[] = [
  {
    key: "project",
    title: "项目名称",
    dataIndex: "project",
    width: 80,
    fixed: "left",
  },
  {
    key: "owner",
    title: "负责人",
    dataIndex: "owner",
    width: 80,
    fixed: "left",
  },
  {
    key: "description",
    title: "说明",
    dataIndex: "description",
    width: 336,
  },
  {
    key: "status",
    title: "状态",
    dataIndex: "status",
    width: 96,
    align: "center",
  },
  {
    key: "updatedAt",
    title: "更新时间",
    dataIndex: "updatedAt",
    width: 152,
    align: "left",
  },
  {
    key: "action",
    title: "操作",
    width: 64,
    fixed: "right",
    render: () => <Link hoverable={false}>查看</Link>,
  },
];

export default function LayoutDemo() {
  const [showHeader, setShowHeader] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [noRecords, setNoRecords] = useState(false);

  return (
    <Space direction="vertical" size="large" style={fullWidth}>
      <section style={fullWidth}>
        <h4>受约束的弹性列</h4>
        <p>
          名称和说明达到上限后，由显式配置的状态、日期列分摊余量；操作列不扩展。
        </p>
        <Table
          aria-label="受约束的弹性列表"
          rowKey="key"
          columns={constrainedColumns}
          dataSource={data}
        />
      </section>

      <section style={fullWidth}>
        <h4>紧凑布局</h4>
        <p>特殊容器可显式收缩；标准页面级列表不使用此模式留白。</p>
        <Table
          aria-label="紧凑布局列表"
          rowKey="key"
          columns={compactColumns}
          dataSource={data}
          layoutMode="compact"
          tableLayout="fixed"
        />
      </section>

      <section style={fullWidth}>
        <h4>两行文本与数据区加载</h4>
        <p>
          仅实际截断的文本支持悬浮、聚焦、点击查看全文。窄容器取消固定列，
          缺失值显示 -，保留真实 0；说明先压缩，名称后压缩。
        </p>
        <Space size="small">
          <span>数据区加载</span>
          <Switch checked={refreshing} onChange={setRefreshing} aria-label="数据区加载" />
          <span>空数据</span>
          <Switch checked={noRecords} onChange={setNoRecords} aria-label="增强示例空数据" />
        </Space>
        <Table
          aria-label="工程规范增强列表"
          rowKey="key"
          columns={engineeringColumns}
          dataSource={noRecords ? [] : engineeringRows}
          emptyCell="-"
          emptyPadding={36}
          fixedBreakpoint={640}
          loading={{ spinning: refreshing, scope: "body", tip: "正在刷新数据..." }}
        />
      </section>

      <section style={fullWidth}>
        <h4>自定义空态留白</h4>
        <p>默认与自定义 Empty 使用同一层 36px 留白，不重复叠加单元格内边距。</p>
        <Table
          aria-label="自定义空态列表"
          rowKey="key"
          columns={engineeringColumns}
          dataSource={[]}
          emptyPadding={36}
          fixedBreakpoint={640}
          empty={<Empty description="没有匹配的项目" />}
        />
      </section>

      <section style={fullWidth}>
        <h4>原生自动布局</h4>
        <p>tableLayout 为 auto 时，minWidth 由浏览器处理；不与 grow 或 maxWidth 组合。</p>
        <Table
          aria-label="自动布局列表"
          rowKey="key"
          columns={autoColumns}
          dataSource={data}
          tableLayout="auto"
        />
      </section>

      <section style={fullWidth}>
        <h4>隐藏表头与对齐</h4>
        <Space size="small">
          <span>显示表头</span>
          <Switch
            checked={showHeader}
            aria-label="显示表头"
            onChange={setShowHeader}
          />
        </Space>
        <Table
          aria-label="隐藏表头和对齐列表"
          rowKey="key"
          columns={constrainedColumns}
          dataSource={data}
          showHeader={showHeader}
        />
      </section>

      <section style={fullWidth}>
        <h4>同侧多个固定列</h4>
        <p>
          固定业务列 224px 加选择列 48px，总预算 272px；选择列随内容滚动。
        </p>
        <Table
          aria-label="多个固定列列表"
          rowKey="key"
          columns={fixedColumns}
          dataSource={fixedData}
          rowSelection={{ type: "checkbox" }}
        />
      </section>
    </Space>
  );
}
