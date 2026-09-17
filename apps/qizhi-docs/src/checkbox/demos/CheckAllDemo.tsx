import { useState } from "react";
import { Checkbox } from "@wangxiaojinger/qizhi-react";

const allValues = [1, 2, 3];

const App = () => {
  const [values, setValues] = useState<number[]>([1, 2]);
  const allChecked = values.length === allValues.length;

  return (
    <div className="checkbox-docs-check-all">
      <Checkbox
        checked={allChecked}
        indeterminate={values.length > 0 && !allChecked}
        onChange={(checked) => setValues(checked ? allValues : [])}
      >
        {allChecked ? "取消全选" : "全选"}
      </Checkbox>

      <Checkbox.Group
        value={values}
        options={allValues.map((value) => ({
          label: `选项 ${value}`,
          value,
        }))}
        onChange={(nextValues) => setValues(nextValues as number[])}
      />
    </div>
  );
};

export default App;
