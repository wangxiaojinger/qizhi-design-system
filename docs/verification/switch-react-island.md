# Switch React Island 验证记录

## 实施范围

- 新增 QIZHI `Switch` React 组件、TypeScript 类型与样式出口。
- 按旧站顺序迁移 4 组 Demo：基础用法、不同尺寸、自定义文案、加载中。
- Demo 源文件同时作为复制代码来源。
- 加载状态复用 QIZHI `LoadingIcon`。
- Tag 文档中的手写开关替换为公共 `Switch`。

## 实际检查

- `pnpm typecheck`：通过。
- `pnpm test`：167 个测试文件、830 项测试通过。
- `pnpm build`：通过；存在既有的大包体积提示，无构建失败。
- `QIZHI_DOCS_BASE_URL=http://127.0.0.1:5177 pnpm exec playwright test tests/e2e/switch-react-island.spec.ts`：1440、1024、375 三个项目通过。
- 三档均实际验证点击、Space、自定义文案、加载阻止交互、44×24px 与 32×16px 尺寸、页面溢出和控制台错误。
- 三档截图均已人工查看：Demo 数量、排列、开关尺寸、禁用透明度、ON/OFF 文案与加载图标均可见，未发现目标组件横向溢出。

## 结论边界

当前为 `candidate_pass`；未宣称已完成独立最终审核。
