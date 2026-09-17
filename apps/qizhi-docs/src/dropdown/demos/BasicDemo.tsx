import { Button, ChevronDownIcon, Dropdown } from "@wangxiaojinger/qizhi-react";

const menu = (
  <Dropdown.Menu>
    <Dropdown.Item itemKey="beijing">北京</Dropdown.Item>
    <Dropdown.Item itemKey="shanghai">上海</Dropdown.Item>
    <Dropdown.Item itemKey="guangzhou">广州</Dropdown.Item>
  </Dropdown.Menu>
);

export default function BasicDemo() {
  return (
    <div className="qizhi-dropdown-demo-row">
      <Dropdown droplist={menu}>
        <Button type="text">
          Hover
          <ChevronDownIcon className="qizhi-dropdown__arrow" />
        </Button>
      </Dropdown>
      <Button type="text" disabled>
        Hover
        <ChevronDownIcon className="qizhi-dropdown__arrow" />
      </Button>
    </div>
  );
}
