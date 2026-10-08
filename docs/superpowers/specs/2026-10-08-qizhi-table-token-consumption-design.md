# QIZHI Token 第二阶段 A：Table Token 正式接入设计

## 目标

在不改变 Table 现有公共 API、交互、计算样式和响应式表现的前提下，让第一阶段发布的 `component.table.*` 候选变量正式驱动 Table 样式，并继续保留旧公共变量的覆盖能力。

本阶段完成后：

- Table 的常规字号、行高、表头背景、三档纵向内边距、横向内边距、边框、固定列层级、行 hover 和 selected 状态由公开 Component Token 驱动；
- 既有 `--gray-1`、`--space-*`、`--font-size-14`、`--line-height-regular`、`--color-border-1`、`--color-fill-1`、`--color-primary-light-1` 覆盖继续沿 Token 引用链生效；
- 消费者可直接覆盖单个 `--component-table-*` 变量，只影响 Table 对应职责；
- 默认、middle、small 三档密度和 1440、1024、375px 视觉保持迁移前基线；
- Form 与 Tabs 的两项陈旧 E2E 断言先按当前同源文档契约修正，避免把既有测试债务误判为本阶段回归。

## 已确认现状

- 第一阶段已发布 11 个 `component.table.*` Token，但描述仍注明“CSS 消费延后”，`table.css` 尚未引用它们。
- Table 默认、middle、small 的纵向内边距分别为 16、12、8px；桌面横向内边距为 16px，600px 以下为 12px。
- 当前单一 `component.table.cell.padding.inline` 只能表达桌面 16px，无法在允许直接组件覆盖的同时准确表达移动端 12px。
- 当前展开行规则使用 `.qizhi-table__expanded td` 后代选择器，会把外层 `16px 64px` 内边距错误施加到嵌套 Table；既定 Table 契约要求使用 `.qizhi-table__expanded > td`。
- Tabs 同源 registry 和单元测试已明确为 12 组 Demo，E2E 仍断言 11。
- Form 同源 Demo 和单元测试已明确不再展示“批量编辑补丁”原文，E2E 仍查找已移除的 `role=status`。

## 范围

### 1. 验收契约预清理

只修正已经由同源实现和单元测试证明陈旧的断言：

- Tabs E2E 的名称及数量从 11 改为 12；
- Form E2E 不再查找已删除的补丁 JSON，改为验证目标摘要、结果摘要和失败明细等当前可见契约。

该步骤不修改 Tabs 或 Form 的产品实现和视觉。

### 2. Table Token 清单

保留并正式接入第一阶段的 11 个 Token：

| Token | Table CSS 职责 |
| --- | --- |
| `component.table.header.background` | 表头背景 |
| `component.table.cell.padding.block.large` | 默认纵向内边距 |
| `component.table.cell.padding.block.medium` | middle 纵向内边距 |
| `component.table.cell.padding.block.small` | small 纵向内边距 |
| `component.table.cell.padding.inline` | 默认横向内边距 |
| `component.table.font.size` | Table 根字号 |
| `component.table.line.height` | Table 根行高 |
| `component.table.border` | 外框、单元格和行分隔边框 |
| `component.table.fixed.z.index` | 固定列表层级 |
| `component.table.row.hover.background` | 可 hover 行背景 |
| `component.table.row.selected.background` | 已选行背景 |

新增一个必要的响应式 Token：

| Token | 默认值 | 职责 |
| --- | --- | --- |
| `component.table.cell.padding.inline.compact` | `var(--space-12)` | 600px 以下横向内边距 |

不复用 `component.table.cell.padding.inline` 后再在媒体查询中写死 12px，因为那会使消费者直接覆盖默认横向 Token 时在移动端失效。新增职责明确的 compact Token 是保持现有响应式行为和组件级覆盖能力的最小方案。

### 3. CSS 回退链

每个消费点采用“组件 Token → 旧公共变量 → 当前字面量”的回退顺序。例如：

```css
font-size: var(--component-table-font-size, var(--font-size-14, 14px));
```

这样同时满足三种加载环境：

1. 完整加载 Token 包时，由 Component Token 驱动；
2. 只加载组件 CSS 时，旧变量覆盖仍然有效；
3. 两类变量都缺失时，现有字面量保证视觉不变。

Token 清单自身继续从 Map 或 Alias 层引用旧公开变量，不反转引用方向，不允许 Component Token 引用另一个 Component Token。

### 4. 明确不迁移的 Table 样式

本阶段不为了“消除所有字面量”扩大 Token 面：

- 表体白色背景、条纹行背景和展开行背景；
- 表头短分隔线的 `color.border.2`；
- 排序图标颜色、焦点环、固定列阴影；
- selection／expand 列宽、排序器间距、分页间距；
- 展开行特有的 `16px 64px` 内边距。

这些职责需要单独审计后再决定是否形成公共 Component Token。提前纳入会混淆“常规单元格尺度”和“特殊结构尺度”。

## 兼容与视觉约束

- 不删除、不重命名任何旧变量或现有 `component.table.*` Token。
- 不修改 Table Props、类型、导出、Demo 数据、Demo 顺序或默认交互。
- 不改变自然换行和显式 `ellipsis` 契约。
- 不改变固定列、展开行、嵌套 Table、树形、合并、拖拽、排序及选择行为。
- 默认计算样式必须与迁移前一致；Token 覆盖测试只验证覆盖能力，不更新默认视觉基线。
- 恢复 `.qizhi-table__expanded > td` 的既定作用域，修复当前后代选择器污染嵌套 Table 单元格的问题；该项是明确缺陷修复，不纳入“默认像素完全不变”的区域。

## 测试与验收

实施采用 TDD，先让以下契约失败：

1. Token 单元测试要求 12 个 Table Component Token 均存在、描述不再声明延后，并且 `table.css` 实际消费每个 Token；
2. Table 组件测试或 CSS 契约测试验证每个消费点包含旧变量和字面量回退；
3. 浏览器测试直接覆盖 `--component-table-*`，验证目标职责变化且非目标组件不受影响；
4. 浏览器测试覆盖旧变量，验证兼容链继续传递到 Table；
5. 三档密度、自然换行、ellipsis、固定列、展开／嵌套 Table 在 1440、1024、375px 下回归；
6. 从实施前提交生成不受嵌套修复影响的 Table 视觉基线，对默认态逐像素比较；嵌套区域以精确几何断言验收；
7. `pnpm verify`、Table 定向 Vitest、Form/Tabs/Table 定向 Playwright 全部执行并如实记录。

## 交付边界

- 本阶段不接入 Tooltip、Popover 或 Dropdown Token；它们属于第二阶段 B。
- 本阶段不实现暗色、紧凑主题或品牌换肤；只验证 Table 的覆盖链具备后续主题能力。
- 本阶段不发布包、不部署文档站、不升级外部消费者。
- 自动化和主执行者验收最多记录为 `candidate_pass`；独立最终验收保持 `pending`。
