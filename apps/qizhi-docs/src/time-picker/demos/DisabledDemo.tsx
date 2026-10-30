import { TimePicker } from "@wangxiaojinger/qizhi-react";

export default function DisabledDemo() {
  return (
    <div className="time-picker-demo-row">
      <TimePicker disabled placeholder="请选择时间" />
      <TimePicker disabled defaultValue="08:30:00" />
      <TimePicker
        placeholder="禁用部分时间"
        disabledTime={() => ({ disabledHours: [0, 1, 2, 3, 4, 5] })}
      />
    </div>
  );
}
