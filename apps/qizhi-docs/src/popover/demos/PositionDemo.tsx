import { Button, Popover } from "@wangxiaojinger/qizhi-react";

const positions = [
  ["topLeft", "上左"],
  ["top", "上"],
  ["topRight", "上右"],
  ["leftTop", "左上"],
  ["rightTop", "右上"],
  ["left", "左"],
  ["right", "右"],
  ["leftBottom", "左下"],
  ["rightBottom", "右下"],
  ["bottomLeft", "下左"],
  ["bottom", "下"],
  ["bottomRight", "下右"],
] as const;

export default function PositionDemo() {
  return (
    <div className="popover-placement-demo">
      {positions.map(([position, label]) => (
        <div key={position} className="popover-placement-demo__item">
          <Popover
            position={position}
            title="标题"
            content={
              <>
                这里是文本内容
                <br />
                这里是文本内容
              </>
            }
          >
            <Button type="secondary" className="popover-demo-trigger">
              {label}
            </Button>
          </Popover>
        </div>
      ))}
    </div>
  );
}
