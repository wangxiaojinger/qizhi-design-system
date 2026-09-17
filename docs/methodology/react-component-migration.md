# QIZHI 静态规范转 React 组件方法

本方法适用于将 QIZHI 原生规范站中的组件逐类迁移为 `@wangxiaojinger/qizhi-react` 正式组件。目标是让设计、产品、前端和 AI 调用同一份可构建、可测试、可导入的组件，不是只在官网中仿真展示。

## 一、唯一产品链路

```text
QIZHI 现有规范证据
→ 已审定的组件契约
→ packages/qizhi-react 正式实现
→ apps/qizhi-docs 真实调用
→ Demo、源码和 API 元数据
→ AI Skill 和业务页面消费
```

- `packages/qizhi-react` 是公共组件行为、类型和样式的唯一来源。
- `apps/qizhi-docs` 只组织文档，不得复制或仿写第二套公共组件。
- 原生规范站是迁移证据，不是 React API 的自动来源。
- Arco 用于学习契约完整度、工程组织和文档方法，不代替 QIZHI 业务审定。

## 二、强制阶段

### 1. 证据盘点

开始实现前必须盘点：

- 原规范站的全部 Demo、文案、状态和交互。
- 相关 Token、图标、尺寸、间距、响应式和无障碍证据。
- 该组件在 Form、Drawer、Modal 等复合场景的所有消费者。
- 参考组件库的公开 API，但不将其自动纳入 QIZHI。

输出一张决策表：

| 能力 | 现有证据 | QIZHI 决策 | 理由 |
|---|---|---|---|
| 保留 | 有 | 进入 v1 | 已有业务与视觉依据 |
| 修改 | 有 | 按 QIZHI 契约实现 | 与参考库不同 |
| 删除 | 无或已否定 | 不导出 | 防止虚构 API |
| 待定 | 证据不足 | 不进入 v1 | 后续有业务需求再审定 |

### 2. 契约审定

使用 `docs/templates/react-component-contract-template.md`，在写正式实现前确定：

- Props、类型、值域和默认值。
- Props 组合、互斥、优先级和降级规则。
- 渲染 DOM、原生属性、ref 和事件类型。
- hover、active、focus-visible、disabled、loading、error 等状态。
- 键盘、焦点、ARIA 和无障碍名称。
- v1 明确不提供的能力。

不允许在实现中临时猜测公共 API。信息不足时，先保持能力不存在，而不是模仿参考库补齐。

### 3. 正式组件实现

每个组件至少包含：

```text
packages/qizhi-react/src/<component>/
├── <Component>.tsx
├── <Component>.types.ts
├── <Component>.test.tsx
└── <component>.css
```

先写能证明契约缺失的失败测试，再实现最小代码。公共导出只能来自 `@wangxiaojinger/qizhi-react`。

### 4. 官网消费与代码同源

- Demo 必须导入 `@wangxiaojinger/qizhi-react`。
- 每个 Demo 使用独立 TSX 文件。
- 预览直接渲染该文件，代码展示与复制从同一文件读取。
- API 表由结构化元数据生成，不在 JSX 中手写重复表格。
- 官网操作控件优先复用正式组件和正式图标。

### 5. 分层验收

按 `docs/checklists/react-component-delivery-checklist.md` 执行，并保留可重跑的测试而不是只留一张截图。

## 三、停止条件

以下任一情况出现时，停止扩大实现：

- 关键 API 的不同答案会导致不兼容实现。
- QIZHI 缺少该状态、交互或视觉证据。
- 参考库有能力，但 QIZHI 没有业务需求。
- 需要改变全局 Token、技术栈或公共信息架构。

局部 CSS、文案或 Demo 展示问题不应中断整个迁移，但必须在当前组件交付前解决。

## 四、Button 迁移得到的固定经验

- 不把静态 Demo 类名直接当成 React Props。
- 不因 Arco 存在 `Group` 或 `shape` 就默认 QIZHI 也需要。
- “次要按钮”必须同时审定语义、背景、边框、状态和默认值，不能只看名称。
- 加载和禁用必须分别审定视觉、事件、焦点和 ARIA，不能只切换颜色。
- 图标必须使用 QIZHI 图标库，并检查 `currentColor`、透明度、对齐和可访问名称。
- 文档操作按钮也是正式组件的消费者，不应手写另一套。
- API 表的字体、字号、颜色、背景和语义标记必须在首个组件时一次定义，不在每个组件中重新设计。
- 不用“DOM 存在”或“没有溢出”代替计算样式、几何对齐和截图人工审查。

