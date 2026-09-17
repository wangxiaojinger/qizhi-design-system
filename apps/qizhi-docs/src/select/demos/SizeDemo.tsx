import { useState } from "react";
import { Select } from "@wangxiaojinger/qizhi-react";
import type { SelectSize } from "@wangxiaojinger/qizhi-react";
import { cityOptions } from "./options";

const sizes: SelectSize[] = ["mini", "small", "default", "large"];

export default function SizeDemo() {
  const [index, setIndex] = useState(2);
  const size = sizes[index];

  return (
    <div className="select-docs-size">
      <label>
        组件尺寸
        <input
          aria-label="组件尺寸"
          type="range"
          min="0"
          max="3"
          value={index}
          onChange={(event) => setIndex(Number(event.target.value))}
        />
        <strong>{size}</strong>
      </label>
      <Select size={size} options={cityOptions} />
      <Select size={size} mode="multiple" options={cityOptions} />
    </div>
  );
}
