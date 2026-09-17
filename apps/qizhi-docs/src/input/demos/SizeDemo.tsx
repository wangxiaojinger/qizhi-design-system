import { useState } from "react";
import { CalendarIcon, InfoIcon, Input, Radio, Slider } from "@wangxiaojinger/qizhi-react";

const sizes = ["mini", "small", "default", "large"] as const;

export default function SizeDemo() {
  const [size, setSize] = useState<(typeof sizes)[number]>("default");
  const [height, setHeight] = useState(32);
  const inputStyle = { height };

  const selectSize = (nextSize: (typeof sizes)[number]) => {
    const heights = { mini: 24, small: 28, default: 32, large: 36 };
    setSize(nextSize);
    setHeight(heights[nextSize]);
  };

  return (
    <div className="input-size-demo">
      <Radio.Group
        type="button"
        name="react-input-size"
        value={size}
        onChange={(value) => selectSize(value as (typeof sizes)[number])}
        aria-label="输入框尺寸"
      >
        {sizes.map((item) => (
          <Radio key={item} value={item}>{item}</Radio>
        ))}
      </Radio.Group>
      <div className="input-size-demo__slider">
        <span>自定义高度 <strong>{height}px</strong></span>
        <Slider
          min={24}
          max={60}
          value={height}
          aria-label="自定义输入框高度"
          onChange={(value) => setHeight(value as number)}
        />
      </div>
      <div className="input-size-demo__grid">
        <Input
          size={size}
          style={inputStyle}
          prefix={<CalendarIcon />}
          placeholder="请输入内容"
        />
        <Input
          size={size}
          style={inputStyle}
          suffix={<InfoIcon />}
          placeholder="请输入内容"
        />
        <Input
          size={size}
          style={inputStyle}
          addBefore="+86"
          placeholder="请输入电话号码"
        />
        <Input
          size={size}
          style={inputStyle}
          addAfter="千克"
          placeholder="请输入内容"
        />
      </div>
    </div>
  );
}
