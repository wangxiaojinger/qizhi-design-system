import { useState } from "react";
import { Button, Switch, Tooltip } from "@wangxiaojinger/qizhi-react";

export default function ControlledDemo() {
  const [visible, setVisible] = useState(true);

  return (
    <div className="tooltip-docs-controlled">
      <div className="tooltip-docs-controlled__switch">
        <span>显示气泡</span>
        <Switch
          size="small"
          checked={visible}
          aria-label="显示气泡"
          onChange={setVisible}
        />
      </div>
      <Tooltip
        content="这是一段文字气泡内容"
        trigger={[]}
        popupVisible={visible}
        onVisibleChange={setVisible}
      >
        <Button type="primary">气泡将显示</Button>
      </Tooltip>
    </div>
  );
}
