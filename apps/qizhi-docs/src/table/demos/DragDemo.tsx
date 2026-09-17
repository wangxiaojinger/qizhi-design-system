import { useState } from "react";
import { Table } from "@wangxiaojinger/qizhi-react";
import { columns, people } from "./shared";

export default function DragDemo() {
  const [rows, setRows] = useState(people);

  return (
    <Table
      aria-label="可拖拽人员表格"
      rowKey="key"
      columns={columns}
      dataSource={rows}
      draggable
      onRowOrderChange={setRows}
    />
  );
}
