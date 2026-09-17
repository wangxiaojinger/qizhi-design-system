# QIZHI Select React Island 验证记录

日期：2026-08-20  
状态：`candidate_pass`  
独立验证：`pending`

## 范围

- `@wangxiaojinger/qizhi-react` Select 类型、样式、行为与公共导出。
- 旧站 18 组 Demo 的 React 迁移、同源代码和结构化 API。
- Dropdown.Menu / Dropdown.Item、Button、Icon、Input 和 Divider 复用。
- 1440/1024/375 交互、几何、溢出、弹层裁切链和打开态截图。

## 可重跑检查

```bash
node --check script.js
pnpm verify
pnpm exec playwright test tests/e2e/select-react-island.spec.ts
```

Playwright 覆盖：

- 18 组 Demo 和独立 `select-API` 锚点。
- 基础、禁用、错误、警告、清除、Dropdown 菜单复用。
- 单选、多选、键盘 Escape、24/28/32/36px 尺寸。
- 创建、分词、自定义触发节点、扩展菜单、联动、隐藏已选、弹层宽度和最大标签数。
- 页面水平溢出、弹层视口边界、非 body 祖先裁切链和控制台错误。

## 人工截图结论

- 1440：基础 Demo 为 2×2，154×32px；弹层位于触发器下方，文字、选中背景、阴影和边缘完整。
- 1024：保留 2×2 布局，操作区与 Demo 右边界对齐，弹层无裁切。
- 375：基础 Demo 转为单列，控件占可用宽度，弹层不超出视口，页面无水平滚动。
- 单选弹层不显示多选 Checkbox；多选才显示选中指示。

## 限制

- 执行者仅声明 `candidate_pass`；未进行独立人工终验。
- 全量构建保留现有的大于 500kB chunk 警告，本次没有扩大范围做代码分割。
