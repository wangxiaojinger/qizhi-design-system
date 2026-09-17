import { Radio } from "@wangxiaojinger/qizhi-react";

const App = () => {
  return (
    <div className="radio-docs-group-stack">
      <Radio.Group defaultValue="a" aria-label="children 写法">
        <Radio value="a">选项一</Radio>
        <Radio value="b">选项二</Radio>
        <Radio value="c">选项三</Radio>
        <Radio value="d" disabled>选项四</Radio>
      </Radio.Group>
      <Radio.Group options={["选项一", "选项二", "选项三", "选项四"]} aria-label="options 字符串数组" />
      <Radio.Group
        options={[
          { label: "选项一", value: "a" },
          { label: "选项二", value: "b" },
          { label: "选项三", value: "c" },
          { label: "选项四", value: "d", disabled: true },
        ]}
        aria-label="options 对象数组"
      />
    </div>
  );
};

export default App;
