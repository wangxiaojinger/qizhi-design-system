import { Button, ChevronDownIcon, Dropdown } from "@wangxiaojinger/qizhi-react";

const menu = (
  <Dropdown.Menu onClickMenuItem={(key) => console.info(`You clicked ${key}`)}>
    <Dropdown.Item itemKey="Beijing">北京</Dropdown.Item>
    <Dropdown.Item itemKey="Shanghai">上海</Dropdown.Item>
    <Dropdown.Item itemKey="Guangzhou">广州</Dropdown.Item>
  </Dropdown.Menu>
);

export default function EventDemo() {
  return (
    <Dropdown droplist={menu}>
      <Button type="text">
        将鼠标悬停在我上面，然后点击项目
        <ChevronDownIcon className="qizhi-dropdown__arrow" />
      </Button>
    </Dropdown>
  );
}
