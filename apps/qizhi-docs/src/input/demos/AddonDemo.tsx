import { useState } from "react";
import { Button, ChevronDownIcon, Dropdown, Input } from "@wangxiaojinger/qizhi-react";

const timeUnits = ["分钟", "小时", "天"];

function TimeUnitDropdown() {
  const [unit, setUnit] = useState("分钟");
  const menu = (
    <Dropdown.Menu onClickMenuItem={setUnit}>
      {timeUnits.map((item) => (
        <Dropdown.Item itemKey={item} key={item}>{item}</Dropdown.Item>
      ))}
    </Dropdown.Menu>
  );

  return (
    <Dropdown
      className="input-demo-addon-dropdown"
      droplist={menu}
      position="br"
      trigger="click"
    >
      <Button
        type="text"
        className="input-demo-dropdown__trigger"
        aria-label={`时间单位：${unit}`}
      >
        <span>{unit}</span>
        <ChevronDownIcon className="input-demo-dropdown__arrow" />
      </Button>
    </Dropdown>
  );
}

export default function AddonDemo() {
  return (
    <div className="input-addon-demo">
      <Input addAfter="人民币" placeholder="输入金额" />
      <Input addBefore="+86" placeholder="请输入电话号码" />
      <Input
        placeholder="请输入"
        addAfter={<TimeUnitDropdown />}
      />
      <Input addBefore="www." addAfter=".com" placeholder="输入主机" />
    </div>
  );
}
