import { useRef, useState } from "react";
import { Button, Input, Modal, Select } from "@wangxiaojinger/qizhi-react";

export default function AsyncDemo() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<string>();
  const [invalid, setInvalid] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const submit = async () => {
    if (!name || !gender) {
      setInvalid(true);
      nameRef.current?.focus();
      return;
    }
    await new Promise((resolve) => window.setTimeout(resolve, 1500));
    setOpen(false);
  };
  return (
    <>
      <Button type="primary" data-testid="modal-trigger" onClick={() => setOpen(true)}>
        使用异步逻辑打开模态框
      </Button>
      <Modal open={open} title="添加用户" onCancel={() => setOpen(false)} onOk={submit}>
        <form className="qizhi-modal-form" onSubmit={(event) => event.preventDefault()}>
          <label className="qizhi-modal-form__item">
            <span className="qizhi-modal-form__label is-required">姓名</span>
            <Input
              ref={nameRef}
              value={name}
              status={invalid && !name ? "error" : "default"}
              placeholder="请输入姓名"
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <div className="qizhi-modal-form__item">
            <span className="qizhi-modal-form__label is-required" id="modal-gender-label">
              性别
            </span>
            <Select
              value={gender}
              status={invalid && !gender ? "error" : "default"}
              options={[{ label: "男", value: "男" }, { label: "女", value: "女" }]}
              placeholder="请选择性别"
              aria-labelledby="modal-gender-label"
              onChange={(value) => setGender(value as string | undefined)}
            />
          </div>
        </form>
      </Modal>
    </>
  );
}
