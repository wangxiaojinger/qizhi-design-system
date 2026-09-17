import { useState } from "react";
import { Button, Checkbox } from "@wangxiaojinger/qizhi-react";

const App = () => {
  const [checked, setChecked] = useState(false);

  return (
    <div className="checkbox-docs-controlled">
      <div className="checkbox-docs-row">
        <Checkbox checked={checked} onChange={setChecked}>
          复选框
        </Checkbox>
        <Checkbox checked={checked} disabled>
          禁用复选框
        </Checkbox>
      </div>
      <Button
        type="primary"
        onClick={() => setChecked((current) => !current)}
      >
        {checked ? "取消选中" : "选中"}
      </Button>
    </div>
  );
};

export default App;
