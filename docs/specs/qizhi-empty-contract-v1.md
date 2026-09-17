# QIZHI Empty API 契约 v1

状态：已审定  
负责人：QIZHI Design System  
证据日期：2026-08-21

## 1. 目标与边界

- 迁移旧规范站唯一的“基本用法”Demo。
- 默认展示用户提供的 Figma 导出 64×40 SVG 与“暂无数据”。
- v1 仅支持替换描述内容和根节点原生属性；不提供自定义图片、操作区、尺寸或状态变体。

## 2. 证据清单

| 证据 | 位置 | 结论 |
|---|---|---|
| 旧站 Demo | `index.html#component-empty` | 1 个 Demo，居中插图与描述，无业务交互 |
| 旧站样式 | `styles.css:9511` | 主体间距 14px、上下内边距 24px、描述 14/22px |
| Figma 导出 | 用户附件 `无数据.svg` | 默认插图 64×40，SHA-256 `75565ef7314b102e59a07ff60ac4fe70bac3dd6e4312ca4c5f81c7944232520d` |
| 既有消费 | 全局配置、Select、Cascader 空数据场景 | 中文描述需要可替换；不证明自定义图片 API |

## 3. 能力决策

| 能力 | 决策 | 契约结论 |
|---|---|---|
| 默认空状态 | 保留并修改插图 | 使用指定 SVG，默认文案“暂无数据” |
| 描述内容 | 保留 | `description?: ReactNode`，默认“暂无数据”，`null` 不渲染描述节点 |
| 自定义图片 | 待定 | v1 不导出 |
| 操作按钮、尺寸、状态 | 删除 | 无旧站或用户需求证据 |
| 根属性与 ref | 保留 | `HTMLAttributes<HTMLDivElement>` 与 `HTMLDivElement` ref |

## 4. 公共 API

| 属性 | 类型 | 默认值 | 描述 |
|---|---|---|---|
| `description` | `ReactNode` | `"暂无数据"` | 空状态说明；传入 `null` 时隐藏说明 |
| `className` | `string` | — | 根节点附加类名 |
| `style` | `CSSProperties` | — | 根节点内联样式 |

根节点继承 `HTMLAttributes<HTMLDivElement>`，默认 `role="status"`，允许调用方显式覆盖；组件无受控状态和自定义事件。

## 5. DOM、样式与无障碍

- 根节点：`div.qizhi-empty`；纵向居中，间距 8px，最小宽度 0。
- 默认图片：`img.qizhi-empty__image`，64×40，空 `alt` 且 `aria-hidden="true"`。
- 描述：`div.qizhi-empty__description`，14px/22px，`color-text-4`。
- 组件本体没有 hover、active、focus、disabled、loading 或动画。
- Demo 外层负责旧站 254px 展示区和居中布局，不进入公共 API。

## 6. Demo、API 与测试

- Demo 顺序：仅“基本用法”。
- Demo 文案：`Empty` 空状态组件的基础用法。
- 复制代码与预览同源，使用 `@wangxiaojinger/qizhi-react`；不显示文件名标题。
- 测试覆盖默认 SVG、默认/自定义/隐藏描述、ref、原生属性、文档同源、API 元数据和三视口几何。

## 7. 发布门槛

- 类型检查、单元测试、文档测试、构建与 1440/1024/375 E2E 全部通过。
- 三档截图人工核对，无页面和 Demo 横向溢出、无新增控制台错误。
- 执行者结论最多为 `candidate_pass`。
