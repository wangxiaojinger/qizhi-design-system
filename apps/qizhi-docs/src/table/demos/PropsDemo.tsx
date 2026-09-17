import { useState } from "react";
import { Switch, Table } from "@wangxiaojinger/qizhi-react";
import type { TablePaginationPosition, TableSize } from "@wangxiaojinger/qizhi-react";
import { columns, people } from "./shared";
import { DemoSegmentedControl } from "../../demo-controls/DemoSegmentedControl";

const switches = [
  ["border", "边框"],
  ["borderCell", "单元格边框"],
  ["hover", "悬浮高亮"],
  ["stripe", "斑马纹"],
  ["checkbox", "复选框"],
  ["loading", "加载中"],
  ["showHeader", "表头"],
  ["empty", "无数据"],
] as const;

export default function PropsDemo() {
  const [props, setProps] = useState({
    border: true,
    borderCell: false,
    hover: true,
    stripe: false,
    checkbox: true,
    loading: false,
    showHeader: true,
    empty: false,
  });
  const [size, setSize] = useState<TableSize>("default");
  const [position, setPosition] = useState<TablePaginationPosition>(
    "bottomRight",
  );
  const toggle = (key: keyof typeof props) => {
    setProps((value) => ({ ...value, [key]: !value[key] }));
  };

  return (
    <div className="table-props-demo">
      <div className="table-props-demo__controls">
        {switches.map(([key, label]) => (
          <label key={key}>
            {label}
            <Switch
              size="small"
              checked={props[key]}
              aria-label={label}
              onChange={() => toggle(key)}
            />
          </label>
        ))}
      </div>
      <DemoSegmentedControl
        aria-label="表格尺寸"
        value={size}
        options={[
          { label: "默认 56px", value: "default" },
          { label: "中等 48px", value: "middle" },
          { label: "小 40px", value: "small" },
        ]}
        onChange={setSize}
      />
      <DemoSegmentedControl
        aria-label="分页位置"
        value={position}
        options={[
          { label: "右下角", value: "bottomRight" },
          { label: "左下角", value: "bottomLeft" },
          { label: "底部居中", value: "bottomCenter" },
        ]}
        onChange={setPosition}
      />
      <Table
        aria-label="属性预览表格"
        rowKey="key"
        columns={columns}
        dataSource={props.empty ? [] : people}
        size={size}
        border={props.border}
        borderCell={props.borderCell}
        hover={props.hover}
        stripe={props.stripe}
        loading={props.loading}
        showHeader={props.showHeader}
        rowSelection={props.checkbox ? {} : undefined}
        pagination={{ pageSize: 3, position }}
      />
    </div>
  );
}
