import { Table } from "@wangxiaojinger/qizhi-react";
import type { TableColumn } from "@wangxiaojinger/qizhi-react";

interface Project {
  key: number;
  name: string;
  description: string;
  note: string;
}

const data: Project[] = [
  {
    key: 1,
    name: "模型服务",
    description: "本列显式关闭 ellipsis，内容会根据列宽自然换行，行高由内容撑开。",
    note: "未配置 Table 或列级 ellipsis 时，字符串与数字内容默认最多展示两行；只有实际截断时才可通过全文提示查看完整内容。",
  },
  {
    key: 2,
    name: "数据服务",
    description: "自然换行时，行高由内容撑开，不再固定为单行高度。",
    note: "列级 ellipsis={false} 可覆盖表级默认，保留自然换行；ellipsis={true} 仍使用兼容的单行原生 title。",
  },
];

const columns: TableColumn<Project>[] = [
  { key: "name", title: "服务", dataIndex: "name", width: 140 },
  { key: "description", title: "自然换行", dataIndex: "description", width: 260, ellipsis: false },
  { key: "note", title: "默认两行省略", dataIndex: "note", width: 260 },
];

export default function ContentDemo() {
  return (
    <Table
      aria-label="多行与省略表格"
      rowKey="key"
      columns={columns}
      dataSource={data}
    />
  );
}
