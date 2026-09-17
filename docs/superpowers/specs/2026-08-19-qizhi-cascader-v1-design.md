# QIZHI Cascader v1 React Island 迁移设计

状态：待用户审定  
日期：2026-08-19  
对应契约：`docs/specs/qizhi-cascader-contract-v1.md`

## 1. 目标

将旧静态规范站的【级联选择 Cascader】完整迁移为 `@wangxiaojinger/qizhi-react` 正式组件，并让官网 Demo、展示源码、API 元数据与正式组件保持同源。

本次“完整”指承接旧站已有能力，不代表复制旧站的 `data-*`、临时 DOM 或脚本实现。React v1 会重新定义类型、受控模型、键盘操作、焦点和弹层边界。

## 2. 已确认范围

v1 包含：

- 基础逐级选择与点击/悬停展开。
- `allowClear`、`addBefore`、`renderFormat`、自定义触发器。
- `small | default | large` 三种尺寸，以及 `error | warning` 状态。
- `fieldNames`、多选、拖拽排序、`changeOnSelect`、`checkedStrategy`。
- 内置搜索、自定义搜索、异步加载、禁用选项。
- `value/open` 的受控与非受控模式。
- React Island 文档、结构化 API、类型/单元/文档/E2E 测试和三视口验收。

v1 不包含：远程搜索、虚拟列表、服务端分页、自定义弹层容器、整组件 loading、组件级 disabled、节点勾选半选态、移动端专用抽屉形态。这些能力在旧站没有足够证据。

## 3. 推荐架构

```text
packages/qizhi-react/src/cascader/
├── Cascader.tsx               # 公共入口与受控状态编排
├── Cascader.types.ts          # 值、选项、字段映射和 Props 联合类型
├── cascaderModel.ts           # 纯数据树、路径、搜索和选择策略
├── useCascaderNavigation.ts   # 键盘活动路径与焦点状态
├── CascaderPopup.tsx          # Portal、列菜单、搜索结果与异步状态
├── CascaderTags.tsx           # 多选标签与拖拽排序
├── Cascader.test.tsx
├── Cascader.types.test.tsx
├── cascaderModel.test.ts
└── cascader.css

apps/qizhi-docs/src/cascader/
├── demos/*.tsx
├── cascaderDocs.registry.ts
├── cascaderApi.ts
├── CascaderDocsIsland.tsx
├── CascaderDemoCodebox.tsx
├── CascaderApiTable.tsx
├── cascaderDocs.test.tsx
├── cascaderDocs.css
└── main.tsx
```

拆分依据：数据树运算、键盘导航、弹层呈现和多选标签分别承担单一职责。公共行为只存在于 `packages/qizhi-react`，官网不再维护第二套 Cascader。

## 4. 数据与状态流

```text
options + fieldNames
  → 规范化只读路径模型
  → 当前展开路径 / 活动选项 / 搜索结果
  → 用户选择
  → 单选路径或多选路径集合
  → onChange(value, selectedOptions)
  → 输入显示、标签与菜单选中态同步
```

- `value/defaultValue` 与 `open/defaultOpen` 分别遵循标准受控/非受控模式。
- 选项数据不被组件原地修改；异步加载结果由调用方更新 `options`。
- `loadMore` 只负责请求，组件为对应节点显示局部加载态，并防止同一节点重复请求。
- 搜索复用同一份路径模型；默认匹配路径中任一 label，自定义 `filterOption` 只改变过滤判断。
- 多选拖拽只改变选中路径顺序，不改变 `options` 树。

## 5. 弹层与视觉策略

- 触发输入保留旧站 28/32/36px 高度、2px 圆角、QIZHI Token、16px 清除/箭头槽和多选标签基线。
- 菜单列保持 32px 行高；搜索区、分隔线、禁用态、加载态和激活背景延续旧站证据。
- 弹层内部使用 `createPortal(document.body)`，避免被 `.demo`、Drawer、Modal 或业务容器的 `overflow` 裁切。
- 定位逻辑以触发器左右边缘为基线；视口不足时水平夹紧、向上翻转，并在滚动/缩放时重算。
- 375px 下限制弹层宽度不超过视口；列菜单可在弹层内部横向滚动，但页面不得横向滚动。
- 不增加第三方定位依赖。

## 6. 交互与无障碍

- 默认输入使用 `role="combobox"`，关联唯一弹层 ID，并维护 `aria-expanded`、`aria-controls`、`aria-activedescendant`。
- 非搜索态输入只读；搜索态为真实可编辑输入并设置 `aria-autocomplete="list"`。
- 每列为 `role="listbox"`，选项为 `role="option"`；多选列设置 `aria-multiselectable="true"`。
- Enter/Space 打开；Up/Down 移动；Right 展开子级；Left 返回父级；Enter 选择；Escape 关闭并保留触发器焦点；Tab 关闭但不困住焦点。
- `expandTrigger="hover"` 只改变指针展开方式，键盘仍使用同一套明确路径。
- 清除后焦点回到输入；选择导致 DOM 更新时不依赖已经脱离文档的 `event.target` 判断外部点击。
- 自定义触发器使用 render prop 获取完整触发属性，避免克隆任意节点后丢失 ref、事件或 ARIA。

## 7. 错误和边界处理

- 重复 value、缺少映射字段或非数组 children 在开发环境输出可定位警告；无效路径不渲染伪造标签。
- 受控 value 中已经不在 options 的路径保留值但使用回退文本，避免数据异步刷新时静默丢失。
- `loadMore` rejected 后移除 loading，保留当前弹层与焦点，并将节点标记为可重试；组件不伪造错误文案。
- `changeOnSelect` 与多选并用时各路径独立选择，不自动推导父子联动。
- `dragToSort` 仅在 `mode="multiple"` 生效；其余组合通过 TypeScript 联合类型阻止。

## 8. 文档策略

官网按旧站顺序保留 15 组内容：基础、清除、前置标签、格式化、自定义触发、尺寸、自定义字段、拖拽、选择即改变、多选、搜索、自定义搜索、动态加载、禁用项、受控模式，末尾追加独立 `cascader-API`。

基础用法中的 click/hover/error/warning 四个状态仍放在同一 Demo。每个 Demo 是独立 TSX 文件，实时预览、展开源码与复制内容来自同一文件。API 表由结构化数据生成。

## 9. 测试策略

- 纯模型：字段映射、路径展平、过滤、父级策略、去重和无效路径。
- 类型：单选/多选 value 与事件、受控/非受控、拖拽组合、异步加载和 render prop。
- 单元：打开/关闭、选择/清除、列导航、搜索、异步成功/失败、禁用、焦点和 ARIA。
- 文档：全部 Demo 顺序、正式包导入、源码同源、API 默认值和唯一锚点。
- E2E：鼠标与完整键盘路径、DOM 重绘后的外部点击、Portal 裁切链、弹层翻转/夹紧、三视口、控制台和局部截图人工检查。

完成状态最高为 `candidate_pass`；独立最终验证保持 `pending`。
