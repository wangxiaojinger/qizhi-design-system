# QIZHI Descriptions API 契约 v1

状态：已审定  
负责人：林猫猫  
证据日期：2026-08-21

## 1. 目标与边界

- 用户任务：将旧规范站的描述列表 Descriptions 迁移为 `@wangxiaojinger/qizhi-react` 正式组件，并保持旧站 2 个 Demo 的标题、说明、数量、布局、尺寸、状态和无交互边界。
- 业务场景：成组展示详情页、订单信息、账号资料和系统参数中的只读字段和值。
- v1 解决的问题：统一描述列表标题、水平或垂直字段布局、水平标签左右对齐、固定三列桌面布局和单列移动端布局。
- v1 明确不解决的问题：边框表格、尺寸档位、任意列数、字段跨列、数据数组渲染、加载态、编辑态、折叠、排序、分页和业务数据请求。

## 2. 证据清单

| 证据 | 位置 | 可证明什么 | 不能证明什么 |
|---|---|---|---|
| 原规范站 Descriptions 页面 | `index.html#component-descriptions` | 2 个 Demo 的标题、说明、顺序、3 组列表、12 个字段和静态内容 | React Props、任意列数和数据模型 |
| Descriptions 样式 | `styles.css` 的 `.descriptions-demo*`、`.qizhi-descriptions*` | 720px 最大宽度、三列/单列布局、间距、字号、标签对齐、冒号和状态块视觉 | 静态 Demo 类是否应直接成为公共 API |
| 原生脚本 | `script.js` 全文检索 | Descriptions 没有初始化函数或组件交互 | 编辑、折叠或异步状态 |
| 三视口只读浏览器实测 | 2026-08-21，1440/1024/375 | 实际几何、文字换行、三列到单列切换和页面无横向溢出 | React 实现是否已一致；静态服务器不能作为 React Island 控制台验收 |
| 已有 React 公共组件 | `packages/qizhi-react/src` | 状态值可复用 `Tag`；文档操作可复用 `Button`、`CodeIcon`、`CopyIcon`、`ApiTable` 和 `CodeHighlight` | 当前不存在正式 Descriptions 组件 |

## 3. 能力决策

| 能力 | 决策 | 契约结论 | 依据 |
|---|---|---|---|
| 列表标题 | 保留 | `title` 接受 `ReactNode`；未提供时不渲染标题 | 旧站三组列表均有标题 |
| 字段和值 | 保留并结构化 | 使用 `Descriptions.Item` 的 `label` 与 `children` | 旧站 12 个字段均由标签和值组成，值中存在 Tag |
| 水平排列 | 保留 | `layout="horizontal"` 为默认值，标签和值同排并显示冒号 | 基本用法与右对齐标签 |
| 垂直排列 | 保留 | `layout="vertical"` 时标签和值上下排列且不显示冒号 | 垂直排列实例 |
| 标签左对齐 | 保留 | `labelAlign="left"` 为默认值 | 基本用法 |
| 标签右对齐 | 保留 | `labelAlign="right"` 仅在水平布局生效，标签列固定 72px | 右对齐标签实例 |
| 三列布局 | 保留并固定 | 视口宽度大于 767.98px 时固定三列 | 三组旧站桌面实例均为三列 |
| 移动端单列 | 保留 | 视口不大于 767.98px 时固定单列 | 375px 旧站实测 |
| 任意列数 | 删除 | v1 不提供 `column` | 旧站没有其他列数或动态列数证据 |
| 字段跨列 | 删除 | v1 不提供 `span` | 旧站没有跨列字段 |
| 数据数组渲染 | 删除 | v1 不提供 `data` | 旧站只证明组合式字段结构，且值可包含 ReactNode |
| 状态块 | 修改 | Demo 必须从 `@wangxiaojinger/qizhi-react` 导入并渲染正式 `Tag color="green"`，使用其 24px 默认尺寸 | 用户明确要求复用已封装 Tag React 组件，并确认允许与旧站 22px 存在 2px 差异 |
| 边框、尺寸和冒号开关 | 删除 | v1 不提供 `border`、`size`、`colon` | 旧站只有无边框单尺寸；冒号由布局规则决定 |
| 编辑、折叠等交互 | 删除 | Descriptions v1 为只读展示组件 | 旧站无组件交互 |

## 4. 公共 API

```ts
export type DescriptionsLayout = "horizontal" | "vertical";
export type DescriptionsLabelAlign = "left" | "right";

export interface DescriptionsProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  title?: ReactNode;
  layout?: DescriptionsLayout;
  labelAlign?: DescriptionsLabelAlign;
}

export interface DescriptionsItemProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  label: ReactNode;
}

export interface DescriptionsComponent {
  (props: DescriptionsProps & RefAttributes<HTMLDivElement>): ReactElement;
  Item: ForwardRefExoticComponent<DescriptionsItemProps & RefAttributes<HTMLDivElement>>;
}
```

| 属性 | 类型 | 默认值 | 描述 | 组合/互斥规则 |
|---|---|---|---|---|
| `children` | `ReactNode` | `-` | 接收 `Descriptions.Item` 字段项 | 不解析业务数据数组 |
| `title` | `ReactNode` | `-` | 渲染列表标题 | 未提供时不保留标题空白 |
| `layout` | `"horizontal" \| "vertical"` | `"horizontal"` | 控制标签和值同排或上下排列 | 垂直布局自动隐藏冒号 |
| `labelAlign` | `"left" \| "right"` | `"left"` | 控制水平布局的标签文字对齐 | 垂直布局固定左对齐，该属性不改变垂直布局 |
| `Descriptions.Item label` | `ReactNode` | 必填 | 渲染字段标签 | 水平布局由组件视觉规则补充冒号 |
| `Descriptions.Item children` | `ReactNode` | `-` | 渲染字段值，可包含正式 QIZHI 组件 | 不改变子组件行为 |

- Descriptions 根节点继承 `HTMLAttributes<HTMLDivElement>`；Item 根节点继承 `HTMLAttributes<HTMLDivElement>`。
- `className`、`style`、`data-*` 和 `aria-*` 透传到对应根节点。
- Descriptions `ref` 指向根 `HTMLDivElement`；Item `ref` 指向字段项 `HTMLDivElement`。
- v1 没有受控状态、事件回调、弃用属性或 Arco 兼容别名。

## 5. DOM 和样式契约

- Descriptions 根元素：`<div class="qizhi-descriptions ...">`。
- 标题：有 `title` 时渲染 `<div class="qizhi-descriptions__title">`。
- 字段容器：`<dl class="qizhi-descriptions__body">`，表达标签和值的描述关系。
- Item 根元素：`<div class="qizhi-descriptions__item">`，内部使用 `<dt class="qizhi-descriptions__label">` 和 `<dd class="qizhi-descriptions__value">`。
- 公共类名：`qizhi-descriptions`、`qizhi-descriptions-layout-*`、`qizhi-descriptions-label-align-*`、`qizhi-descriptions__title/body/item/label/value`。
- 根元素宽度为 `min(100%, 720px)`；不把 Demo 容器宽度写入组件。
- 标题为 16px/24px、字重 500、下间距 18px；标签和值为 14px/22px。
- 水平布局 Item 使用标签和值两列，间距 8px；左对齐标签宽度随内容，右对齐标签列固定 72px。
- 水平布局三列间距为纵向 18px、横向 28px；垂直布局为纵向 16px、横向 32px。
- 垂直布局 Item 内部间距为 6px；标签不显示冒号。
- `descriptions-demo-stack` 仅属于官网第二个 Demo 的组合布局，不导出为公共 API。

## 6. 交互和状态

| 状态 | 触发条件 | 视觉 | 事件 | 焦点 | ARIA |
|---|---|---|---|---|---|
| default | 正常渲染 | 按布局、对齐和响应式规则展示 | 无 | 不进入 Tab 顺序 | 由 `dl/dt/dd` 表达字段关系 |
| hover | 不提供 | 无组件级 hover | - | - | - |
| active | 不提供 | 无组件级 active | - | - | - |
| focus-visible | 不提供 | 根节点和 Item 默认不可聚焦 | - | - | - |
| disabled | 不提供 | 只读展示组件没有禁用态 | - | - | - |
| loading | 不提供 | v1 不新增加载骨架 | - | - | - |
| error | 不提供 | 字段错误内容由消费者作为值传入 | - | - | - |

## 7. 键盘与无障碍

- Descriptions 本身没有键盘交互，不新增 `role`、`tabIndex` 或快捷键。
- 字段关系使用原生 `dl/dt/dd` 语义；Item 中的交互子组件继续使用自身语义和键盘规则。
- `title` 不自动提升为页面标题层级，避免破坏文档或业务页面的信息架构。
- 组件没有动画，不需要新增 `prefers-reduced-motion` 分支。

## 8. Demo 与 API 元数据

Demo 顺序保持：

1. `descriptions-basic`：基本用法，1 组标题为“项目信息”的 Descriptions，共 6 项；“运行中”必须直接使用从 `@wangxiaojinger/qizhi-react` 导入的正式绿色 Tag。
2. `descriptions-label-align`：标签文本对齐，先展示 1 组“右对齐标签”，再展示 1 组“垂直排列”，每组 3 项，组间距 32px。

- 页面标题保持“描述列表 Descriptions”；简介、Demo 标题和说明逐字保持旧站内容。
- 每个 Demo 使用独立 TSX 文件，预览、展示源码和复制内容同源。
- 不得以本地 `span`、Demo 专属状态类或局部样式仿写、覆盖正式 Tag 的结构、尺寸、颜色和状态视觉。
- 不显示 `Demo.tsx`、`Demo.css`、文件路径、语言徽标或额外 Tab。
- 文档查看/复制操作复用正式 `Button`、`CodeIcon`、`CopyIcon`；代码区复用 `CodeHighlight`；API 表复用 `ApiTable`。
- API 元数据字段为 `name/description/type/defaultValue`，必须与本契约和 TypeScript 类型一致。

## 9. 测试矩阵

| 层级 | 必测内容 |
|---|---|
| 类型 | Descriptions/Item Props、两种 layout、两种 labelAlign、必填 label、ref；非法字符串必须报错 |
| 单元 | 默认类名、标题条件渲染、水平/垂直类、左右对齐类、属性透传、ref、`dl/dt/dd` 语义、ReactNode 标签和值 |
| 文档 | 2 个 Demo 的顺序、标题、说明、1+2 组列表、6+3+3 项、正式包导入、Tag 复用、源码同源、无文件名标题、API 元数据一致 |
| E2E | 三组列表的实际布局、720px 上限、三列/单列、字号、间距、72px 右对齐标签列、垂直 6px 间距与无冒号、24px Tag、页面无横向溢出、控制台、1440/1024/375 截图 |

## 10. 发布门槛

- [ ] 契约已由林猫猫审定，没有以实现替代产品决策。
- [ ] Descriptions 与 Descriptions.Item 完成测试先行的 red-green 记录。
- [ ] 组件测试、文档测试、类型检查和构建通过。
- [ ] 包产物可从 `@wangxiaojinger/qizhi-react` 导入，样式入口有效。
- [ ] 官网真实消费正式包，2 个 Demo 和展示源码同源。
- [ ] 1440/1024/375 的响应式几何、控制台和截图完成人工验收。
- [ ] 执行者只声明 `candidate_pass`；独立最终验证保持 `pending`。
