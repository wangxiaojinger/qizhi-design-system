# 详情头部 React Island 验证记录

## 结果

- 状态：`candidate_pass`
- 独立最终验证：`pending`
- 契约：`docs/specs/qizhi-detail-header-contract-v1.md`

## 已验证

- 公共 `DetailHeader` 类型与根项目 typecheck 通过。
- Demo 使用公共 `Button`、`Tooltip`、`Avatar.Group`、`Avatar`、`Tabs`、`Drawer`、`Table`、`Link` 和图标库。
- Demo TSX 通过 `?raw` 同源用于预览、展示代码与复制代码。
- 已移除详情头部旧静态 HTML、旧 CSS 和 `initDetailHeaderDemos`，避免两套实现同时控制相同公共类名。
- 页面保留基本用法、交互说明和 API，并由右侧目录识别为三个锚点。
- 状态可在服务中/已下线之间双向切换；离线状态点的计算色为 `rgb(201, 205, 212)`，与 `color-text-4` 一致。
- 页签导航保留在 174px 详情头部内，两个内容面板作为头部外部兄弟渲染；`aria-controls` 指向对应外部面板。
- 创建人 Tooltip 覆盖 hover 与键盘 focus；Tabs 覆盖方向键切换和焦点移动。
- 960px 桌面 Drawer、版本表格、真实回滚回调、遮罩、关闭按钮、Esc 与焦点恢复均通过浏览器交互。
- Playwright 1440、1024、375 三档通过；目标 section 无横向溢出；375px Demo padding 为 16px，主卡宽度等于 Demo 内容宽度；移动端 Drawer 不超过视口。
- 已人工查看三档目标组件、离线态、Tooltip 和 Drawer 打开态截图，未发现内容、箭头、边界或阴影裁切。
- `pnpm build` 通过；仅保留既有大 chunk 警告。

## 环境限制

- Vitest 在当前 iCloud 工作树中使用 forks/threads 单 worker 均停在启动阶段，未进入测试收集；对应 Tabs 回归测试已经建立并通过 TypeScript 编译，但仍需在 worker 文件可稳定读取后补跑。
