# QIZHI TimePicker React 契约 v1

状态：`approved_for_implementation`  
确认日期：2026-08-24

## 1. 迁移范围

- 迁移旧站 TimePicker 类目的 8 个 Demo，原始标题、说明、顺序、数据、
  布局、尺寸、初始状态和交互不变。
- React Demo 必须调用 `@wangxiaojinger/qizhi-react` 的正式 TimePicker，不得自行拼装
  input、列表或弹层。
- ConfigProvider 中的 1 个静态范围选择器暂不迁移，保留原运行时并执行回归。
- 预览、展示代码和复制代码读取同一 Demo TSX。

## 2. Demo 顺序与契约

1. 基础用法：“时间输入器的基础用法。”；空值，placeholder 为“请选择时间”。
2. 范围选择器：“时间输入器的范围选择器。”；开始和结束值均为空。
3. 不同状态：“不同状态的时间输入器。”；错误和警告的单值、范围共四项。
4. 受控组件：“`value` 和 `onChange` 需要配合使用。”；使用真实 React 受控状态。
5. 不同尺寸：“有四种尺寸可供选择。”；large/default/small/mini，初始 default。
6. 禁用：“禁用状态下不可输入和选择。”；空值和 `08:30:00`。
7. 定制时分：“通过设置 `format`，可以定制需要显示的时、分、秒。”；
   `HH:mm`、`09:24`、两列面板。
8. 定制步长：“通过设置 `step`，可以定制需要显示的时、分、秒的步长。”；
   初值 `10:25:30`，时/分/秒步长 2/5/10。

## 3. 公共 API

```ts
export type TimePickerSize = "mini" | "small" | "default" | "large";
export type TimePickerFormat = "HH:mm:ss" | "HH:mm";

export interface TimePickerStep {
  hour?: number;
  minute?: number;
  second?: number;
}

export interface TimePickerProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  format?: TimePickerFormat;
  step?: TimePickerStep;
  size?: TimePickerSize;
  status?: InputStatus;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
}

export interface TimeRangePickerProps {
  value?: readonly [string, string] | readonly [];
  defaultValue?: readonly [string, string] | readonly [];
  onChange?: (value: [string, string] | []) => void;
  placeholders?: readonly [string, string];
  format?: TimePickerFormat;
  step?: TimePickerStep;
  size?: TimePickerSize;
  status?: InputStatus;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
}
```

- 组件导出为 `TimePicker` 与 `TimePicker.RangePicker`。
- 默认格式为 `HH:mm:ss`，默认步长均为 1，默认尺寸为 `default`。
- 单值为空字符串；范围空值为空元组，范围值不自动排序。
- 根 ref 指向 `HTMLDivElement`；单值与范围类型不能混用。

## 4. 交互和无障碍

- 点击输入字段打开；点击外部、Escape 或再次点击单值字段关闭。
- Enter 和 Space 打开，关闭后恢复到原触发字段。
- 范围模式切换开始/结束字段时保持打开，选项立即写入当前字段。
- 时、分、秒使用 listbox/option 语义；方向键可移动，Enter/Space 选择。
- 禁用态不可聚焦、不可打开、不可触发 `onChange`。
- 浮层使用 Portal，默认位于触发器下方 4px，并约束在视口内。
- 单值宽 194px、范围宽 250px、`HH:mm` Demo 宽 130px；高度依次为
  large 36px、default 32px、small 28px、mini 24px。

## 5. 复用边界

- 复用 `controlContainerClassName`、Input 状态 Token、`TimeIcon`、公共浮层定位。
- 从 DatePicker 提取共享内部 TimePanel；DatePicker 默认三列行为不得改变。
- 尺寸 Demo 使用正式 `Radio.Group type="button"`。
- 文档操作区复用正式 Button、CodeIcon、CopyIcon 和公共代码高亮。
- TimePicker 内部可使用语义化只读 input；Demo 不得直接使用原生 input。

## 6. v1 明确不支持

- 12 小时制、时区、showNow、部分时段禁用、隐藏禁用项。
- 自定义底部按钮、图标、弹层位置、Portal 容器和受控 open。
- 自动排序、范围约束、手动自由输入、Date 或第三方日期对象值。

## 7. 验收门槛

- 类型、运行时、API 元数据、Demo 源码、展示与复制代码同源。
- 测试覆盖受控/非受控、范围、格式、步长、尺寸、状态、禁用、键盘和关闭路径。
- 1440、1024、375 三档检查几何、内部列宽、裁切祖先、视口边界和控制台。
- 打开态局部截图必须人工查看；执行者最高声明 `candidate_pass`。
