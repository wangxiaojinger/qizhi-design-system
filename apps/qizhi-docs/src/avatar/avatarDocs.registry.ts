import type { ComponentType } from "react";
import AutoFitDemo from "./demos/AutoFitDemo";
import autoFitSource from "./demos/AutoFitDemo.tsx?raw";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import GroupDemo from "./demos/GroupDemo";
import groupSource from "./demos/GroupDemo.tsx?raw";
import SizeShapeDemo from "./demos/SizeShapeDemo";
import sizeShapeSource from "./demos/SizeShapeDemo.tsx?raw";
import TriggerDemo from "./demos/TriggerDemo";
import triggerSource from "./demos/TriggerDemo.tsx?raw";

export interface AvatarDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  source: string;
}

export const avatarDemos: readonly AvatarDemoDefinition[] = [
  { id: "avatar-basic", title: "基础用法", description: "头像的基础使用。如果头像是文字的话，会自动调节字体大小，来适应头像框。", component: BasicDemo, source: basicSource },
  { id: "avatar-size-shape", title: "大小和形状", description: "通过设置 size 字段，可以调节头像的大小，默认大小为 40px。设置 shape 字段，可以设置头像是圆形 (circle) 还是正方形 (square)。", component: SizeShapeDemo, source: sizeShapeSource },
  { id: "avatar-group", title: "头像组", description: "使用 Avatar.Group 可以使用头像组功能，可通过 size 指定头像的大小。", component: GroupDemo, source: groupSource },
  { id: "avatar-trigger", title: "交互按钮", description: "可以通过 triggerIcon triggerType 来定制交互按钮，类型有 mask (遮罩) 和 button (按钮) 两种，通过 onTriggerClick 参数来添加回调。", component: TriggerDemo, source: triggerSource },
  { id: "avatar-auto-fit", title: "自动调整字体大小", description: "如果头像是文字的话，会自动调节字体大小，来适应头像框。", component: AutoFitDemo, source: autoFitSource },
];
