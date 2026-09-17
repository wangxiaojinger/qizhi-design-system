import { Dropdown, Link, Space } from "@wangxiaojinger/qizhi-react";

function DropdownChevron() {
  return <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function DropdownDemo() {
  const menu = <Dropdown.Menu><Dropdown.Item itemKey="beijing">北京</Dropdown.Item><Dropdown.Item itemKey="shanghai">上海</Dropdown.Item><Dropdown.Item itemKey="guangzhou">广州</Dropdown.Item></Dropdown.Menu>;
  return (
    <Space size="large">
      <Dropdown trigger="click" droplist={menu}><Link><span>City</span><DropdownChevron /></Link></Dropdown>
      <Link disabled><span>City</span><DropdownChevron /></Link>
    </Space>
  );
}
