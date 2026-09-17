import { useState } from "react";
import { InputNumber, Slider, type SliderRangeValue } from "@wangxiaojinger/qizhi-react";

function SinglePair({ showSteps = false }: { showSteps?: boolean }) {
  const [value, setValue] = useState(80);
  return (
    <div className="slider-demo-input-item">
      <Slider
        className="slider-demo-input-slider"
        value={value}
        onChange={(next) => setValue(next as number)}
        aria-label={showSteps ? "带步进单值" : "单值"}
      />
      <InputNumber
        value={value}
        min={0}
        max={100}
        controls={showSteps ? "always" : "hidden"}
        className={showSteps ? "slider-demo-number--with-step" : undefined}
        aria-label={showSteps ? "带步进单值输入" : "单值输入"}
        onChange={(next) => setValue(Number(next ?? 0))}
      />
    </div>
  );
}

function RangePair({ showSteps = false }: { showSteps?: boolean }) {
  const [value, setValue] = useState<SliderRangeValue>([10, 80]);
  const values = value;
  const updateInput = (index: number, next: number) => {
    const updated = [...values];
    updated[index] = next;
    setValue(updated.sort((a, b) => a - b) as SliderRangeValue);
  };
  return (
    <div className="slider-demo-input-item slider-demo-input-item--range">
      <Slider
        className="slider-demo-input-slider"
        range
        value={value}
        onChange={setValue}
        aria-label={showSteps ? "带步进范围" : "范围"}
      />
      <div className="slider-demo-number-group">
        <InputNumber
          value={values[0]}
          min={0}
          max={100}
          controls={showSteps ? "always" : "hidden"}
          className={showSteps ? "slider-demo-number--with-step" : undefined}
          aria-label={showSteps ? "带步进范围起点" : "范围起点"}
          onChange={(next) => updateInput(0, Number(next ?? 0))}
        />
        <span className="slider-demo-number-separator" aria-hidden="true" />
        <InputNumber
          value={values[1]}
          min={0}
          max={100}
          controls={showSteps ? "always" : "hidden"}
          className={showSteps ? "slider-demo-number--with-step" : undefined}
          aria-label={showSteps ? "带步进范围终点" : "范围终点"}
          onChange={(next) => updateInput(1, Number(next ?? 0))}
        />
      </div>
    </div>
  );
}

export default function InputDemo() {
  return (
    <div className="slider-demo-input-grid">
      <SinglePair />
      <RangePair />
      <SinglePair showSteps />
      <RangePair showSteps />
    </div>
  );
}
