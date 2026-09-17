import { Slider } from "@wangxiaojinger/qizhi-react";

export default function TooltipVisibleDemo() {
  return (
    <div className="slider-demo-row slider-demo-row--tooltip">
      <Slider
        className="slider-demo-tooltip-offset"
        defaultValue={19}
        tooltipVisible
        aria-label="持续显示单值提示"
      />
      <Slider
        range
        defaultValue={[0, 50]}
        tooltipVisible
        aria-label="持续显示范围提示"
      />
    </div>
  );
}
