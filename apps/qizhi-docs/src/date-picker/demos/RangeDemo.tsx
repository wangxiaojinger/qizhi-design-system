import { useState } from "react";
import { DatePicker } from "@wangxiaojinger/qizhi-react";
import type { DatePickerMode } from "@wangxiaojinger/qizhi-react";
import { DemoSegmentedControl } from "../../demo-controls/DemoSegmentedControl";

type RangeMode = DatePickerMode | "datetime";
const options = [
  { label: "日期", value: "date" },
  { label: "周", value: "week" },
  { label: "月", value: "month" },
  { label: "年", value: "year" },
  { label: "季度", value: "quarter" },
  { label: "日期时间", value: "datetime" },
] as const;

export default function RangeDemo() {
  const [mode, setMode] = useState<RangeMode>("date");

  return (
    <div className="date-picker-docs-range">
      <DemoSegmentedControl
        value={mode}
        options={options}
        onChange={setMode}
        aria-label="范围选择器类型"
      />
      <DatePicker.RangePicker
        className="qizhi-date-picker--range-wide"
        mode={mode === "datetime" ? "date" : mode}
        showTime={mode === "datetime"}
      />
    </div>
  );
}
