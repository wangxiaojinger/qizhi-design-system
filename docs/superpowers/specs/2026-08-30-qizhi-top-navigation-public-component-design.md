# QIZHI TopNavigation 公共业务组件设计

## 目标

将文档 Demo 内的 `TopNavigationPreview` 正式沉淀为
`@wangxiaojinger/qizhi-react` 公共业务组件 `TopNavigation`，使 Page Builder 和业务页面能够
直接复用平台真实顶部导航，而不是以 `Menu + Button + Dropdown` 重新拼装。

本次允许重构 Demo 源码，但不得改变原 Demo 的标题、说明、顺序、业务文案、
数据、可见结构、布局、尺寸、UI、初始状态、交互、键盘路径和响应式结果。
迁移前后的自动对照最多声明 `candidate_pass`，独立最终视觉确认保持
`pending`。

## 第一阶段范围

只处理顶部导航，不同时迁移 SideNavigation、PlatformShell 或其他业务组件。

包含：

- `TopNavigationPreview` 的完整可见 UI；
- 品牌、租户、区域、主导航、次导航、溢出入口和工具操作区；
- 导航受控与非受控选中；
- 区域与语言选择；
- 容器宽度监听、隐藏项识别、横向滚动和溢出菜单；
- “更多”仅在导航项无法占用其完整可用宽度时出现；测量需排除“更多”自身占位，并在空间恢复后隐藏入口、展开全部导航项和重置滚动位置；
- 鼠标、键盘、焦点、ARIA 和响应式行为；
- 组件专属 CSS 和当前 Demo 使用的准确资产；
- 公共导出、类型、生成 API、测试、E2E 和 Demo 同源改造。

不包含：

- 真实路由、认证或权限计算；
- 后端区域、租户、语言和用户接口；
- SideNavigation 和不同业务域的侧边菜单；
- PlatformShell 整体框架；
- 未在当前 Demo 中出现的 loading、error 或无权限视觉；
- 对基础 `Menu`、`Dropdown`、`Button` 行为的无关扩展。

## 原始设计契约

当前 `TopNavigationPreview` 是迁移基准。实施前必须冻结：

- 源文件内容和资产校验值；
- 默认选中“模型服务”；
- 默认区域“七宝”，区域选项和禁用项；
- 默认语言“中文”及中英文选项；
- 工作台、定制模型、模型服务、Agent、探索、运营中心的顺序与文案；
- 品牌“启智”、租户“租户名称XX”、资源/帮助和用户入口；
- 56px 总高度及当前所有关键元素的计算尺寸与位置；
- 1440、1024、375 下的实际显示、隐藏、滚动和溢出行为；
- 点击、方向键、Home、End、Enter、Space、Escape、外部关闭和焦点恢复；
- 目标打开态和选中态截图。

迁移后以同一数据渲染的新公共组件必须逐项对照，不允许用“整体看起来接近”
代替直接子项、计算样式和真实交互检查。

## 架构与文件归属

正式实现进入组件库：

```text
packages/qizhi-react/src/top-navigation/
├── TopNavigation.tsx
├── TopNavigation.types.ts
├── topNavigation.css
├── TopNavigation.test.tsx
└── assets/
```

`TopNavigation.tsx` 只依赖 `@wangxiaojinger/qizhi-react` 包内基础组件与包内资产，不依赖
`apps/qizhi-docs`。属于顶部导航的样式从 `menuDocs.css` 迁入
`topNavigation.css`，并使用 `qizhi-top-navigation` 公共根类和组件内部私有
后代类。

`menuDocs.css` 迁移后只保留文档页面、Demo 容器、Codebox 和其他 Menu Demo
样式。不得让业务页面显式导入 `menuDocs.css`。

文档 Demo 改为：

```tsx
import { TopNavigation } from "@wangxiaojinger/qizhi-react";

export default function TopNavigationDemo() {
  return <TopNavigation />;
}
```

如需保持现有 Demo 的受控验证，Demo 可以提供状态和回调，但完整导航 DOM、
交互与响应式实现只能来自公共 `TopNavigation`。Demo TSX 继续作为预览、展示
代码和复制代码的唯一来源。

## 公共 API

### 导航项

```ts
export interface TopNavigationItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  group?: "primary" | "secondary";
}
```

`group` 只表达当前已证实的主导航和图标次导航分组，不承载路由或权限判断。

### 区域与语言选项

```ts
export interface TopNavigationOption {
  key: string;
  label: ReactNode;
  shortLabel?: string;
  disabled?: boolean;
}
```

`shortLabel` 用于区域触发器的短名称；菜单仍显示完整 `label`。

### TopNavigationProps

```ts
export interface TopNavigationProps {
  logo?: ReactNode;
  productName?: ReactNode;
  tenantName?: ReactNode;

  items?: readonly TopNavigationItem[];
  selectedKey?: string;
  defaultSelectedKey?: string;
  onSelect?: (key: string) => void;

  regions?: readonly TopNavigationOption[];
  region?: string;
  defaultRegion?: string;
  onRegionChange?: (key: string) => void;

  languages?: readonly TopNavigationOption[];
  language?: string;
  defaultLanguage?: string;
  onLanguageChange?: (key: string) => void;

  helpLabel?: ReactNode;
  onHelp?: () => void;
  onUserMenu?: () => void;
  className?: string;
  "aria-label"?: string;
}
```

默认值逐字复现当前 Demo。`selectedKey`、`region`、`language` 存在时为受控
模式；否则分别由 `defaultSelectedKey`、`defaultRegion`、
`defaultLanguage` 初始化组件内部状态。

组件不读取角色或权限。业务系统应先过滤 `items`、`regions` 和 `languages`
再传入；当前阶段不发布未经 Demo 证明的权限 API。

## UI 与样式边界

- 完整迁移当前导航自身的颜色、尺寸、间距、圆角、图标、选中态、渐隐提示、
  头像和容器查询行为。
- 当前 UI 的准确视觉值是迁移基准；迁移任务不顺便重新设计或替换为近似 token。
- 组件内部可以使用私有 `qizhi-top-navigation__*` 类；Demo 和业务页面不得选择
  这些内部类。
- Page Builder 只能通过公开 Props 改变内容和状态，不得通过页面 CSS 穿透
  组件内部。
- 组件自身不得携带文档 Demo 外层 padding、Codebox、查看代码和复制代码样式。

## 状态与数据流

- 导航、区域和语言分别支持受控与非受控模式。
- 禁用导航项和禁用选项沿用基础 Menu/Dropdown 的语义与键盘行为。
- `onSelect`、`onRegionChange`、`onLanguageChange`、`onHelp`、
  `onUserMenu` 只通知调用方，不在组件内执行路由或网络请求。
- 组件内部维护隐藏导航键集合、滚动阴影状态和 ResizeObserver 生命周期。
- 选择溢出项后保持当前 Demo 的平滑滚动定位行为。
- 卸载时必须移除 ResizeObserver、resize、scroll 等监听，避免重复绑定。

## 响应式与可访问性

- 保持当前容器查询断点与隐藏策略，不将断点交给业务页面重新实现。
- 保持可横向滚动区域、滚轮转横向滚动、溢出菜单和隐藏选中项反馈。
- Menu、Dropdown 和 Button 继续承担交互标签，不新增原生交互控件或手写 SVG。
- 保持 `aria-label`、`aria-current`、`menuitemradio`、`aria-checked`、
  roving tabindex、focus-visible、Escape 和焦点恢复路径。
- 装饰性资产使用空替代文本；仅图标操作保留准确中文无障碍名称。

## Demo 保真策略

允许修改 Demo 实现代码的唯一目的，是让它调用正式公共组件。以下结果不得
改变：

- Demo 标题、说明和顺序；
- 所有可见文案和数据；
- 默认选中、默认区域和默认语言；
- DOM 语义与无障碍语义；
- 视觉结构、位置、尺寸、颜色和响应式结果；
- 全部鼠标与键盘交互。

类名从 `menu-top-demo__*` 迁移为组件私有类不属于可见设计变化，但必须通过
完整计算样式、几何、交互和截图对照证明没有产生回归。

## API、文档与同源要求

同一任务必须同步：

1. React 实现；
2. TypeScript 类型与 `@wangxiaojinger/qizhi-react` 根导出；
3. 组件样式与资产；
4. `component-api.json` 的生成来源和生成结果；
5. Demo TSX、实际预览、展示代码和复制代码；
6. 单元测试、契约测试和 E2E；
7. Page Builder 组件库存与输出边界规则。

Page Builder 应新增优先级：发现 `TopNavigation` 需求时必须使用公共业务组件，
不得以基础组件重新拼装。只有公共 API 确实无法表达的需求才能记录为
`capability_gap`。

## 测试与验收

生产代码修改前先建立并观察失败门禁：

1. `@wangxiaojinger/qizhi-react` 当前尚未导出 `TopNavigation`；
2. 公共组件实现不得依赖 `apps/qizhi-docs`；
3. 导航完整 UI 不得继续只由 `menuDocs.css` 拥有；
4. Demo 必须调用公共 `TopNavigation`，且不存在第二套导航实现；
5. API 类型、实现、生成契约和 Demo 调用一致；
6. Page Builder 遇到顶部导航时必须选择 `TopNavigation`。

完成后执行：

- 组件单元测试和类型测试；
- Demo 保真与样式所有权契约测试；
- `component-api.json` 生成及一致性检查；
- QIZHI React 包构建、文档构建和 smoke 构建；
- Page Builder inventory 与输出边界检查；
- 1440、1024、375 下点击、键盘、Dropdown、滚动、溢出和响应式检查；
- 三档直接子项尺寸、最终样式、页面/组件溢出和控制台检查；
- 原 Demo 与迁移后 Demo 的关键状态截图人工对照。

## 后续阶段

TopNavigation 独立验证后，沿用同一方法依次处理：

1. SideNavigation；
2. PlatformShell；
3. AI 征程业务组件；
4. 任务概览组件；
5. 项目列表与项目卡片组合；
6. 用户信息、审批、最近访问和功能上新。

每个后续组件单独冻结契约、设计、实施和验收，不能把“所有业务 Demo”作为
一次不可审计的批量复制任务。

## 验收状态边界

`TopNavigation` 是新增公共 API。自动测试和执行者视觉检查全部通过后最多标记
`candidate_pass`；用户或独立验证完成前，`independent_verification` 保持
`pending`。
