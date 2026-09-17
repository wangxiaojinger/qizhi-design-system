import { Alert, Button, CheckIcon } from "@wangxiaojinger/qizhi-react";

export default function CustomCloseDemo() {
  return <div className="alert-demo-grid">
    <Alert type="success" content="Here is a success text"
      closeElement={(close) => <Button type="text" icon={<CheckIcon />}
        aria-label="确认并关闭" onClick={close} />} />
    <Alert type="success" content="Here is a success text"
      closeElement={(close) => <Button type="text" onClick={close}>Close</Button>} />
  </div>;
}
