import type { BusinessGuideProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type Item = ComponentApiItem<Extract<keyof BusinessGuideProps, string>>;
export const businessGuideApi = [
  { name: "title", description: "引导标题。", type: "ReactNode", defaultValue: "—" },
  { name: "highlight", description: "标题强调文案。", type: "ReactNode", defaultValue: "—" },
  { name: "subtitle", description: "平台说明。", type: "ReactNode", defaultValue: "—" },
  { name: "steps", description: "固定顺序的业务步骤。", type: "readonly BusinessGuideStep[]", defaultValue: "—" },
  { name: "closedText", description: "关闭后的状态文案。", type: "ReactNode", defaultValue: '"业务引导已关闭"' },
  { name: "onClose", description: "关闭时触发。", type: "() => void", defaultValue: "—" },
  { name: "onRestore", description: "恢复显示时触发。", type: "() => void", defaultValue: "—" },
  { name: "className", description: "根元素类名。", type: "string", defaultValue: "—" },
] as const satisfies readonly Item[];
