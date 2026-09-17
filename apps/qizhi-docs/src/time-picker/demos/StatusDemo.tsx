import { TimePicker } from "@wangxiaojinger/qizhi-react";

export default function StatusDemo() {
  return (
    <div className="time-picker-demo-stack">
      <div className="time-picker-demo-row">
        <TimePicker status="error" placeholder="错误状态" />
        <TimePicker.RangePicker status="error" placeholders={["错误状态", "错误状态"]} />
      </div>
      <div className="time-picker-demo-row">
        <TimePicker status="warning" placeholder="警告状态" />
        <TimePicker.RangePicker status="warning" placeholders={["警告状态", "警告状态"]} />
      </div>
    </div>
  );
}
