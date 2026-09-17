# QIZHI Link React Island 验收记录

日期：2026-08-18  
状态：`candidate_pass`  
独立最终验证：`pending`

## 已验证范围

- `@wangxiaojinger/qizhi-react` 导出 `Link`、`LinkIcon`、`EditIcon` 及 Link 公共类型。
- `href` 链接分支、无 `href` 按钮分支、原生属性、ref、禁用行为、status、hoverable、默认与自定义图标。
- 官网五组 Demo 直接调用正式包，预览与展示源码来自相同 TSX 模块。
- API 锚点为全局唯一 `#link-API`；未复用 Button 或 Typography 的 API 锚点。
- 桌面 1440px、窄屏 1024px、手机 375px 均无页面级横向溢出；目标页面控制台无新增错误。
- Link 字号 14px、图文间距 6px、状态 hover、hoverless、禁用优先级、API 字体与颜色规则已在浏览器中检查。

## 执行记录

```text
pnpm verify
结果：23 个测试文件通过，134 项测试通过；类型检查通过；官网与 @wangxiaojinger/qizhi-react 生产构建通过。

QIZHI_DOCS_BASE_URL=http://127.0.0.1:5175 pnpm exec playwright test tests/e2e/link-react-island.spec.ts
结果：desktop-1440、narrow-1024、mobile-375 共 3 项通过。

node --check script.js
结果：通过。

git diff --check
结果：通过。
```

## 截图

- `test-results/link-react-island-desktop-1440.png`
- `test-results/link-react-island-narrow-1024.png`
- `test-results/link-react-island-mobile-375.png`

三张截图均已人工查看。它们是本地验收产物，不作为需要提交的正式源码。

## 延期边界

- 本轮不实现 Dropdown 菜单，只验证 Link 可作为按钮型触发器。
- `loading`、`size`、`underline`、`Link.Group`、自动外链图标、自动补充 `target`/`rel`、路由组件适配均不属于 v1。
- 当前只完成 Link 规范页迁移；其他旧静态页面中的 Link 消费者尚未批量替换。

## 2026-08-19 基础用法收敛复验

- 基础用法由四个示例收敛为两个：一个可点击 Link、一个禁用 Link。
- 先新增断言并确认因收到 4 个 Link 而失败，再修改同源 Demo 使测试通过。
- `pnpm verify`：26 个测试文件、150 项测试全部通过，类型检查和两个生产构建通过。
- Link Playwright 三视口复验：1440、1024、375 共 3 项通过；桌面截图已人工查看。
