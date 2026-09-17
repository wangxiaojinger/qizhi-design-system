import type { ComponentType } from "react";
import AlertDemo from "./demos/AlertDemo";
import alertSource from "./demos/AlertDemo.tsx?raw";
import AsyncDemo from "./demos/AsyncDemo";
import asyncSource from "./demos/AsyncDemo.tsx?raw";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import ConfirmDemo from "./demos/ConfirmDemo";
import confirmSource from "./demos/ConfirmDemo.tsx?raw";
import FooterDemo from "./demos/FooterDemo";
import footerSource from "./demos/FooterDemo.tsx?raw";
import ManualDemo from "./demos/ManualDemo";
import manualSource from "./demos/ManualDemo.tsx?raw";
import StepsDemo from "./demos/StepsDemo";
import stepsSource from "./demos/StepsDemo.tsx?raw";

export interface ModalDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  tsxSource: string;
}

export const modalDemos: readonly ModalDemoDefinition[] = [
  { id: "对话框-基础用法", title: "基础用法", description: "文本信息对话框。",
    component: BasicDemo, tsxSource: basicSource },
  { id: "对话框-异步关闭", title: "异步关闭",
    description: "在对话框中使用表单时，如提交表单，点击确定后异步关闭对话框。",
    component: AsyncDemo, tsxSource: asyncSource },
  { id: "对话框-自定义页脚", title: "自定义页脚",
    description: "通过按钮属性分别配置确定和取消操作；复杂场景可以直接传入自定义页脚，也可以隐藏页脚。",
    component: FooterDemo, tsxSource: footerSource },
  { id: "对话框-确认对话框", title: "确认对话框",
    description: "使用 Modal.confirm() 可以快速弹出确认对话框。",
    component: ConfirmDemo, tsxSource: confirmSource },
  { id: "对话框-手动更新和移除", title: "手动更新和移除",
    description: "手动更新和关闭通过 Modal 方法创建的对话框。",
    component: ManualDemo, tsxSource: manualSource },
  { id: "对话框-带有通知对话框", title: "带有通知对话框",
    description: "在对话框中显示 Alert。", component: AlertDemo, tsxSource: alertSource },
  { id: "对话框-带有步骤条对话框", title: "带有步骤条对话框",
    description: "带有横向步骤条的对话框。", component: StepsDemo, tsxSource: stepsSource },
];
