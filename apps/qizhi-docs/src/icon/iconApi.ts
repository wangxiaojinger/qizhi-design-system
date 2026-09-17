import type { ComponentApiItem } from "../api/ApiTable";

export const iconApi = [
  { name: "size", description: "同时设置图标宽高；显式 `width` 或 `height` 分别覆盖对应轴。", type: "number | string", defaultValue: '"1em"' },
  { name: "color", description: "单色图标使用 `currentColor`，继承当前文字颜色，也可通过属性或 CSS 设置；`fixedPalette` 多色图标保留固定色板。", type: "string", defaultValue: "继承" },
  { name: "className", description: "根 SVG 类名，可用于统一控制尺寸、颜色及其他展示样式。", type: "string", defaultValue: "-" },
  { name: "style", description: "根 SVG 内联样式；支持 `fontSize`、`color` 等原生 CSS 属性。", type: "CSSProperties", defaultValue: "-" },
  { name: "title", description: "为独立表达含义的图标提供可访问标题，并自动建立唯一标题关联。", type: "string", defaultValue: "-" },
  { name: "aria-label", description: "直接提供可访问名称；提供后图标使用 `role=img`。", type: "string", defaultValue: "-" },
  { name: "aria-labelledby", description: "关联页面中的可访问名称；提供后图标使用 `role=img`。", type: "string", defaultValue: "-" },
  { name: "ref", description: "指向根 SVG 元素。", type: "Ref<SVGSVGElement>", defaultValue: "-" },
] as const satisfies readonly ComponentApiItem[];

export const iconCatalogApi = [
  { name: "findIcons", description: "按关键词、语义、家族、样式、方向或状态查询图标 manifest。", type: "(query?: FindIconsQuery) => IconManifestItem[]", defaultValue: "-" },
  { name: "directionIconManifest", description: "方向指示类图标元数据。", type: "readonly DirectionIconManifestItem[]", defaultValue: "-" },
  { name: "promptIconManifest", description: "提示建议类图标元数据。", type: "readonly PromptIconManifestItem[]", defaultValue: "-" },
  { name: "interactionIconManifest", description: "交互按钮类图标元数据。", type: "readonly CatalogIconManifestItem[]", defaultValue: "-" },
  { name: "editIconManifest", description: "编辑类图标元数据。", type: "readonly CatalogIconManifestItem[]", defaultValue: "-" },
  { name: "trademarkIconManifest", description: "商标类图标元数据。", type: "readonly CatalogIconManifestItem[]", defaultValue: "-" },
  { name: "generalIconManifest", description: "通用类图标元数据。", type: "readonly CatalogIconManifestItem[]", defaultValue: "-" },
] as const satisfies readonly ComponentApiItem[];
