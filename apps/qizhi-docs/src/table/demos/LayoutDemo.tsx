import { useState } from "react";
import {
  Link,
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
    grow: 1,
  },
  {
    key: "description",
    title: "说明",
    dataIndex: "description",
    minWidth: 180,
    maxWidth: 360,
    grow: 2,
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
    align: "right",
  },
  {
    key: "action",
    title: "操作",
    width: 104,
    fixed: "right",
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
    align: "right",
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
    align: "right",
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

  return (
    <Space direction="vertical" size="large" style={fullWidth}>
      <section style={fullWidth}>
        <h4>受约束的弹性列</h4>
        <p>
          名称和说明按 grow 分配剩余空间；状态、日期和操作使用稳定宽度。
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
        <p>显式 fixed 后按数字预算收缩，不把剩余空间分给 grow 列。</p>
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
