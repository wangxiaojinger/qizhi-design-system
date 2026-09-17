import { TimePicker } from "@wangxiaojinger/qizhi-react";

export default function StepDemo() {
  return (
    <TimePicker
      defaultValue="10:25:30"
      step={{ hour: 2, minute: 5, second: 10 }}
      placeholder="请选择时间"
    />
  );
}
