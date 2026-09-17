import { Slider } from "@wangxiaojinger/qizhi-react";

export default function DraggableBarDemo() {
  return (
    <Slider
      max={10}
      defaultValue={[3, 6]}
      range={{ draggableBar: true }}
      aria-label="可拖拽范围"
    />
  );
}

