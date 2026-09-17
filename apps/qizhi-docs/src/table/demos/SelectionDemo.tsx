import { useState } from "react";
import { Table } from "@wangxiaojinger/qizhi-react";
import { DemoSegmentedControl } from "../../demo-controls/DemoSegmentedControl";
import { columns, people } from "./shared";

export default function SelectionDemo() {
  const [type, setType] = useState<"checkbox" | "radio">("checkbox");

  return (
    <div className="table-demo-stack">
      <DemoSegmentedControl
        aria-label="选择类型"
        value={type}
        options={[
          { label: "复选框", value: "checkbox" },
          { label: "单选框", value: "radio" },
        ]}
        onChange={setType}
      />
      <Table
        aria-label="可选择人员表格"
        rowKey="key"
        columns={columns}
        dataSource={people}
        rowSelection={{
          type,
          defaultSelectedRowKeys: [4],
          getCheckboxProps: (row) => ({ disabled: row.key === 4 }),
        }}
      />
    </div>
  );
}
