import { Button, Dropdown } from "@wangxiaojinger/qizhi-react";

const menu = (
  <Dropdown.Menu>
    <Dropdown.Item itemKey="1">菜单项 1</Dropdown.Item>
    <Dropdown.Item itemKey="2">菜单项 2</Dropdown.Item>
    <Dropdown.Item itemKey="3">菜单项 3</Dropdown.Item>
  </Dropdown.Menu>
);

const positions = [
  ["bl", "左下角"],
  ["bottom", "底部中心"],
  ["br", "右下角"],
  ["tl", "左上角"],
  ["top", "顶部"],
  ["tr", "右上角"],
] as const;

export default function PositionDemo() {
  return (
    <div className="qizhi-dropdown-demo-row">
      {positions.map(([position, label]) => (
        <Dropdown key={position} position={position} droplist={menu}>
          <Button type="secondary">{label}</Button>
        </Dropdown>
      ))}
    </div>
  );
}
