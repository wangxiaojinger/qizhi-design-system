import type { AvatarGroupProps, AvatarProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type AvatarApiItem = ComponentApiItem<Extract<keyof AvatarProps, string>>;
type AvatarGroupApiItem = ComponentApiItem<Extract<keyof AvatarGroupProps, string>>;

export const avatarApi = [
  { name: "children", description: "头像中的字符、QIZHI Icon 或图片内容；文本超出可用宽度时自动缩放。", type: "ReactNode", defaultValue: "—" },
  { name: "size", description: "使用 24px、32px、40px、64px 四档尺寸；在 `Avatar.Group` 内由 Group 的 size 统一覆盖。", type: '"mini" | "small" | "default" | "large"', defaultValue: '"default"' },
  { name: "shape", description: "使用圆形或 4px 圆角方形头像。", type: '"circle" | "square"', defaultValue: '"circle"' },
  { name: "triggerIcon", description: "触发入口使用的 QIZHI Icon；需要和 `onTriggerClick` 同时提供。", type: "ReactNode", defaultValue: "—" },
  { name: "triggerType", description: "将触发入口显示为覆盖遮罩或右下角按钮。", type: '"mask" | "button"', defaultValue: '"button"' },
  { name: "onTriggerClick", description: "激活触发入口时调用，不规定上传或其他业务行为。", type: "MouseEventHandler<HTMLButtonElement>", defaultValue: "—" },
  { name: "triggerAriaLabel", description: "触发按钮的可访问名称。", type: "string", defaultValue: '"操作头像"' },
  { name: "className", description: "Avatar 根节点的附加类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "Avatar 根节点的内联样式。", type: "CSSProperties", defaultValue: "—" },
] as const satisfies readonly AvatarApiItem[];

export const avatarGroupApi = [
  { name: "children", description: "参与分组展示的 Avatar 或普通 React 内容。", type: "ReactNode", defaultValue: "—" },
  { name: "size", description: "统一组内 Avatar 的尺寸和相邻重叠量。", type: '"mini" | "small" | "default" | "large"', defaultValue: '"default"' },
  { name: "className", description: "Avatar.Group 根节点的附加类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "Avatar.Group 根节点的内联样式。", type: "CSSProperties", defaultValue: "—" },
] as const satisfies readonly AvatarGroupApiItem[];
