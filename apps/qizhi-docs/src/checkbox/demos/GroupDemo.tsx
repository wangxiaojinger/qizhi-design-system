import { Checkbox } from "@wangxiaojinger/qizhi-react";

const App = () => {
  return (
    <div className="checkbox-docs-group-stack">
      <Checkbox.Group defaultValue={["A", "B", "C"]}>
        <Checkbox value="A">选项 A</Checkbox>
        <Checkbox value="B">选项 B</Checkbox>
        <Checkbox value="C">选项 C</Checkbox>
      </Checkbox.Group>

      <Checkbox.Group
        defaultValue={[1, 3]}
        options={[
          { label: "选项 1", value: 1 },
          { label: "选项 2", value: 2, disabled: true },
          { label: "选项 3", value: 3 },
          { label: "选项 4", value: 4 },
        ]}
      />

      <Checkbox.Group
        direction="vertical"
        defaultValue={["vertical-a", "vertical-b", "vertical-c"]}
      >
        <Checkbox value="vertical-a">选项 A</Checkbox>
        <Checkbox value="vertical-b">选项 B</Checkbox>
        <Checkbox value="vertical-c">选项 C</Checkbox>
      </Checkbox.Group>
    </div>
  );
};

export default App;
