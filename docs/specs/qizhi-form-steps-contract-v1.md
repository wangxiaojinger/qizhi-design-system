# QIZHI Form Steps API 契约 v1

状态：已确认并实施（candidate_pass，独立最终验证 pending）
负责人：林猫猫
证据日期：2026-09-24

## 1. 目标与边界

Form Steps 是多步骤表单的无 UI 编排能力，复用现有 `Steps`、`Form` 与 `Form.Item`，不新增第二套步骤条视觉。

- 包含：步骤字段声明、步骤级校验、前后切换、跨步骤值保留、首错定位、全量提交前校验。
- 不包含：草稿持久化、分支步骤、服务端步骤校验、路由同步、跨设备恢复。
- `Form.List` 只做兼容回归，不增加动态列表能力。

## 2. 公共 API

```ts
const wizard = Form.useSteps({
  form,
  initialStep: 1,
  current,
  onCurrentChange,
  steps: [{ key: "base", fields: ["name"] }],
});
```

- 步骤从 1 开始计数，与 QIZHI `Steps.current` 一致。
- 未传 `current` 时使用内部状态，`initialStep` 只在首次渲染生效；传入 `current` 时以它作为唯一真实状态，并限制在当前步骤边界内。
- 受控与非受控模式都只在真实且成功的步骤变化后调用 `onCurrentChange(nextStep)`；校验失败或边界未变化时不通知。
- `next()` 与向前 `goTo()` 校验当前步骤；失败返回 `false` 并聚焦首错。
- `previous()` 与向后 `goTo()` 不校验，且所有切换均限制在有效边界。
- `submit()` 先全量校验；失败切换到首错所属步骤并聚焦，成功调用 `form.submit()`。
- `submit()` 复用本轮已通过的校验结果进入提交回调，不重复执行异步校验器。
- 跨步骤数据由 Form 默认 `preserve=true` 保留；消费方如主动设置 `preserve=false`，该字段卸载时仍按既有契约删除。

## 3. 验收

- 类型、步骤级校验、`goTo()` 前后切换、卸载后值保留、提交首错回跳、单轮异步校验与既有 Form/Form.List 回归测试。
- 官网 Demo 必须组合正式 `Steps`、`Form`、`Form.Item`、`Input` 与 `Button`。
- 1440、1024、375 三视口检查交互、焦点、横向溢出和控制台错误。
