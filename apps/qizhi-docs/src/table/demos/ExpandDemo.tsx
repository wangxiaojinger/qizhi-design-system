import { Table } from "@wangxiaojinger/qizhi-react";
import { columns, people } from "./shared";

export default function ExpandDemo() {
  return (
    <Table
      aria-label="可展开人员表格"
      rowKey="key"
      columns={columns}
      dataSource={people.slice(0, 3)}
      expandable={{
        defaultExpandedRowKeys: [1],
        expandedRowRender: (row) =>
          `${row.name}的完整描述、备注或补充说明。`,
      }}
    />
  );
}
