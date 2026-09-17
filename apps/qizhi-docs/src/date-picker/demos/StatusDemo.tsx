import { DatePicker } from "@wangxiaojinger/qizhi-react";

export default function StatusDemo() {
  return (
    <div className="date-picker-docs-grid">
      <DatePicker status="error" />
      <DatePicker.RangePicker status="error" />
      <DatePicker status="warning" defaultValue="2026-08-15" />
      <DatePicker.RangePicker
        status="warning"
        defaultValue={["2026-08-10", "2026-08-20"]}
      />
    </div>
  );
}
