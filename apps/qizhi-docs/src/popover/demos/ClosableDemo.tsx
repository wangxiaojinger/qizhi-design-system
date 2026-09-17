import { useState } from "react";
import { Button, Popover, Space } from "@wangxiaojinger/qizhi-react";

export default function ClosableDemo() {
  const [visible, setVisible] = useState(false);
  const close = () => setVisible(false);
  return (
    <Popover
      trigger="click"
      position="right"
      role="dialog"
      popupVisible={visible}
      onVisibleChange={setVisible}
      title="浮层标题"
      content={<><p className="popover-closable-demo__copy">可以在浮层内放置关闭按钮或其他操作。</p><Space size="small" className="popover-closable-demo__actions"><Button type="text" size="small" onClick={close}>关闭</Button><Button type="primary" size="small" onClick={close}>确认</Button></Space></>}
    >
      <Button type="primary" className="popover-demo-trigger">点击弹出</Button>
    </Popover>
  );
}
