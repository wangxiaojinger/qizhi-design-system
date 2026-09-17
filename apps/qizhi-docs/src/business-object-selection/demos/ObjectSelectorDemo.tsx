import { ObjectSelector } from "@wangxiaojinger/qizhi-react";
import type { ObjectSelectorItem } from "@wangxiaojinger/qizhi-react";

const models: readonly ObjectSelectorItem[] = [
  {
    value: "inf-v2",
    name: "INF-v2-8k",
    description: "面向通用文本生成的基础模型。",
    meta: "@ kevin　生成于 具身智能　|　面向通用文本生成",
    project: "embodied",
    versions: [
      { value: "V2", description: "推理性能优化" },
      { value: "V1", description: "初始版本" },
    ],
  },
  {
    value: "inf-128k",
    name: "INF-v1-128k",
    description: "支持 128K 长上下文的语言模型。",
    meta: "@ anyi　生成于 具身智能　|　支持长上下文",
    project: "embodied",
    versions: [
      { value: "V3", description: "支持更稳定的长上下文推理" },
      { value: "V2", description: "模型存储路径更新" },
      { value: "V1", description: "初始版本" },
    ],
  },
  {
    value: "inf-vision",
    name: "INF-1.5-vision-pro",
    description: "具备优秀的多模态理解和指令遵循能力。",
    meta: "@ anyi　生成于 具身智能　|　视觉语言模型",
    project: "embodied",
    versions: [
      { value: "V2", description: "提升图文理解能力" },
      { value: "V1", description: "初始版本" },
    ],
  },
];

export default function ObjectSelectorDemo() {
  return (
    <ObjectSelector
      label="选择模型"
      items={models}
      projects={[
        { label: "全部", value: "all" },
        { label: "具身智能", value: "embodied" },
      ]}
      defaultValue={{ object: "inf-v2", version: "V2" }}
    />
  );
}
