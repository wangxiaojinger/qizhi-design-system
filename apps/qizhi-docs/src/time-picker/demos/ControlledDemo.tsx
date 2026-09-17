import { useState } from "react";
import { TimePicker } from "@wangxiaojinger/qizhi-react";

export default function ControlledDemo() {
  const [value, setValue] = useState("");
  return <TimePicker value={value} onChange={setValue} placeholder="请选择时间" />;
}
