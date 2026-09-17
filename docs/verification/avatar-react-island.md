# QIZHI Avatar React Island 验证记录

日期：2026-08-21  
工作区：`.worktrees/button-react-island`  
分支：`feat/button-react-island`  
本地服务：`http://127.0.0.1:5174/`（5173 已被占用，Vite 自动切换）

## 交付范围

- `@wangxiaojinger/qizhi-react` 正式 `Avatar`、`Avatar.Group`、类型和样式。
- 正式 `CameraIcon`，并复用既有 `UserIcon`、`EditIcon`、`Button`、`Space`。
- 旧站 5 个 Avatar Demo、同源 TSX、查看/复制代码和结构化 API。
- 1440、1024、375 三档布局、交互、控制台和截图验收。

## 自动检查

| 检查 | 命令 | 结果 |
|---|---|---|
| 原生脚本语法 | `node --check script.js` | exit 0 |
| HTML 结构 | Node ID/hash/aria-controls 检查脚本 | 635 个 ID；重复 0；缺失 hash 0；缺失 aria-controls 0 |
| 全量组件与文档测试 | `pnpm test` | 121 个测试文件、627 项测试全部通过 |
| TypeScript | `pnpm typecheck` | exit 0 |
| 官网、组件包和 smoke 构建 | `pnpm build` | exit 0；包含 `dist/avatar/Avatar.js`、`dist/icon/CameraIcon.js` 和 `dist/qizhi-react.css`；smoke bundle boundary 通过 |
| Avatar 三视口 E2E | `QIZHI_DOCS_BASE_URL=http://127.0.0.1:5174 pnpm exec playwright test tests/e2e/avatar-react-island.spec.ts` | 6/6 通过 |
| 全量 E2E | `QIZHI_DOCS_BASE_URL=http://127.0.0.1:5174 pnpm e2e` | 在构建完成后重启的干净 Vite 服务上 84/84 全部通过；Avatar 6 项全部通过 |

构建存在 Vite 的主 chunk 大于 500kB 警告；构建仍以 exit 0 完成。Playwright 还报告 `NO_COLOR` 被 `FORCE_COLOR` 覆盖的环境提示，不属于页面控制台错误。

## Avatar E2E 实测

- 5 个 Demo 顺序、标题、说明和实例数量保持：5 / 8 / 8 / 2 / 4。
- 尺寸实测为 64 / 40 / 32 / 24px。
- 圆形头像计算圆角为 50%；方形头像为 4px。
- Avatar.Group 相邻头像左边界差为 default 30px、small 24px，对应 -10px / -8px 重叠。
- 右下角编辑按钮为 24×24px，来自正式 Button。
- mask/button 均完成真实点击；Enter 和 Space 键盘路径完成。
- 自动缩放的 DS、QIZHI、Design、Avatar 内容均未超出头像边界。
- 三档视口均满足 `documentElement.scrollWidth <= clientWidth`。
- Avatar 用例收集到的浏览器 console error 与 page error 均为 0。

## 截图与人工复核

完整页面：

- `test-results/avatar-react-island-Avatar-保持五组旧站-Demo、尺寸、形状、重叠和三档响应式-desktop-1440/avatar-desktop-1440.png`
- `test-results/avatar-react-island-Avatar-保持五组旧站-Demo、尺寸、形状、重叠和三档响应式-narrow-1024/avatar-narrow-1024.png`
- `test-results/avatar-react-island-Avatar-保持五组旧站-Demo、尺寸、形状、重叠和三档响应式-mobile-375/avatar-mobile-375.png`

交互按钮局部：

- `test-results/avatar-react-island-Avatar-两种触发入口支持点击和键盘操作-desktop-1440/avatar-trigger-desktop-1440.png`
- `test-results/avatar-react-island-Avatar-两种触发入口支持点击和键盘操作-narrow-1024/avatar-trigger-narrow-1024.png`
- `test-results/avatar-react-island-Avatar-两种触发入口支持点击和键盘操作-mobile-375/avatar-trigger-mobile-375.png`

已逐张人工查看：三档中标题与说明正常换行；头像内容、Logo、组边框和阴影、mask 遮罩、编辑按钮和焦点边界完整；375px 下 Demo 合理换行；API 表在自身滚动容器内横向滚动，页面没有横向溢出；未发现文字、阴影、圆角或触发入口被裁切。

## 状态与限制

```text
verification_after_implementation: candidate_pass
independent_final_verification: pending
```

- Avatar 约定范围内的组件、文档、类型、构建、三视口浏览器交互和截图均有通过证据。
- 全量 E2E 在构建完成后重启的干净 Vite 服务上 84/84 通过；构建期间热更新风暴中的一次 Dropdown 窄屏失败未在干净环境复现，因此不计为稳定回归。
- 未执行独立审查；本记录由实现执行者生成。
