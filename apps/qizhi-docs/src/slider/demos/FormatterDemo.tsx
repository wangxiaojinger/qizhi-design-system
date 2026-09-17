import { Slider } from "@wangxiaojinger/qizhi-react";

export default function FormatterDemo() {
  return (
    <Slider
      defaultValue={55}
      formatterTooltip={(value) => `${value}%`}
      aria-label="自定义提示"
    />
  );
}

