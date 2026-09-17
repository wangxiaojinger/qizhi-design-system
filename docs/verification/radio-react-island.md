# QIZHI Radio React Island 验收记录

日期：2026-08-21  
执行者状态：`candidate_pass`  
独立最终验证：`pending`

## 交付边界

- `@wangxiaojinger/qizhi-react` 导出正式 `Radio`、`Radio.Group` 及已审定类型。
- 官网保留业务审定后的 3 组 Demo：基础用法、单选框组、线框型单选按钮组。
- Demo 使用独立 TSX，预览、查看与复制同源；操作复用正式 Button、CodeIcon 和 CopyIcon。
- API 分为 Radio 与 Radio.Group，只包含已实现能力。
- Radio 不再公开 `mode` 或填充按钮能力；Demo 数量和尺寸切换改用文档内部 `DemoSegmentedControl`，不从 `@wangxiaojinger/qizhi-react` 导出。

## 自动化证据

| 命令 | 结果 |
|---|---|
| `node --check script.js` | 通过，退出码 0 |
| Radio 组件定向 Vitest | 2 个文件，9/9 通过 |
| Radio 文档与内部控制器定向 Vitest | 2 个文件，6/6 通过 |
| `pnpm typecheck` | 通过，退出码 0 |
| `pnpm verify` | 153 个 Vitest 文件、763/763 测试通过；官网、`@wangxiaojinger/qizhi-react` 和 smoke consumer 三段构建通过 |
| Radio Playwright | desktop-1440、narrow-1024、mobile-375 共 6/6 通过 |

`pnpm verify` 仅有已存在的 Vite 大 chunk 警告，没有构建失败。Playwright 有 `NO_COLOR` / `FORCE_COLOR` 环境警告，不是页面控制台错误。

## 交互与几何结果

- 标准 Radio：14px 文字，14×14px 圆形标记；普通项可点击，禁用已选项保持 disabled/checked。
- Radio.Group：鼠标和 Space 键选择后组内互斥；字符串与对象 options 的禁用状态保留。
- 鼠标选中标准和线框 Radio 后不叠加焦点轮廓；仅内部 input 命中 `focus-visible` 时保留键盘焦点反馈。
- 线框按钮：small/default/large 实际高度为 28/32/36px；三档均按文字内容自适应宽度，左右 padding 为 16px，不设置固定最小宽度；组首尾外圆角为 2px。
- 文档分段控制器保留数量和尺寸切换，并支持鼠标、方向键、`aria-checked` 与禁用状态；不属于 Radio API。
- 数量从 4 缩到 2 且当前选中深圳时，预览回退到北京。
- 三档页面和每个 Demo 均无横向溢出，控制台 error 数为 0。
- 375px 下尺寸控制保持单行项，由分段组件内部水平滚动承载宽内容，不扩大 Demo 或页面滚动宽度。

## 截图人工结论

- desktop-1440：三组 Demo、控制器、选中/禁用状态、操作区和两张 API 表对齐正常，无裁切。
- narrow-1024：线框组控制器按可用宽度换行，标题、单选项、边框和间距正常。
- mobile-375：普通 Radio 与 Group 换行清晰；线框城市项保留可换行布局；尺寸分段文字不再换行或超出选项高度；API 表在自身滚动容器中显示。
- 三档线框按钮截图均人工确认：两个汉字的城市项按内容宽度显示，左右留白一致，组内连接边框和圆角正常。
- 三档选中态截图均人工确认：标准 Radio 仅显示蓝色圆环与圆点，线框型仅显示蓝色边框，没有多余的 2px active 轮廓。

## 限制

- 本记录是执行者完成的 `candidate_pass`，不是独立最终验证。
- 本次未将 Drawer、Form、Table 和 Choice Card 的历史消费者改为 React Radio；这些属于后续组件消费统一，不影响 Radio 正式包本轮交付。
