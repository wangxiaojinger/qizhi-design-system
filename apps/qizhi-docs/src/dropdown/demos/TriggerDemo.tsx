import { Button, ChevronDownIcon, Dropdown } from "@wangxiaojinger/qizhi-react";

const menu = (
  <Dropdown.Menu>
    <Dropdown.Item itemKey="beijing">北京</Dropdown.Item>
    <Dropdown.Item itemKey="shanghai">上海</Dropdown.Item>
    <Dropdown.Item itemKey="guangzhou">广州</Dropdown.Item>
  </Dropdown.Menu>
);

export default function TriggerDemo() {
  return (
    <div className="qizhi-dropdown-demo-row">
      <Dropdown position="br" trigger="hover" droplist={menu}>
        <Button type="text">
          Hover
          <ChevronDownIcon className="qizhi-dropdown__arrow" />
        </Button>
      </Dropdown>
      <Dropdown position="br" trigger="click" droplist={menu}>
        <Button type="text">
          Click
          <ChevronDownIcon className="qizhi-dropdown__arrow" />
        </Button>
      </Dropdown>
    </div>
  );
}
