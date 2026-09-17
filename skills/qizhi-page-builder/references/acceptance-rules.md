# 生成页面验收合同

## 必需产物

```text
generated-pages/<slug>/
├── index.html
├── page-spec.md
├── generation-report.md
├── styles.css        # 需要时
└── script.js         # 需要时
```

`generation-report.md` 必须包含：

```text
status: candidate_pass
independent_verification: pending
```

执行者不能把自己的验收改写为独立最终验证。

## 静态检查

- 运行生成目录的 JavaScript `node --check`；同时运行项目根 `node --check script.js`，确认未破坏规范站。
- 运行 `validate_output.py`。
- 检查重复 ID、hash 目标、`aria-controls`、新增类和 `data-*` 的 HTML/CSS/JS 对应关系。
- 禁止 `arco-*`、命名空间 `ac-*`、内联事件、用户输入的 `innerHTML`、未授权依赖与全局 Token 修改。
- 组件来源必须可定位到当前 `index.html` 章节或行号和 `styles.css` 行号，并同步核对 CSS 后部覆盖及 JS 初始化函数。
- 运行 `validate_output.py <输出目录> --source-root <项目根目录>`，确认生成页使用的所有 `qizhi-*` / `qz-*` 类都存在于当前源站。
- 页面局部布局类使用 `<slug>-page__*`；没有线上壳层证据时，页面不得创造品牌头部、侧栏、全局导航或产品名称。

## 浏览器检查

- 通过 HTTP 服务打开，不以 `file://` 作为唯一证据。
- 检查首屏资源、控制台和网络错误。
- 实际操作主流程、取消/关闭、失败恢复、重复触发和会重绘 DOM 的节点。
- 使用键盘走完关键路径，检查焦点可见、焦点恢复和 ARIA 状态。
- 在 1440、1024、375 视口检查页面及目标区域 `scrollWidth === clientWidth`。
- 响应式可以重排或提供局部滚动，但不得隐藏需求明确要求的字段、状态或操作；若采用横向滚动，需实际滚动到末端验证操作可达。
- 打开任务相关浮层，从浮层向上检查祖先裁切链；记录方向、越界量与视口结果。
- 对 Grid/Flex 组合记录外层、列容器和直接子项的计算尺寸，不能只测总宽。
- 截取目标组件打开或关键结果状态的局部截图并人工查看。

## 状态与报告

逐项记录命令、结果与证据。没有执行的检查写“未执行”并说明原因；已有问题与本次新增问题分开。只有产物合同、静态检查、交互、多视口和截图人工检查均通过，执行者才可声明 `candidate_pass`。

以下情况必须降级为 `candidate_fail`：

- 使用自创近似组件替代 QIZHI 组件；
- 缺少组件来源证据；
- 关键业务规则被伪装为事实；
- 主流程、键盘路径或相关异常状态不可用；
- 视觉截图未人工查看；
- 声称与线上平台一致但没有线上平台参考证据。
- 移动端隐藏关键字段或操作且没有等价入口。
