import { Button, Popconfirm } from "@wangxiaojinger/qizhi-react";

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
    <div className="popconfirm-placement-demo">
      {positions.map(([position, label]) => (
        <div key={position} className="popconfirm-placement-demo__item">
          <Popconfirm
            position={position}
            title="确认删除"
            content="确定要删除这条内容吗？"
          >
            <Button
              type="secondary"
              className="popconfirm-demo-trigger"
            >
              {label}
            </Button>
          </Popconfirm>
        </div>
      ))}
    </div>
  );
}
