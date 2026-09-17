import { TimePicker } from "@wangxiaojinger/qizhi-react";

export default function DisabledDemo() {
  return (
    <div className="time-picker-demo-row">
      <TimePicker disabled placeholder="请选择时间" />
      <TimePicker disabled defaultValue="08:30:00" />
    </div>
  );
}
