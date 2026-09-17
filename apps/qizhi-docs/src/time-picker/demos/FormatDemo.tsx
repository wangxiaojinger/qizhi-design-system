import { TimePicker } from "@wangxiaojinger/qizhi-react";

export default function FormatDemo() {
  return (
    <TimePicker
      className="time-picker-demo-compact"
      format="HH:mm"
      defaultValue="09:24"
      placeholder="请选择时间"
    />
  );
}
