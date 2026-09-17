# QIZHI Avatar API 契约 v1

状态：待审定  
负责人：林猫猫  
证据日期：2026-08-21

## 1. 目标与边界

- 用户任务：将旧规范站的头像 Avatar 迁移为 `@wangxiaojinger/qizhi-react` 正式组件，并保持旧站 5 个 Demo 的标题、说明、数量、布局、尺寸、状态和交互边界。
- 业务场景：以图片、图标或字符展示用户、组织或系统身份；以重叠头像组展示多个身份；为头像提供遮罩型或按钮型触发入口。
- v1 解决的问题：统一头像内容、40/64/32/24px 尺寸、圆形/方形、文字自适应、头像组和两种触发入口。
- v1 明确不解决的问题：图片加载失败回退、头像上传、在线状态、徽标、Tooltip、头像组最大展示数量、自动折叠、超量菜单、Dropdown、拖拽排序和业务数据请求。

## 2. 证据清单

| 证据 | 位置 | 可证明什么 | 不能证明什么 |
|---|---|---|---|
| 原规范站 Avatar 页面 | `index.html#component-avatar` | 5 个 Demo 的标题、说明、顺序、内容数量和静态 DOM | React Props、事件参数和受控模式 |
| Avatar 样式 | `styles.css` 的 `.avatar-*`、`.qizhi-avatar-*` | 64/40/32/24px、圆形/4px 方形、组重叠、颜色、触发入口和文字缩放 | 样式类是否应直接成为公共 API |
| 原生脚本 | `script.js` 全文检索 | Avatar 规范页没有初始化函数或可观察的点击反馈 | `onClick` 触发后的业务行为 |
| 1440px 浏览器实测 | 2026-08-21 旧站只读渲染 | 实际几何、两行/单行排列、组重叠和无页面横向溢出 | React 实现是否已经一致 |
| 已有 React 公共组件 | `packages/qizhi-react/src` | 可复用 `Space`、`Button`、`UserIcon`、`EditIcon`、文档操作组件 | Camera 图标当前不存在 |

## 3. 能力决策

| 能力 | 决策 | 契约结论 | 依据 |
|---|---|---|---|
| 字符、图标、图片内容 | 保留 | 统一由 `children` 承载 | 旧站基础用法 |
| 四档尺寸 | 保留 | `size` 支持 `mini/small/default/large`，默认 `default` | 旧站大小和形状 |
| 数字尺寸 | 删除 | v1 不接受任意数字 | 旧站只有四个稳定尺寸，避免虚构布局能力 |
| 圆形、方形 | 保留 | `shape` 支持 `circle/square`，默认 `circle` | 旧站大小和形状 |
| 文字自动缩放 | 保留并修改 | 组件根据内容实际宽度计算缩放，不暴露旧站按单词写死的类名 | 两处旧站说明和四个缩放示例 |
| 图片布局 | 保留 | 图片内容铺满头像；图片自身的 `alt`、加载和错误处理由消费者负责 | 旧站 Logo 图片示例 |
| 头像组 | 保留 | 导出 `Avatar.Group`，统一子头像尺寸并按尺寸重叠 | 旧站头像组 |
| 超量数量计算 | 删除 | `+3` 仅是普通 Avatar 内容，不新增 `maxCount` | 旧站没有计算或菜单行为 |
| 遮罩触发入口 | 保留 | `triggerType="mask"` 时触发器覆盖头像 | 旧站交互按钮 |
| 右下角触发按钮 | 保留并修改 | `triggerType="button"` 时复用 24px 正式 Button | 用户已确认允许与旧站 18px 存在差异 |
| 触发图标 | 保留 | `triggerIcon` 接受 ReactNode；Demo 复用公共 Icon | 旧站 `triggerIcon` 文案与 UI |
| 触发回调 | 保留并收窄 | `onTriggerClick` 只表示触发入口激活，不规定上传或反馈业务 | 旧站只有回调文案，没有运行时反馈 |
| Dropdown | 删除 | Avatar v1 不依赖、不内置 Dropdown | 旧站 5 个 Demo 均无浮层菜单 |
| Camera 图标 | 修改 | 新增正式 `CameraIcon`，视觉语义匹配旧站线性相机图标 | 用户确认先进入公共 Icon；不得继续使用 Remix 类名 |

## 4. 公共 API

```ts
export type AvatarSize = "mini" | "small" | "default" | "large";
export type AvatarShape = "circle" | "square";
export type AvatarTriggerType = "mask" | "button";

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, "onClick"> {
  children?: ReactNode;
  size?: AvatarSize;
  shape?: AvatarShape;
  triggerIcon?: ReactNode;
  triggerType?: AvatarTriggerType;
  onTriggerClick?: MouseEventHandler<HTMLButtonElement>;
  triggerAriaLabel?: string;
}

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  size?: AvatarSize;
}

export interface AvatarComponent {
  (props: AvatarProps & RefAttributes<HTMLSpanElement>): ReactElement;
  Group: ForwardRefExoticComponent<AvatarGroupProps & RefAttributes<HTMLDivElement>>;
}
```

| 属性 | 类型 | 默认值 | 描述 | 组合/互斥规则 |
|---|---|---|---|---|
| `children` | `ReactNode` | `-` | 展示字符、Icon 或图片；文本内容在可用空间不足时自动缩放 | 不判断业务内容类型 |
| `size` | `AvatarSize` | `default` | 使用 24/32/40/64px 四档尺寸 | 在 Group 内由 Group 的 `size` 统一覆盖 |
| `shape` | `AvatarShape` | `circle` | 设置圆形或 4px 圆角方形 | 无 |
| `triggerIcon` | `ReactNode` | `-` | 设置触发入口图标 | 仅和 `triggerType`、`onTriggerClick` 共同出现时渲染入口 |
| `triggerType` | `AvatarTriggerType` | `button` | 设置覆盖遮罩或右下角按钮 | 缺少 `triggerIcon` 或 `onTriggerClick` 时不渲染入口 |
| `onTriggerClick` | `MouseEventHandler<HTMLButtonElement>` | `-` | 激活触发入口时调用 | 不等同于头像根节点点击 |
| `triggerAriaLabel` | `string` | `操作头像` | 为触发入口提供可访问名称 | 触发入口存在时生效 |
| `Avatar.Group size` | `AvatarSize` | `default` | 统一组内直接 Avatar 子项的尺寸与重叠量 | 不修改非 Avatar 子节点 |

- 原生属性继承范围：Avatar 根节点继承 `HTMLAttributes<HTMLSpanElement>`，但不继承根节点 `onClick`；Group 继承 `HTMLAttributes<HTMLDivElement>`。
- `className`、`style`、`data-*`、`aria-*` 透传到对应根节点。
- Avatar `ref` 指向根 `HTMLSpanElement`；Group `ref` 指向根 `HTMLDivElement`。
- v1 不提供受控状态。
- 不引入 Arco 兼容别名或弃用层。

## 5. DOM 和样式契约

- Avatar 根元素：`<span class="qizhi-avatar ...">`。
- 内容容器：`<span class="qizhi-avatar__content">`；组件测量该容器与根节点的可用宽度并通过 CSS 自定义属性应用缩放。
- 触发入口存在时：根节点内增加一个 `<Button>`；mask 模式覆盖头像，button 模式定位在右下角。
- 公共类名：`qizhi-avatar`、`qizhi-avatar-size-*`、`qizhi-avatar-shape-*`、`qizhi-avatar-has-trigger`、`qizhi-avatar-trigger-*`、`qizhi-avatar-group`。
- 尺寸：large 64px、default 40px、small 32px、mini 24px。
- 方形圆角：`var(--border-radius-medium)`，当前为 4px；圆形为 50%。
- 默认背景：`rgb(var(--primary-6))`；默认前景：`var(--color-white)`。
- Group 直接子 Avatar 使用 2px 白色边框和既有头像组阴影；default/large 重叠 10px，small/mini 重叠 8px。
- `avatar-demo-row`、示例颜色类和 Demo 间距类只属于官网，不导出为公共 API。
- `CameraIcon`、`UserIcon`、`EditIcon` 使用 `currentColor`；纯装饰场景默认隐藏于辅助技术。

## 6. 交互和状态

| 状态 | 触发条件 | 视觉 | 事件 | 焦点 | ARIA |
|---|---|---|---|---|---|
| default | 无触发入口或入口未交互 | 展示头像内容 | 无 | 根节点不可聚焦 | 图片名称由消费者提供；纯文本按页面语境命名 |
| mask | `triggerType="mask"` 且入口完整 | 半透明深色遮罩覆盖头像 | 点击只触发 `onTriggerClick` | Button 可聚焦 | Button 使用 `triggerAriaLabel` |
| button | `triggerType="button"` 且入口完整 | 24px 圆形正式 Button 位于右下角 | 点击只触发 `onTriggerClick` | Button 可聚焦 | Button 使用 `triggerAriaLabel` |
| hover | 指针位于触发 Button | 沿用正式 Button 状态；mask 不新增旧站没有的额外动画 | 无额外事件 | 不改变焦点 | 不改变 ARIA |
| active | 激活触发 Button | 沿用正式 Button active 状态 | 调用一次回调 | 保持在 Button | 无额外属性 |
| focus-visible | 键盘聚焦触发 Button | 沿用正式 Button 可见焦点 | Enter/Space 触发原生 click | 保持在 Button | 可访问名称可读 |
| disabled | 不提供 | v1 不新增 Avatar 禁用状态 | - | - | - |
| loading | 不提供 | v1 不新增 Avatar 加载状态 | - | - | - |
| error | 不提供 | 图片错误由消费者处理 | - | - | - |

## 7. 键盘与无障碍

- Avatar 根元素不赋予虚构的 `role="img"`；消费者可通过原生 `aria-label` 补充整体名称。
- 触发入口使用正式 Button，支持 Tab、Shift+Tab、Enter 和 Space。
- 触发后不移动焦点；业务层打开 Dialog、上传器等内容时由业务层管理焦点。
- 图片必须由 Demo 提供中文 `alt`；装饰 Icon 使用 `aria-hidden="true"`。
- 文字缩放不使用动画；Button 的动效继续遵守已有 `prefers-reduced-motion`。

## 8. Demo 与 API 元数据

Demo 顺序保持：

1. `avatar-basic`：基础用法，5 个 40px 圆形头像。
2. `avatar-size-shape`：大小和形状，两行各 4 个头像。
3. `avatar-group`：头像组，两组各 4 个头像。
4. `avatar-trigger`：交互按钮，mask 与 button 各 1 个；点击仅展示中文状态反馈。
5. `avatar-auto-fit`：自动调整字体大小，4 个文本头像。

- 每个 Demo 独立 TSX 文件，预览、展示源码和复制内容同源。
- 不显示 `Demo.tsx`、`Demo.css`、文件路径、语言徽标或额外 Tab。
- Demo 布局复用 `Space`；交互入口复用 `Button`；图标复用 `CameraIcon`、`UserIcon`、`EditIcon`。
- API 元数据字段为 `name/description/type/defaultValue`，必须逐项与本契约和 TypeScript 类型一致。

## 9. 测试矩阵

| 层级 | 必测内容 |
|---|---|
| 类型 | Avatar/Group Props、四档 size、两种 shape、两种 triggerType、ref 和事件类型；非法字符串必须报错 |
| 单元 | 默认类名、四档尺寸类、shape、属性透传、ref、触发入口完整条件、回调一次、Group 尺寸覆盖、文字缩放、CameraIcon 的 currentColor 和可访问属性 |
| 文档 | 5 个 Demo 的顺序、标题、说明、数量、正式包导入、源码同源、无文件名标题、API 元数据一致 |
| E2E | 5 个 Demo 的实际布局、64/40/32/24px、方形圆角、组重叠、mask/button 点击与键盘、文字未溢出、页面无横向溢出、控制台、1440/1024/375 截图 |

## 10. 发布门槛

- [ ] 契约已由林猫猫审定，没有以实现替代产品决策。
- [ ] Avatar、Avatar.Group 和 CameraIcon 完成测试先行的 red-green 记录。
- [ ] 组件测试、文档测试、类型检查和构建通过。
- [ ] 包产物可从 `@wangxiaojinger/qizhi-react` 导入，样式入口有效。
- [ ] 官网真实消费正式包，5 个 Demo 和展示源码同源。
- [ ] 键盘、无障碍、1440/1024/375 和截图完成人工验收。
- [ ] 执行者只声明 `candidate_pass`；独立最终验证保持 `pending`。
