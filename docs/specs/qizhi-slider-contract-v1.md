# QIZHI Slider API 契约 v1

状态：`candidate_pass`，独立最终验收 `pending`  
负责人：QIZHI 组件迁移  
证据日期：2026-08-24

## 1. 目标与边界

- 将旧站 9 个 Slider Demo 迁移为 `@wangxiaojinger/qizhi-react` 正式组件。
- 保留标题、原始说明、顺序、数据、布局、尺寸、初始状态和交互。
- “显示输入框”使用 `Slider + InputNumber` 组合，不提供 `showInput`。
- v1.1 增加完成回调与 Tooltip 配置，但不增加 `showInput`、`reverse`、
  `showTicks`、`snapToMarks`、`getIntervalConfig` 或状态色。

## 2. 证据清单

| 证据 | 位置 | 结论 |
|---|---|---|
| 旧站 9 个 Demo | `index.html#component-slider` | 可见内容与初始状态 |
| 公共视觉与响应式 | `styles.css` 的 Slider 规则 | 轨道、滑块、禁用、竖直、刻度尺寸 |
| 原始交互 | `script.js:initSliderDemos` | 指针、键盘、同步、整体拖拽 |
| 现有 React 资产 | `packages/qizhi-react/src` | 复用 Tooltip、InputNumber、Button、图标体系 |

## 3. 能力决策

| 能力 | 决策 | 契约结论 |
|---|---|---|
| 单值、范围、多点 | 保留 | 使用 `range` / `multiple` 显式区分模式 |
| min/max/step | 保留 | 默认 `0/100/1` |
| disabled、vertical | 保留 | 布尔属性 |
| marks | 保留 | `Record<number, ReactNode>` |
| Tooltip 显隐 | 保留 | `tooltipVisible` |
| Tooltip 格式化 | 保留 | `formatterTooltip` |
| Tooltip 位置与容器 | 新增 | 复用公共 Tooltip 的类型和 `getPopupContainer` |
| 调整完成回调 | 新增 | `onChangeComplete`，不绑定鼠标事件名 |
| 范围整体拖拽 | 保留 | `range.draggableBar`，仅双值有效 |
| 显示输入框 | 修改 | Demo 组合公共 InputNumber 及其 `controls` API |
| 音量图标 | 修改 | 新增公共 `VolumeUpIcon` |
| showInput | 不引入 | 保持 Slider 与 InputNumber 公共组合 |
| reverse/showTicks/snapToMarks/getIntervalConfig | 暂不引入 | 缺少 QIZHI 业务证据 |

## 4. 公共 API

```ts
export type SliderRangeValue = [number, number];
export type SliderMultipleValue = [number, number, number, ...number[]];
export type SliderValue = number | SliderRangeValue | SliderMultipleValue;

export interface SliderRangeConfig {
  draggableBar?: boolean;
}

export interface SliderBaseProps {
  min?: number;
  max?: number;
  step?: number;
  vertical?: boolean;
  disabled?: boolean;
  marks?: Record<number, ReactNode>;
  tooltipVisible?: boolean;
  tooltipPosition?: TooltipPosition;
  formatterTooltip?: (value: number) => ReactNode;
  getPopupContainer?: (trigger: HTMLElement) => Element;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
}

export interface SliderSingleProps extends SliderBaseProps {
  range?: false;
  multiple?: false;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  onChangeComplete?: (value: number) => void;
}

export interface SliderRangeProps extends SliderBaseProps {
  range: true | SliderRangeConfig;
  multiple?: false;
  value?: SliderRangeValue;
  defaultValue?: SliderRangeValue;
  onChange?: (value: SliderRangeValue) => void;
  onChangeComplete?: (value: SliderRangeValue) => void;
}

export interface SliderMultipleProps extends SliderBaseProps {
  range?: false;
  multiple: true;
  value?: SliderMultipleValue;
  defaultValue?: SliderMultipleValue;
  onChange?: (value: SliderMultipleValue) => void;
  onChangeComplete?: (value: SliderMultipleValue) => void;
}

export type SliderProps =
  | SliderSingleProps
  | SliderRangeProps
  | SliderMultipleProps;
```

- `value` 存在时为受控模式，否则使用 `defaultValue`。
- 单值回调返回 `number`；范围回调返回两元组；多点回调返回至少三元组。
- 值按 step 对齐并限制在 min/max 内。
- `range` 只接受双值数组；`multiple` 只接受三个及以上数值。
- `onChange` 在调整过程中触发；`onChangeComplete` 在一次指针或键盘调整完成后触发。
- `tooltipVisible` 为 `undefined` 时跟随交互，`true` 持续显示，`false` 持续隐藏。
- `tooltipPosition` 和 `getPopupContainer` 直接复用公共 Tooltip 契约。
- 根 ref 指向 `HTMLDivElement`。

## 5. DOM、样式和交互

- 根类名 `qizhi-slider`；状态类只使用 `qizhi-*`。
- 水平组件高 32px、轨道高 2px、滑块 12px，hover/active 14px。
- 竖直轨道高 160px；Tooltip 复用公共 Portal 实现。
- 每个滑块使用按钮和 `role="slider"`，同步 min/max/now/text/disabled。
- 支持轨道点击、滑块拖动、Arrow、Home、End，并分开过程值与完成值回调。
- 禁用态不可聚焦、不可拖动、不可触发 onChange。
- `range.draggableBar` 保持双值跨度并限制整体边界。
- Demo 不得通过 `qizhi-input-number__*` 等私有后代类修改公共组件。
- Demo 布局类不得成为公共 API。

## 6. Demo 顺序

1. 基本用法
2. 基础状态
3. 范围选择
4. 多点选择
5. 显示输入框
6. 竖直滑动条
7. 控制 tooltip 的展示（说明为空）
8. 自定义提示
9. 范围刻度可拖拽

预览、展示代码和复制代码必须读取同一 Demo TSX 文件。

## 7. 测试与发布门槛

- 类型：单值、范围、多点的有效组合与非法组合、ref 和模式收窄回调。
- 单元：受控/非受控、归一化、过程/完成回调、键盘、禁用、marks、
  Tooltip 位置/容器和整体拖拽。
- 文档：9 个 Demo 的原始顺序/文案、公共导入、同源代码、API 一致。
- E2E：真实指针和键盘交互、InputNumber 同步、几何、样式、三视口、截图。
- Watermark 与 Upload 暂留静态实现；不得因 Slider React 迁移破坏其交互。
