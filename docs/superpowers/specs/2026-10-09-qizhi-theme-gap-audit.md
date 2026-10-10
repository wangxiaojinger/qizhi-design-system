# QIZHI Token 第二阶段 C：主题差距审计

## 结论

- 状态：`candidate_pass`
- 独立最终验证：`pending`
- 审计基线：`af43fbf`（第二阶段 B 完成提交）
- 范围：硬编码颜色、阴影、间距和层级；品牌色、局部组件主题和紧凑密度覆盖能力。
- 非目标：不实施暗色主题，不替换现有视觉值，不新增或迁移 Token，不修改组件运行时代码。

第二阶段 C 的审计交付已补齐：扫描覆盖全部被实际引用的第一方 CSS source，逐声明清单可追溯；八个现有 Component Token 命名空间均有品牌色、局部主题、密度和 Portal 边界处置；三档视口运行时矩阵已真实执行。

当前架构仍不能称为完整主题系统。已确认的核心差距是：单个品牌锚点不会派生完整状态色阶；局部变量不会自动穿过 Portal；Map 尺度的局部覆盖不会逆向改写根作用域 Component Token；大量组件和旧静态页面仍存在待分类或待迁移的字面量。

## 审计产物

- `scripts/theme-gap-audit-lib.mjs`：声明级扫描与分类逻辑；
- `scripts/audit-theme-gaps.mjs`：可重复执行的静态审计命令；
- `tests/theme-gap-audit.node.mjs`：多行、混合 `var()`/字面量、结构常量和扫描范围回归；
- `scripts/theme-runtime-audit-matrix.mjs`：八组件三维能力矩阵；
- `scripts/audit-theme-runtime.mjs`：三档视口真实浏览器探针；
- `2026-10-09-qizhi-theme-gap-audit-data.json`：逐声明静态清单；
- `2026-10-09-qizhi-theme-runtime-audit-data.json`：逐视口、逐组件、逐检查运行时证据。

复现命令：

```text
pnpm audit:theme
pnpm audit:theme:test
pnpm audit:theme:runtime
pnpm audit:theme:check
```

## 扫描口径

### 纳入

- 根级旧站 `styles.css`；
- `packages/qizhi-react/src/**/*.css`；
- `apps/qizhi-docs/src/**/*.css`；
- `apps/qizhi-react-smoke/src/**/*.css`；
- `generated-react-pages/*/src/**/*.css`。

### 排除

- `node_modules`、`dist` 和构建产物；
- `assets/remixicon` 等第三方或供应商资产；
- 没有被源码引用的 CSS 副本；当前明确记录 `apps/qizhi-docs/src/table/tableDocs 2.css` 1 个孤立文件；
- SVG/图标内部固有填充、运行时计算尺寸和非 CSS 数据。

### 识别与分类

扫描器解析跨行声明，不再因值中出现 `var(...)` 就跳过同一声明内的字面量。例如 `0 4px 16px var(--color-shadow-border-strong)` 会保留为阴影候选。

每条结果记录 `id、scope、file、line、column、category、property、value、classification、reason`；`id` 包含列号，保证同一行重复属性仍可唯一追踪。分类为：

- `theme-token-candidate`：直接影响主题或密度，适合进入后续迁移评审；
- `structural-constant`：箭头偏移、绝对定位、负位移等结构几何，不应机械发布为公共 Token；
- `review-required`：文档、旧站或职责不明确，需要产品/设计语义判断。

这是一份候选清单，不等于应新增 2986 个 Token。

## 静态结果

共扫描 136 个实际被引用的第一方 CSS 文件，记录 2986 条声明级发现；另将 1 个未引用 CSS 副本单独列出，不把它冒充运行时输入。

| 范围 | 文件 | 发现 |
| --- | ---: | ---: |
| 公共组件运行时 | 66 | 800 |
| 文档站运行时 | 66 | 498 |
| React Smoke | 1 | 9 |
| 生成页面 | 2 | 81 |
| 根级旧站 | 1 | 1598 |

| 类别 | 数量 |
| --- | ---: |
| 颜色 | 431 |
| 阴影 | 125 |
| 间距/定位 | 2343 |
| 层级 | 91 |

| 分类 | 数量 |
| --- | ---: |
| 主题 Token 候选 | 1516 |
| 结构常量 | 450 |
| 需人工判断 | 1020 |

现有 Token 清单仍是 172 个 Component Token，分布于 Button、Input、Select、Modal、Table、Tooltip、Popover、Dropdown 八个命名空间。

## 八组件主题能力矩阵

“适用”表示已执行至少一项真实运行时检查；“不适用”不是遗漏，而是该组件当前没有直接品牌锚点。

| 组件 | 品牌色 | 局部主题 | 密度 | Portal |
| --- | --- | --- | --- | --- |
| Button | 适用：默认态随 `primary-6`，hover 保持独立色阶 | 适用：局部覆盖及兄弟隔离 | 适用：Component Token 生效，局部 Map 不逆向传播 | 否 |
| Input | 适用：focus 随 `primary-6` | 适用：局部覆盖及兄弟隔离 | 适用：Component Token 生效，局部 Map 不逆向传播 | 否 |
| Select | 适用：focus 随 `primary-6` | 适用：control 局部生效；popup 验证 Portal 边界与根级覆盖 | 适用：control 与 popup option 均验证 | 是 |
| Modal | 不适用：Modal 无直接品牌 Token，页脚按钮归 Button 契约 | 适用：验证局部失败与根级生效 | 适用：Portal 内 padding 覆盖 | 是 |
| Table | 不适用：当前命名空间无直接主品牌锚点 | 适用：表面 Token 局部覆盖 | 适用：cell padding 覆盖 | 否 |
| Tooltip | 不适用：中性解释表面 | 适用：验证局部失败与根级生效 | 适用：Portal 内 padding 覆盖 | 是 |
| Popover | 不适用：中性内容表面 | 适用：验证局部失败与根级生效 | 适用：Portal 内 padding 覆盖 | 是 |
| Dropdown | 适用：loading 状态随 `primary-6` | 适用：popup 局部覆盖 | 适用：item 最小高度覆盖 | 否 |

运行结果：1440×900、1024×900、375×812 三档均为失败检查 0、矩阵遗漏 0、console/pageerror 0、横向溢出 0。

## 实质差距清单

### P0：第三阶段契约前置

#### TG-01 单个品牌锚点不能形成完整交互色阶

- 事实：Button 默认色及 Input/Select focus 响应 `--primary-6`；Button hover 仍依赖 `--primary-5`，active/disabled 也各自依赖独立色阶。
- 风险：消费者只改 `--primary-6` 会形成新旧品牌状态混用。
- 第三阶段建议：明确要求完整 `primary-1..10` 色板，或提供构建期色板生成器；不要把“可逐项覆盖色板”误写成“单锚点自动派生”。

#### TG-02 Portal 打断局部主题继承

- 事实：Select popup、Modal、Tooltip、Popover 的触发器局部变量不会进入 `document.body` 下的 Portal；根级覆盖有效。
- 风险：嵌套主题或局部品牌区中，触发器与浮层视觉不一致。
- 第三阶段建议：ThemeProvider 同时管理内容根与 portal host，并明确嵌套主题、多个 host、销毁清理和 container 契约。

#### TG-03 紧凑密度没有统一消费契约

- 事实：局部 Map 尺度不会逆向改写 Button/Input/Select 已声明的 Component Token；直接覆盖 Component Token 才生效。
- 风险：消费者需维护跨组件变量集合，容易遗漏 padding、行高、图标及 Portal 浮层。
- 第三阶段建议：发布 `comfortable | compact` 作用域变量集合，由其显式重定义 Component Token。

### P1：优先扩面的组件缺口

#### TG-04 导航组件品牌状态未收口

TopNavigation、SideNavigation 仍有品牌蓝透明态、选中态、徽标、渐变和阴影字面量。建议新增各自 Component Token；金色身份/权益视觉保持独立语义，不直接绑定主品牌。

#### TG-05 浮层层级与阴影职责未统一

AutoComplete、Cascader、DatePicker、Drawer、TimePicker、TreeSelect、Message、Notification、Popconfirm 等仍存在层级和阴影候选。建议先定义层级职责矩阵，再按组件族新增 Token；相同数值但不同职责可保留独立语义。

#### TG-06 Table 主题表面仍不完整

Table 的主体/单元格表面和固定列边缘阴影仍有未纳入现有 12 个 Component Token 的候选。建议补 body/cell background、fixed edge overlay 与 fixed shadow，并保留当前默认视觉和兼容回退。

#### TG-07 输入与选择家族覆盖不一致

Select 已有 Component Token，但 AutoComplete、Cascader、TreeSelect、DatePicker、TimePicker 尚未形成同级契约。建议共享 Alias 只表达跨组件语义，各组件仍保留独立 Component Token，禁止组件 Token 互相引用。

### P2：按真实主题需求治理

#### TG-08 业务组件专用视觉需先判定语义

BusinessMetrics、BusinessObjects、ObjectSelector 中一部分颜色、渐变和阴影属于业务图形编码或装饰，不应直接提升为全局 Alias。只有跨页面稳定复用且明确需要换肤的职责进入 Component Token。

#### TG-09 间距候选不能机械迁移

间距/定位是最大类别。padding、gap、control geometry 更可能属于密度；负 margin、箭头偏移和绝对定位多为结构常量。第三阶段只迁移影响密度的职责，其余保留内部常量或注释。

#### TG-10 旧站与文档站需分开治理

旧站占 1598 条发现，文档站占 498 条。它们不应反向定义公共组件 Token；应在组件主题契约稳定后，单独决定是否消费 Alias 或建立站点级 Token。

## 第三阶段建议

1. 3A：定义 ThemeProvider、Portal host、完整品牌色板输入和 `comfortable | compact` 契约；
2. 3B：按导航 → 输入/选择 → 日期时间 → 浮层反馈 → Table 的顺序扩展 Component Token；
3. 3C：只完成暗色主题前置覆盖与对比度验收，不在本阶段直接发布暗色主题。

每批继续遵守 `Component Token → 旧公共变量 → 当前字面量`，不反转旧变量依赖，不改变 RGB 通道值类型，不静默改变默认视觉。

## 验证与边界

- 审计单元测试：11/11 通过；
- 浏览器矩阵：3 视口 × 8 组件，失败 0、遗漏 0、console/pageerror 0、横向溢出 0；
- 既有 Token 视觉基线：当前工作树独立服务下 45 项均通过；合并运行首轮 44/45，唯一失败是 mobile Dropdown 文本 19 像素抗锯齿差异，单例复跑 1/1 通过；
- 完整 `pnpm verify`：Token 测试 24/24、Vitest 2416/2416、类型检查与全部构建通过；
- 静态与运行时产物均记录源码 SHA-256 指纹；`audit:theme:check` 会拒绝旧产物、失败产物及不完整运行时证据；
- 运行时命令默认自行启动独立 Vite 服务并在结束后关闭，不再依赖人工提供的端口；如显式传入外部地址，产物会记录为 `external`；
- 运行时探针开始时先写入 `running`，异常时改写为 `failed`，不会遗留旧的绿色结果；
- 扫描和探针均已持久化，不再依赖临时命令；
- 本阶段没有实施暗色主题，也没有修改组件运行时代码；
- 当前只能声明 `candidate_pass`，独立最终验证仍为 `pending`。
