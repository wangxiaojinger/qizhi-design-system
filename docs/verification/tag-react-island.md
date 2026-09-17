# QIZHI Tag React Island 验证记录

日期：2026-08-20  
状态：`candidate_pass`  
独立验证：`pending`

## 范围

- `@wangxiaojinger/qizhi-react` Tag 类型、样式、行为、图标与公共导出。
- 旧站 6 组 Demo 的 React 迁移、同源代码和结构化 API。
- Space、Button、CodeIcon、CopyIcon、CloseIcon、CheckCircleIcon、StarIcon 复用。
- 1440/1024/375 交互、尺寸、换行、溢出、控制台与截图。

## 可重跑检查

```bash
node --check script.js
pnpm verify
pnpm exec playwright test tests/e2e/tag-react-island.spec.ts
```

2026-08-20 实际结果：

- `node --check script.js`：通过。
- `pnpm verify`：69 个测试文件、394 项测试通过；TypeScript 检查和三段构建通过。
- Tag Playwright：1440、1024、375 三档共 6 项测试通过。
- 构建保留既有的大于 500kB chunk 警告。

## 人工截图结论

- 1440：基础、多彩、尺寸和边框 Demo 均保持单行；24px 默认标签、32px checkable 与 20/24/28/32px 四档尺寸正确。
- 1024：多彩标签按旧站证据换为两行，其余目标组保持单行。
- 375：基础 3+1、多彩 3/4/3/2、可选中 1+2、尺寸 2+2、边框 3+3+1；页面无水平滚动。
- 多彩与已选标签具有对应浅色背景；边框标签为白底有色边框；完成、星形与关闭图标边缘完整。
- 关闭按钮、Toggle、鼠标、Enter 和 Space 路径实际执行，状态和 ARIA 同步。

## 限制

- Toggle 复用旧站 Switch DOM/CSS 协议；`@wangxiaojinger/qizhi-react` 尚未迁移正式 Switch，本次没有扩大为完整 Switch 组件。
- Select、Cascader 和 InputTag 的内部标签尚未统一消费正式 Tag。
- 执行者仅声明 `candidate_pass`；未进行独立人工终验。
