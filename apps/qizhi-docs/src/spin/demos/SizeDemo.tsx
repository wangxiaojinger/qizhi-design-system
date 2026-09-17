import { Spin } from "@wangxiaojinger/qizhi-react";

export default function SizeDemo() {
  return (
    <div className="spin-size-demo" aria-label="加载图标尺寸示例">
      <Spin size={20} aria-label="20 像素加载图标" />
      <Spin size={30} aria-label="30 像素加载图标" />
      <Spin size={40} aria-label="40 像素加载图标" />
    </div>
  );
}
