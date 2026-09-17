import { Cascader } from "@wangxiaojinger/qizhi-react";

const options = [
  {
    label: "上海",
    value: "shanghai",
    children: [
      {
        label: "上海市",
        value: "shanghai-city",
        children: [{ label: "黄浦", value: "huangpu", isLeaf: true }],
      },
    ],
  },
];

const defaultValue = ["shanghai", "shanghai-city", "huangpu"];

export default function CustomTriggerDemo() {
  return (
    <div className="cascader-custom-trigger-wrap">
      <span className="cascader-custom-trigger-label">城市</span>
      <Cascader
        options={options}
        defaultValue={defaultValue}
        aria-label="选择城市"
        trigger={(props) => (
          <button {...props} className="cascader-custom-trigger">
            上海，上海市，黄浦
          </button>
        )}
      />
    </div>
  );
}
