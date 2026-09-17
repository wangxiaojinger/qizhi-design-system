# Statistic React Island 验收记录

日期：2026-08-24  
状态：`candidate_pass`  
独立最终验证：`pending`

## 契约范围

- 旧站 4 个 Demo：基础用法、前缀后缀/自定义样式、时间格式、加载中。
- 官网预览使用 `@wangxiaojinger/qizhi-react` 正式 `Statistic`。
- 展示代码和复制代码从同一 Demo TSX 读取。
- 加载占位为 Statistic 内部能力，未新增公共 Skeleton。

## 自动化证据

- `pnpm typecheck`：通过。
- `pnpm test`：221 个文件、1077 个测试通过，0 失败。
- Statistic/Tooltip 范围测试：3 个文件、12 个测试通过。
- `pnpm build`：文档站、`@wangxiaojinger/qizhi-react` 和 smoke app 构建通过；bundle boundary 通过。
- `node --check script.js`：通过。
- `tests/e2e/statistic-react-island.spec.ts`：1440/1024/375 共 3 项通过。
- `tests/e2e/demo-code-actions.spec.ts`：5 个迁移页×3 视口，共 15 项通过。

## 三档浏览器验收

| 视口 | 布局 | 交互 | 溢出/控制台 | 人工截图结论 |
|---|---|---|---|---|
| 1440 | 基础两项、自定义三项横排，列间距 60px | Switch Space/Enter 与 loading 联动 | 无横向溢出，无新控制台错误 | 标题、数值、小数、箭头、时间和 Skeleton 完整 |
| 1024 | 保持横排和 60px 列间距 | 同上 | 同上 | 无文字换行、裁切或边界冲突 |
| 375 | 基础两项、自定义三项单列，行间距 24px | 同上 | 同上 | 时间为 20px；四个 Demo 局部截图均完整 |

## 调试中发现的直接阻塞

- 隐藏的 Tooltip 路由中，受控默认打开的 Portal 曾显示在视口 `8,8`，污染 Statistic 截图。
- 根因是 Tooltip 定位未检查触发器的隐藏祖先。
- 已增加回归测试，并在触发器或祖先 `display:none` / `visibility:hidden` 时保持弹层不可见。

## 限制

- 旧站未保存原复制源码，因此时间 Demo 的原始时间戳无法恢复；React Demo 使用可稳定输出 `2019/04/10 12:16:53` 的本地时间数据。
- 构建保留工作区已有的大 chunk 警告，本次未扩大到代码分割优化。
