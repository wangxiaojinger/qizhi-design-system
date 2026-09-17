import { DatePicker, InfoIcon } from "@wangxiaojinger/qizhi-react";

export default function PrefixDemo() {
  return (
    <div className="date-picker-docs-row">
      <DatePicker prefix={<InfoIcon />} />
      <DatePicker.RangePicker
        className="qizhi-date-picker--range-wide"
        prefix={<InfoIcon />}
      />
    </div>
  );
}
