import { DatePicker } from "@wangxiaojinger/qizhi-react";

export default function ShowTimeDemo() {
  return (
    <div className="date-picker-docs-row date-picker-docs-row--wide">
      <DatePicker showTime defaultValue="2026-08-15 04:05:06" />
      <DatePicker.RangePicker
        showTime
        defaultValue={["2026-08-15 00:00:00", "2026-08-15 04:05:00"]}
      />
    </div>
  );
}
