import { Cascader } from "@wangxiaojinger/qizhi-react";
import type { CascaderOption } from "@wangxiaojinger/qizhi-react";

const options = [
  {
    label: "北京",
    value: "beijing",
    children: [{ label: "朝阳", value: "chaoyang" }],
  },
  {
    label: "上海",
    value: "shanghai",
    children: [{ label: "黄浦", value: "huangpu" }],
  },
];

const filterByValue = (input: string, path: CascaderOption[]) =>
  path.some((option) => String(option.value).includes(input));

export default function CustomSearchDemo() {
  return (
    <div className="cascader-docs-row">
      <Cascader
        options={options}
        showSearch
        filterOption={filterByValue}
      />
      <Cascader
        mode="multiple"
        options={options}
        showSearch
        filterOption={filterByValue}
      />
    </div>
  );
}
