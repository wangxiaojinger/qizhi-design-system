# QIZHI PlatformShell 公共组件设计

## 目标

将现有 `FrameworkPreviewDemo` 中稳定的平台框架能力沉淀为
`@wangxiaojinger/qizhi-react` 公开业务组件 `PlatformShell`。组件必须复用已经公开的
`TopNavigation` 与 `SideNavigation`，保持当前 Demo 的可见结构、默认文案、
导航流程、尺寸和响应式结果，不允许页面继续使用基础 `Layout`、`Menu`、
`Dropdown` 或 `Button` 重新制作已有平台框架。

本阶段只迁移平台壳层，不迁移“开启 AI 征程”、任务概览、项目卡片以及个人
信息等工作台内容模块。

## 已确认基线

- Header 高度为 56px，并完整使用公开 `TopNavigation`。
- 默认导航项为 `workbench`，此时不显示侧栏。
- `custom-model`、`model-service`、`agent`、`explore`、`operations`
  分别显示同名变体的公开 `SideNavigation`。
- Sider 桌面宽度为 210px，框架主体、Sider 和 Main 的基线最小高度为
  800px；短内容 Demo 保持 800px，真实页面内容更长时三者随内容增长。
- 主体背景为现有平台浅蓝背景；有侧栏时主内容左内边距为 0，无侧栏时为
  24px。
- 默认问候语为“Good day，欢迎使用 启智 开启新的一天 😃”。
- 当前 Demo 内容区文案为“内容区”。
- 991.98px 以下主体由横向排列切换为纵向排列；侧栏占满容器宽度，主内容
  保持现有最小高度。
- 480px 以下问候语单行截断并缩小字号，内容占位文字缩小。

## 公共组件与文档画布边界

`PlatformShell` 自身负责真实业务页面必须一致的结构和行为：

- 顶部、主体、侧栏和主内容的 `Layout` 组合；
- 顶部导航选中状态与事件；
- 工作台隐藏侧栏；
- 五个业务域到侧栏变体的映射；
- 默认问候语、问候区域和内容插槽；
- 56px Header、210px Sider、800px 主体最小高度、可随内容增长的
  Body/Sider/Main、主内容内边距、平台背景；
- 页面语义中只由 `Layout.Content` 提供一个 `main` landmark，调用方内容容器
  不再嵌套第二个 `main`；
- 平台框架内部响应式规则和语义结构。

文档 Demo 只保留文档展示属性：

- `.layout-framework-preview` 的外层留白；
- 960px 最大预览宽度；
- 为区分文档背景而设置的预览边框、圆角和阴影。

这些展示属性不属于真实平台框架，不进入公共组件 API 或 CSS。迁移后 Demo
视觉结果必须与迁移前一致。

## 公共 API

```ts
interface PlatformShellProps {
  selectedKey?: string;
  defaultSelectedKey?: string;
  onSelect?: (key: string) => void;
  topNavigationProps?: Omit<
    TopNavigationProps,
    "selectedKey" | "defaultSelectedKey" | "onSelect"
  >;
  sideNavigationProps?: Omit<SideNavigationProps, "variant">;
  greeting?: ReactNode;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}
```

### 状态规则

- `selectedKey` 存在时为受控模式；组件只触发 `onSelect`，不自行改变当前项。
- 未提供 `selectedKey` 时使用 `defaultSelectedKey` 初始化内部状态；默认值为
  `workbench`。
- 当前项为 `workbench` 时不渲染 Sider。
- 当前项属于五个公开侧栏变体时，自动传给 `SideNavigation.variant`。
- 当前项不属于上述六个已知平台键值时，不渲染 Sider；这是安全降级，不推测
  未定义业务域。
- `topNavigationProps` 和 `sideNavigationProps` 只能定制对应公共组件已经公开
  的属性，不允许通过 PlatformShell 引入第二套导航实现。
- `greeting={null}` 时不渲染问候区域；未提供时使用当前默认文案。

## DOM 与样式所有权

公共根类为 `.qizhi-platform-shell`，内部类统一使用
`.qizhi-platform-shell__*`。组件 CSS 只能使用 QIZHI 已公开 token 或从现有
Framework Demo 原样迁移的已确认样式值。

Demo CSS 不得选择 `.qizhi-platform-shell__*`、
`.qizhi-top-navigation__*` 或 `.qizhi-side-navigation__*`。页面可通过公开根类
和 `className` 决定组件在页面中的外部尺寸与位置，但不得改写内部结构。

## 消费者迁移

### FrameworkPreviewDemo

Demo 保留受控选中状态以展示导航切换，主体改为：

```tsx
<PlatformShell selectedKey={selectedKey} onSelect={setSelectedKey}>
  <div className="layout-framework-demo__content">内容区</div>
</PlatformShell>
```

展示代码、复制代码和真实预览继续同源。

### AI 全生命周期工作台

页面用 `PlatformShell` 代替当前 `Layout.Header + TopNavigation + Layout.Content`
组合。工作台默认选中 `workbench`，不显示侧栏；页面主体内容作为 children。

### Agent 管理页

页面用 `PlatformShell selectedKey="agent"` 代替现有产品壳组件内部的
`Layout + TopNavigation + SideNavigation` 组合，并通过
`sideNavigationProps` 保留 `HW-H800-Public` 空间名称和 `agent-item` 选中项。

## 可访问性

- 根元素使用可命名的区域语义，默认 `aria-label="启智平台框架"`。
- 顶部和侧边导航继续保留各自公共组件的键盘行为和 ARIA 状态。
- 隐藏侧栏时不保留不可见或不可聚焦的侧栏 DOM。
- 自定义问候语不改变主内容的语义顺序。

## 测试与验收

开发前增加并确认以下测试因公共组件缺失而失败：

- `PlatformShell` 未从 `@wangxiaojinger/qizhi-react` 导出；
- Framework Demo 仍直接组合 `Layout`、`TopNavigation` 与
  `SideNavigation`；
- 平台结构样式仍由 `layoutDocs.css` 私有后代规则承担。

实现后验证：

- 默认非受控工作台状态；
- 受控状态不自行变化；
- 五种业务域切换与侧栏映射；
- 未知键值安全隐藏侧栏；
- `topNavigationProps`、`sideNavigationProps`、`greeting` 和 children；
- Framework Demo 展示代码与复制代码同源；
- Page Builder 输出边界检查；
- 根项目、组件包和生成页面 TypeScript 与生产构建；
- 1440、1024、375 三档下的几何、导航切换、空间浮层、键盘、焦点、
  overflow、控制台和目标状态截图。

自动化与执行者结论最高为 `candidate_pass`；独立最终验收保持 `pending`。

## 不在本阶段处理

- 新增平台路由、权限过滤、异步导航数据或用户认证；
- 新增 loading、错误、无权限状态；
- 修改 TopNavigation 或 SideNavigation 已确认的 UI；
- 将文档预览画布的边框、阴影或最大宽度作为公共组件能力；
- 迁移后续工作台内容业务组件。
