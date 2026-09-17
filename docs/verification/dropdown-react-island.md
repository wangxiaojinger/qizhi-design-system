# QIZHI Dropdown React Island 验收记录

日期：2026-08-19  
状态：`candidate_pass`  
独立最终验证：`pending`

## 已验证范围

- 旧规范站 7 个 Dropdown Demo 的标题、说明、顺序、菜单内容、六种方向、两种触发方式、按钮状态、多级菜单和图标菜单均作为冻结基线迁移，未新增旧站不存在的 Demo UI。
- `@wangxiaojinger/qizhi-react` 导出 `Dropdown`、`Dropdown.Menu`、`Dropdown.Item`、`Dropdown.SubMenu`、`Dropdown.Button` 及公共类型。
- 支持 hover/click、受控与非受控展开、外部点击关闭、菜单项回调、ArrowDown 打开并聚焦首项、Escape 关闭并恢复触发器焦点。
- 规范页预览、查看代码和复制代码来自相同 TSX 模块；不拆分或展示独立 Demo CSS。查看代码、复制代码和代码面板复用已迁移 Button 页的正式组件结构与样式，不维护 Dropdown 专属工具按钮。
- Link 的“下拉菜单”消费示例已改为调用正式 Dropdown；独立 smoke 页面只从 `@wangxiaojinger/qizhi-react` 及其 `style.css` 引入。
- 桌面 1440px、窄屏 1024px、手机 375px 均完成真实交互、控制台、页面横向溢出和浮层祖先裁切链检查。

## 执行记录

```text
env CI=true pnpm exec vitest run packages/qizhi-react/src/dropdown/Dropdown.test.tsx
RED：加载态按钮与旧站 aria-disabled 语义不一致，1 项失败。
GREEN：修正后 Dropdown 单元测试 5 项通过。

env CI=true pnpm verify
结果：58 个测试文件、309 项测试通过；类型检查通过；文档站、@wangxiaojinger/qizhi-react 包和独立 smoke 三段生产构建通过。

QIZHI_DOCS_BASE_URL=http://127.0.0.1:5178 ./node_modules/.bin/playwright test tests/e2e/dropdown-react-island.spec.ts
结果：desktop-1440、narrow-1024、mobile-375 的交互验收和旧站计算样式对照共 6 项通过。

node --check script.js
结果：通过。

git diff --check
结果：通过。
```

## 截图人工检查

已人工查看旧站/React 桌面对照截图及手机打开态截图：Dropdown 自身的弹层、菜单项、尺寸、边框、背景、阴影和圆角一致；触发按钮及文档操作按钮复用正式 React Button，不以旧静态按钮样式覆盖公共组件；多级菜单主菜单和北京子菜单完整显示，文字、阴影、边界未被裁切。

## 延期边界

- v1 不新增旧站无证据的 Portal、自动碰撞翻转、右键触发、虚拟列表、菜单选择态或自定义渲染 API。
- 旧站事件 Demo 依赖全局 Message；本次不虚构 Message React 组件，Dropdown 仅提供并验证 `Menu.onClickMenuItem` 回调。
- 按钮加载态工具提示复用旧站现有 `tooltip-demo` 结构与样式；待 Tooltip 正式迁移后再替换为公共 React 组件。
- 手机端文档壳层既有的代码操作区和 API 表格窄屏裁切不属于 Dropdown UI，本次未擅自改动全局文档布局。
