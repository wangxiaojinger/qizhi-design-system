import { useState } from "react";
import { Switch, Table } from "@wangxiaojinger/qizhi-react";
import { columns, people } from "./shared";

export default function TreeDemo() {
  const [strict, setStrict] = useState(true);
  const tree = [
    { ...people[0], children: [{ ...people[2], key: 31, name: "Christina" }] },
    { ...people[1], children: [{ ...people[2], key: 32 }] },
  ];

  return (
    <div className="table-demo-stack">
      <label className="table-demo-switch-label">
        checkStrictly：
        <Switch
          size="small"
          checked={strict}
          aria-label="父子节点选择是否关联"
          onChange={setStrict}
        />
      </label>
      <Table
        aria-label="树形人员表格"
        rowKey="key"
        columns={columns}
        dataSource={tree}
        rowSelection={{ checkStrictly: strict }}
        expandable={{ defaultExpandedRowKeys: [1] }}
      />
    </div>
  );
}
