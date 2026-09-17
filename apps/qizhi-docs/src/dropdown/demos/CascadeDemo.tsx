import { Button, ChevronDownIcon, Dropdown } from "@wangxiaojinger/qizhi-react";

const cities = [
  { city: "北京", areas: ["海淀", "朝阳", "大兴"] },
  { city: "上海", areas: ["浦东", "黄浦", "徐汇"] },
  { city: "广州", areas: ["白云", "天河", "番禺"] },
  { city: "深圳", areas: ["福田", "罗湖", "南山"] },
];

const menu = (
  <Dropdown.Menu>
    {cities.map(({ city, areas }) => (
      <Dropdown.SubMenu key={city} itemKey={city} title={city}>
        {areas.map((area) => (
          <Dropdown.Item key={area} itemKey={area}>
            {area}
          </Dropdown.Item>
        ))}
      </Dropdown.SubMenu>
    ))}
  </Dropdown.Menu>
);

export default function CascadeDemo() {
  return (
    <Dropdown trigger="click" droplist={menu}>
      <Button type="text">
        Click
        <ChevronDownIcon className="qizhi-dropdown__arrow" />
      </Button>
    </Dropdown>
  );
}
