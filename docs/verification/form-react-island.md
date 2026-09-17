# Form React Island 验收记录

日期：2026-08-24  
状态：`candidate_pass`  
独立最终验证：`pending`

## 契约范围

- 旧站 3 个 Demo：基础用法、表单布局、受控表单；标题、原始说明、顺序、
  数据、文案、布局、尺寸、初始状态和交互均由测试锁定。
- 官网预览使用 `@wangxiaojinger/qizhi-react` 正式 `Form`、`Form.Item`，并复用 Input、
  Select、Button、Radio、Tooltip 和现有图标。
- 展示代码和复制代码均从实际渲染的 Demo TSX 原文读取。
- v1 只提供布局和语义容器；字段注册、统一 values store、内建校验、
  `setFieldsValue` 和异步提交不在本次范围。

## 自动化证据

- TDD 红灯：Form 与 Form 文档测试在实现前因模块不存在而失败。
- Form 范围测试：2 个文件、8 个测试通过。
- `pnpm typecheck`：通过。
- `pnpm test`：225 个文件、1093 个测试通过，0 失败。
- `pnpm build`：文档站、`@wangxiaojinger/qizhi-react` 和 smoke app 构建通过；
  bundle boundary 通过。
- `node --check script.js`：通过。
- `tests/e2e/form-react-island.spec.ts`：1440/1024/375 共 3 项通过。

## 三档浏览器验收

| 视口 | 布局 | 交互 | 溢出/控制台 | 人工截图结论 |
|---|---|---|---|---|
| 1440 | 垂直表单 606px；水平表单首列 112px | 输入计数、Select、布局切换、Radio、Tooltip、代码展开与复制通过 | 无横向溢出，无新控制台错误 | 三个 Demo 与 Tooltip 边缘、箭头、间距完整 |
| 1024 | 保持桌面布局并适配正文宽度 | 同上 | 同上 | 标签、控件和辅助文案无换行或裁切 |
| 375 | Form 单列；镜像 Radio 纵向排列 | 输入、Select、布局切换、Radio、Tooltip 通过 | 各 Demo `scrollWidth === clientWidth`，无新控制台错误 | 控件、文案和 Tooltip 均在视口内 |

## 视觉证据说明

- 每个视口均保存基础、布局、受控三组局部截图及 Tooltip 打开态视口截图，
  并已人工查看。
- 手机端元素长截图会把固定顶栏拼入滚动区域，这是 Playwright 元素截图的
  拼接表现；同次真实视口截图中顶栏与当前表单区域没有遮挡。
- 2026-08-24 复核修正：刷新与两个说明图标使用 `color-text-3`；选择模型
  按钮按内容宽度展示；运行命令改用正式 React `Input`，占位文字使用
  `color-text-4` 并垂直居中；命令与端口组保持 16px 间距，移除 Textarea
  缩放角标。

## 限制

- 本轮完成的是执行者自验，状态为 `candidate_pass`；独立最终验证仍为
  `pending`。
- 构建保留工作区已有的大 chunk 警告，本次未扩大到代码分割优化。
