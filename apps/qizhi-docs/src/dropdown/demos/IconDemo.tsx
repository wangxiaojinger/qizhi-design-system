import { Button, ChevronDownIcon, Dropdown, MapPinIcon } from "@wangxiaojinger/qizhi-react";

const menu = (
  <Dropdown.Menu>
    <Dropdown.Item itemKey="beijing" icon={<MapPinIcon />}>
      北京
    </Dropdown.Item>
    <Dropdown.Item itemKey="shanghai" icon={<MapPinIcon />}>
      上海
    </Dropdown.Item>
    <Dropdown.Item itemKey="guangzhou" icon={<MapPinIcon />}>
      广州
    </Dropdown.Item>
  </Dropdown.Menu>
);

export default function IconDemo() {
  return (
    <Dropdown trigger="click" droplist={menu}>
      <Button type="text">
        点击我
        <ChevronDownIcon className="qizhi-dropdown__arrow" />
      </Button>
    </Dropdown>
  );
}
