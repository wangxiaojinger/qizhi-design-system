import { useState } from "react";
import { Typography } from "@wangxiaojinger/qizhi-react";

const content = "QIZHI Design System 为设计、产品、AI 与前端提供统一且可执行的组件契约，让页面中的视觉规则、交互行为、代码调用和 API 描述保持一致。组件文档不仅用于展示效果，还需要成为可安装、可导入、可测试并可被准确调用的正式开发依据。";

export default function EllipsisDemo() {
  const [expanded, setExpanded] = useState(false);

  return <div className="typography-ellipsis-demo">
    <section><Typography.Title heading={5}>单行省略</Typography.Title><Typography.Ellipsis>{content}</Typography.Ellipsis></section>
    <section><Typography.Title heading={5}>多行省略</Typography.Title><Typography.Ellipsis rows={2}>{content}</Typography.Ellipsis></section>
    <section><Typography.Title heading={5}>展开与收起</Typography.Title><Typography.Ellipsis rows={2} expandable>{content}</Typography.Ellipsis></section>
    <section><Typography.Title heading={5}>禁用省略</Typography.Title><Typography.Ellipsis rows={2} disabled>{content}</Typography.Ellipsis></section>
    <section><Typography.Title heading={5}>受控展开</Typography.Title><Typography.Ellipsis rows={2} expanded={expanded} onExpand={setExpanded}>{content}</Typography.Ellipsis></section>
  </div>;
}
