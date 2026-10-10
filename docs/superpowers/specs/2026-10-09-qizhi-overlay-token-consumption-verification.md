# QIZHI Overlay Component Token 接入验证记录

## 结论

- 状态：`candidate_pass`
- 独立最终验证：`pending`
- 基线提交：`2dc3434`
- 实施提交：`9c9be7c`、`3032676`、`2a319d5`、`21dae19`、`8a74353`、`29641e5`
- 范围：Tooltip、Popover、Dropdown、Dropdown.Button 的 Component Token 接入；未发布、未部署、未升级外部消费者。

## Token 结果

Token 总数由 524 增至 585，共新增 61 项：

- Map（1）：`z.index.popover`
- Tooltip（17）：`component.tooltip.background`、`text`、`z.index`、`min.height`、`padding.block`、`padding.inline`、`radius`、`font.size`、`line.height`、`shadow`、`arrow.size`、`mini.min.height`、`mini.padding.inline`、`mini.font.size`、`mini.line.height`、`motion.duration`、`motion.easing`
- Popover（17）：`component.popover.background`、`text`、`content.text`、`border`、`z.index`、`width`、`padding.block`、`padding.inline`、`radius`、`shadow`、`font.size`、`line.height`、`title.margin.block.end`、`title.font.weight`、`arrow.size`、`motion.duration`、`motion.easing`
- Dropdown（26）：`component.dropdown.popup.background`、`popup.border`、`popup.z.index`、`popup.min.width`、`popup.padding`、`popup.radius`、`popup.shadow`、`item.min.height`、`item.padding.block`、`item.padding.inline`、`item.radius`、`item.text`、`item.font.size`、`item.line.height`、`item.hover.background`、`item.hover.text`、`trigger.gap`、`icon.size`、`motion.duration`、`motion.easing`、`trigger.disabled.text`、`button.divider`、`button.secondary.divider`、`button.loading.background`、`button.loading.motion.duration`、`button.loading.motion.easing`

全部新 Token 为 `stable`。组件消费遵循 `Component Token → 旧公共变量 → 当前字面量`；无旧变量时为 `Component Token → 当前字面量`。旧变量未删除、改名或改变值类型，三个 Overlay 命名空间互不引用。

## 自动验证

### 仓库门禁

`pnpm verify`：通过。

- API manifest：current，115 个 API groups 生成通过
- Token：585 个校验通过；24/24 `node:test` 通过
- TypeScript：根项目与 `@wangxiaojinger/qizhi-react` 通过
- Vitest：464 files / 2416 tests 通过
- 文档构建、React 包构建、smoke bundle 与 bundle-boundary：通过
- Vite 仅报告既有大 chunk 警告，无构建错误

### 直接消费者矩阵

命令覆盖 Tooltip、Popover、Dropdown、Table、Slider、LogViewer、BusinessObjects、Select、Cascader、TreeSelect、Menu/SideNavigation 与 Input，视口为 1440×900、1024×900、375×812，`--workers=1`。

结果：112 passed / 2 skipped。两个 skip 均为 `menu-react-island.spec.ts` 中明确限定 `desktop-1440` 的 TopNavigation overflow 用例，在 1024 与 375 档按设计跳过；无意外 skip。

覆盖包括真实 Tooltip/Popover 打开态、Dropdown 级联菜单、键盘/焦点路径、Portal/局部弹层边界、水平溢出及各测试内的 console/pageerror 断言。

### 视觉基线

`tests/e2e/token-phase2-overlay-visual-baseline.spec.ts`：21 passed，未使用 `--update-snapshots`，无像素差异。

快照覆盖 Tooltip 基础与 mini、Popover 基础与方向箭头、Dropdown 基础与级联、Dropdown.Button primary/secondary/loading，均在三档视口执行。Dropdown 级联基线等待正式 React Island 的四个 `data-item-key` 子菜单触发器后再截图；修正前的三张图误捕获了 hydration 前静态 DOM，纠正后 1024 档连续三次稳定通过。

## 范围审计

`git diff --check` 通过，工作树在写报告前无未提交修改。`2dc3434..HEAD` 未修改：

- Tooltip、Popover、Dropdown 的 TSX、Props、导出或 ARIA 代码
- Demo 文案、数量、顺序或业务数据
- 非目标组件 CSS
- `package.json`、版本、发布 workflow 或部署文件

## 实施裁决与剩余边界

1. `component.dropdown.button.loading.background` 使用 `rgb(var(--primary-6))`。设计稿写为 `primary-4`，但迁移前真实浏览器计算值和冻结视觉均为 `primary-6`；本阶段以兼容与默认视觉不变为上位约束。消费者仍可直接覆盖该 Component Token。
2. 只纠正了三张 Dropdown 级联快照，使其等待正式 React Island；没有放宽截图阈值，也没有更新其余 18 张快照。
3. 当前证据支持 `candidate_pass`。独立最终验证仍为 `pending`，且本阶段没有包发布、文档站部署或外部消费者升级回执。
