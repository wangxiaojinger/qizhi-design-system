import { useState } from "react";
import { Radio, TimePicker, type TimePickerSize } from "@wangxiaojinger/qizhi-react";

const sizes: readonly TimePickerSize[] = ["large", "default", "small", "mini"];

export default function SizeDemo() {
  const [size, setSize] = useState<TimePickerSize>("default");
  return (
    <div className="time-picker-size-demo">
      <Radio.Group
        type="button"
        value={size}
        options={sizes}
        aria-label="时间选择器尺寸"
        onChange={(value) => setSize(value as TimePickerSize)}
      />
      <TimePicker size={size} placeholder="请选择时间" />
    </div>
  );
}
