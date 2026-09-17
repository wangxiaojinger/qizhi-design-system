import { Slider, VolumeUpIcon } from "@wangxiaojinger/qizhi-react";

export default function VerticalDemo() {
  return (
    <div className="slider-demo-vertical-row">
      <div className="slider-demo-vertical-volume">
        <Slider vertical defaultValue={10} aria-label="竖直音量" />
        <VolumeUpIcon className="slider-demo-sound" />
      </div>
      <Slider
        vertical
        range
        max={20}
        defaultValue={[5, 10]}
        marks={{ 5: "5km", 10: "10km" }}
        aria-label="竖直范围"
      />
    </div>
  );
}

