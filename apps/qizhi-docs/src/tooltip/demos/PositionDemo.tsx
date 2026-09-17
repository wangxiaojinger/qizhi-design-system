import { Button, Tooltip } from "@wangxiaojinger/qizhi-react";
import type { TooltipPosition } from "@wangxiaojinger/qizhi-react";

const positions: Array<[TooltipPosition, string]> = [
  ["topLeft", "TL"],
  ["top", "Top"],
  ["topRight", "TR"],
  ["leftTop", "LT"],
  ["left", "Left"],
  ["leftBottom", "LB"],
  ["rightTop", "RT"],
  ["right", "Right"],
  ["rightBottom", "RB"],
  ["bottomLeft", "BL"],
  ["bottom", "Bottom"],
  ["bottomRight", "BR"],
];

const content = "This is a Tooltip";

export default function PositionDemo() {
  return (
    <div className="tooltip-docs-placement">
      {positions.map(([position, label]) => (
        <div
          className={`tooltip-docs-placement__item-${position}`}
          key={position}
        >
          <Tooltip content={content} position={position}>
            <Button type="secondary">{label}</Button>
          </Tooltip>
        </div>
      ))}
    </div>
  );
}
