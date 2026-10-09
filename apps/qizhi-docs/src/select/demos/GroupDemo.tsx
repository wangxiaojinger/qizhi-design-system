import { useState } from "react";
import { Select } from "@wangxiaojinger/qizhi-react";

const groupedCities = [
  {
    label: "华北",
    options: [
      { label: "北京", value: "北京" },
      { label: "天津", value: "天津" },
    ],
  },
  {
    label: "华东",
    options: [
      { label: "上海", value: "上海" },
      { label: "杭州", value: "杭州" },
    ],
  },
];

export default function GroupDemo() {
  const [event, setEvent] = useState("等待操作");
  return (
    <div className="select-docs-row">
      <Select
        className="select-docs-wide"
        mode="multiple"
        options={groupedCities}
        showSearch
        allowClear
        onFocus={() => setEvent("获得焦点")}
        onSelect={(value) => setEvent(`选择：${value}`)}
        onDeselect={(value) => setEvent(`取消：${value}`)}
        onClear={() => setEvent("清空选择")}
      />
      <span role="status">{event}</span>
    </div>
  );
}
