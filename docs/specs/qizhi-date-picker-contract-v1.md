# QIZHI DatePicker React Contract v1

## 范围

本契约只覆盖旧规范站已验证的日期选择能力：日期、周、月、年、季度、单选、范围、日期时间、错误/警告状态、前缀、清空、禁用日期和禁用时间。

## 公共组件复用

- 输入触发区：复用与 `Input` 一致的统一控件容器结构；范围字段使用 DatePicker 内部原生 input，不嵌套第二层 Input 边框
- 确认、今天、此刻及翻页：`Button`
- 图标：`CalendarIcon`、`CloseIcon`、`InfoIcon`、`ArrowLeftIcon`、`ArrowRightIcon`
- 文档模式切换：`DemoSegmentedControl`

日历格和时间选项使用 DatePicker 内部语义按钮，不暴露为独立公共 API。日期弹层使用 `role="dialog"`，不复用菜单语义的 Dropdown。

## DOM 和样式契约

- DatePicker 根节点是统一控件容器，承担 200 × 32px 基础盒模型、边框、圆角、背景和状态；RangePicker 仍使用一个连续外框。
- 内部 input-wrap、原生 input、分隔符、清空按钮和日历图标只负责内容与功能，不各自绘制输入边框。
- 统一结构不新增公共 Props，TypeScript API、值格式和事件参数保持不变。

## 导出

```ts
import { DatePicker } from "@wangxiaojinger/qizhi-react";

DatePicker;
DatePicker.RangePicker;
```

## 值格式

- 日期：`YYYY-MM-DD`
- 周：`YYYY-Wnn`
- 月：`YYYY-MM`
- 年：`YYYY`
- 季度：`YYYY-Qn`
- 日期时间：`YYYY-MM-DD HH:mm:ss`
- 范围：对应格式的二元数组；清空时返回空数组

## 不包含

v1 不包含尺寸、国际化、自定义格式、自定义日历单元格、自定义快捷项或 Arco 的其他扩展 API。
