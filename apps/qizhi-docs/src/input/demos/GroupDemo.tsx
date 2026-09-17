import { useState } from "react";
import {
  Button,
  CalendarIcon,
  ChevronDownIcon,
  Dropdown,
  Input,
  SearchIcon,
} from "@wangxiaojinger/qizhi-react";

const cities = ["北京", "天津", "上海"];

function City() {
  const [city, setCity] = useState("北京");
  const menu = (
    <Dropdown.Menu onClickMenuItem={setCity}>
      {cities.map((item) => (
        <Dropdown.Item itemKey={item} key={item}>{item}</Dropdown.Item>
      ))}
    </Dropdown.Menu>
  );

  return (
    <Dropdown
      className="input-demo-city-dropdown"
      droplist={menu}
      position="bl"
      trigger="click"
    >
      <Button
        type="text"
        className="input-demo-dropdown__trigger"
        aria-label={`城市：${city}`}
      >
        <span>{city}</span>
        <ChevronDownIcon className="input-demo-dropdown__arrow" />
      </Button>
    </Dropdown>
  );
}

export default function GroupDemo() {
  return (
    <div className="input-combo-demo">
      <Input addBefore={<City />} placeholder="请输入地址" />
      <Input
        addBefore={<City />}
        suffix={<CalendarIcon />}
        placeholder="请选择日期"
      />
      <Input addBefore={<City />} suffix={<SearchIcon />} placeholder="搜索" />
      <Input.Group aria-label="电话组合">
        <Input readOnly value="010" aria-label="区号" />
        <Input placeholder="电话号码" aria-label="电话号码" />
      </Input.Group>
      <div className="input-combo-demo__loose">
        <Input readOnly value="010" aria-label="区号" />
        <span aria-hidden="true">−</span>
        <Input
          defaultValue="8899887"
          placeholder="电话号码"
          aria-label="电话号码"
        />
      </div>
    </div>
  );
}
