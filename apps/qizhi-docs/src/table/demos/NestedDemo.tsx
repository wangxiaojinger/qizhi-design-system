import { Table } from "@wangxiaojinger/qizhi-react";
import { columns, people } from "./shared";

export default function NestedDemo() {
  return (
    <Table
      aria-label="嵌套子表格"
      rowKey="key"
      columns={columns}
      dataSource={people.slice(0, 3)}
      expandable={{
        defaultExpandedRowKeys: [1],
        expandedRowRender: () => (
          <Table
            aria-label="子表格"
            rowKey="key"
            columns={columns}
            dataSource={people}
            size="small"
          />
        ),
      }}
    />
  );
}
