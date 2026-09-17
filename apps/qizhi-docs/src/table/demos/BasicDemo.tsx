import { Table } from "@wangxiaojinger/qizhi-react";
import { columns, people } from "./shared";

export default function BasicDemo() {
  return (
    <Table
      aria-label="基础人员表格"
      rowKey="key"
      columns={columns}
      dataSource={people.slice(0, 4)}
    />
  );
}
