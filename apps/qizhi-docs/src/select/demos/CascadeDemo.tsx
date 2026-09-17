import { useState } from "react";
import { Select } from "@wangxiaojinger/qizhi-react";

const cities: Record<string, string[]> = {
  四川: ["成都", "绵阳", "乐山"],
  广东: ["广州", "深圳", "佛山"],
  浙江: ["杭州", "宁波", "温州"],
};

export default function CascadeDemo() {
  const [province, setProvince] = useState("四川");
  const [city, setCity] = useState("成都");
  const provinceOptions = Object.keys(cities).map((value) => ({
    label: value,
    value,
  }));
  const cityOptions = cities[province].map((value) => ({
    label: value,
    value,
  }));

  const handleProvinceChange = (value: string | number | undefined) => {
    if (value === undefined) return;
    const nextProvince = String(value);
    setProvince(nextProvince);
    setCity(cities[nextProvince][0]);
  };

  return (
    <div className="select-docs-row">
      <Select
        className="select-docs-narrow"
        options={provinceOptions}
        value={province}
        onChange={handleProvinceChange}
      />
      <Select
        className="select-docs-narrow"
        options={cityOptions}
        value={city}
        onChange={(value) => setCity(String(value))}
      />
    </div>
  );
}
