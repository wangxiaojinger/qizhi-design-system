import { Input } from "@wangxiaojinger/qizhi-react";

const trim = (value: string) => value.trim();

export default function NormalizeDemo() {
  return (
    <div className="input-format-demo">
      <label className="input-format-demo__item">
        <span>失去焦点时清除首尾空格：</span>
        <Input normalize={trim} normalizeTrigger="blur" placeholder="请输入内容" />
      </label>
      <label className="input-format-demo__item">
        <span>按下回车键时清除首尾空格：</span>
        <Input normalize={trim} normalizeTrigger="enter" placeholder="请输入内容" />
      </label>
    </div>
  );
}
