import {
  ArrowLeftIcon,
  ArrowRightIcon,
  Button,
  Steps,
} from "@wangxiaojinger/qizhi-react";
import { useState } from "react";

const items = [
  { title: "成功" },
  { title: "进行中" },
  { title: "待办" },
];

export default function SwitchDemo() {
  const [current, setCurrent] = useState(1);

  return (
    <>
      <Steps
        items={items}
        current={current}
        aria-label="可切换的步骤条"
      />
      <div className="steps-switch-panel">
        <p className="steps-switch-content" aria-live="polite">
          步骤 {current} 内容
        </p>
        <div className="steps-switch-actions">
          <Button
            type="secondary"
            icon={<ArrowLeftIcon />}
            disabled={current === 1}
            onClick={() => setCurrent((step) => Math.max(1, step - 1))}
          >
            后退
          </Button>
          <Button
            type="primary"
            icon={<ArrowRightIcon />}
            iconPosition="after"
            disabled={current === items.length}
            onClick={() => (
              setCurrent((step) => Math.min(items.length, step + 1))
            )}
          >
            下一个
          </Button>
        </div>
      </div>
    </>
  );
}
