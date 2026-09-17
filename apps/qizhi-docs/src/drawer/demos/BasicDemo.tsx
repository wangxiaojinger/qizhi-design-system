import { useState } from "react";
import { Button, Drawer } from "@wangxiaojinger/qizhi-react";

export default function BasicDemo() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <Button type="primary" aria-expanded={open} onClick={() => setOpen(true)}>
        打开抽屉
      </Button>
      <Drawer
        open={open}
        title="基础信息"
        onClose={close}
        footer={(
          <>
            <Button type="secondary" onClick={close}>取消</Button>
            <Button type="primary" onClick={close}>确定</Button>
          </>
        )}
      >
        <div className="drawer-demo-copy">
          <p>这里是抽屉中的示例文本。</p>
          <p>这里是抽屉中的示例文本。</p>
        </div>
      </Drawer>
    </>
  );
}
