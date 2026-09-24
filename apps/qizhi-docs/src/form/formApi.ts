import type { FormInstance, FormItemProps, FormListProps, FormProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type FormApiItem = ComponentApiItem<keyof FormProps>;
type FormItemApiItem = ComponentApiItem<keyof FormItemProps>;
type FormInstanceApiItem = ComponentApiItem<keyof FormInstance>;
type FormListApiItem = ComponentApiItem<keyof FormListProps>;

export const formApi = [
  { name: "layout", description: "设置表单项采用垂直排列或标签左置的水平排列；窄屏下水平布局回退为单列。", type: '"vertical" | "horizontal"', defaultValue: "vertical" },
  { name: "form", description: "由 Form.useForm 创建的表单控制对象，用于读写字段、校验、重置和提交。", type: "FormInstance", defaultValue: "内部创建" },
  { name: "initialValues", description: "表单首次挂载时的字段初始值；后续属性变化不会重置已编辑内容。", type: "Record<string, unknown>", defaultValue: "{}" },
  { name: "onValuesChange", description: "用户修改命名字段时返回本次变化值和全部表单值；程序化赋值不触发。", type: "(changedValues, allValues) => void", defaultValue: "—" },
  { name: "onFinish", description: "所有字段校验通过后返回表单值；返回 Promise 时会在其结束前阻止重复提交。", type: "(values) => void | Promise<void>", defaultValue: "—" },
  { name: "onFinishFailed", description: "前端校验失败时返回当前表单值和字段错误列表。", type: "(result: FormFailedResult) => void", defaultValue: "—" },
  { name: "onValidationException", description: "异步校验发生网络异常时返回表单级异常；异常不会写成字段内容错误。", type: "(exception: FormValidationException) => void", defaultValue: "—" },
  { name: "scrollToFirstError", description: "提交校验失败后滚动并聚焦第一个错误字段。", type: "boolean", defaultValue: "false" },
  { name: "preserve", description: "字段卸载后是否保留其值；可由 Form.Item 覆盖。", type: "boolean", defaultValue: "true" },
  { name: "children", description: "表单内容，通常由 Form.Item 和操作控件组成。", type: "ReactNode", defaultValue: "—" },
  { name: "className", description: "原生 form 根节点的类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "原生 form 根节点的内联样式。", type: "CSSProperties", defaultValue: "—" },
] as const satisfies readonly FormApiItem[];

export const formItemApi = [
  { name: "name", description: "字段名称或数组路径；点号字符串按普通字段名处理。", type: "FormNamePath", defaultValue: "—" },
  { name: "label", description: "字段标签内容；未传入时不渲染标签节点。", type: "ReactNode", defaultValue: "—" },
  { name: "required", description: "显示必填标记并向字段组暴露必填语义，不执行校验。", type: "boolean", defaultValue: "false" },
  { name: "extra", description: "显示在主控件下方的辅助说明。", type: "ReactNode", defaultValue: "—" },
  { name: "rules", description: "字段校验规则，支持必填、长度、正则表达式以及同步或异步自定义校验。", type: "FormRule[]", defaultValue: "[]" },
  { name: "validateTrigger", description: "触发字段校验的时机，支持值变化和失去焦点。", type: '"onChange" | "onBlur"', defaultValue: "onChange" },
  { name: "validateStatus", description: "手动指定校验状态；未指定时由表单校验结果自动控制。", type: '"default" | "validating" | "success" | "warning" | "error"', defaultValue: "自动" },
  { name: "help", description: "手动设置字段反馈文案；存在时优先于自动校验错误。", type: "ReactNode", defaultValue: "—" },
  { name: "dependencies", description: "依赖字段路径列表；依赖值变化时重新校验当前字段。", type: "FormNamePath[]", defaultValue: "[]" },
  { name: "preserve", description: "当前字段卸载后是否保留值；优先于 Form 的默认设置。", type: "boolean", defaultValue: "继承 Form" },
  { name: "children", description: "字段的主控件或控件组合。", type: "ReactNode", defaultValue: "—" },
  { name: "className", description: "字段根节点的类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "字段根节点的内联样式。", type: "CSSProperties", defaultValue: "—" },
] as const satisfies readonly FormItemApiItem[];

export const formListApi = [
  { name: "name", description: "动态列表在表单值中的字段路径。", type: "FormNamePath", defaultValue: "—" },
  { name: "initialValue", description: "列表路径尚无值时使用的初始数组。", type: "unknown[]", defaultValue: "—" },
  { name: "children", description: "接收稳定字段描述和新增、删除、移动操作的渲染函数。", type: "(fields, operations) => ReactNode", defaultValue: "—" },
] as const satisfies readonly FormListApiItem[];

export const formInstanceApi = [
  { name: "getFieldsValue", description: "返回当前全部已注册或保留字段的嵌套值。", type: "() => Record<string, unknown>", defaultValue: "—" },
  { name: "getFieldValue", description: "读取指定字段路径的当前值。", type: "(name: FormNamePath) => unknown", defaultValue: "—" },
  { name: "setFieldsValue", description: "批量写入字段值并清除对应错误；不触发 onValuesChange。", type: "(values: Record<string, unknown>) => void", defaultValue: "—" },
  { name: "setFieldValue", description: "写入单个字段路径的值并清除该字段错误；不触发 onValuesChange。", type: "(name: FormNamePath, value: unknown) => void", defaultValue: "—" },
  { name: "getFieldError", description: "返回指定字段路径当前的错误文案列表。", type: "(name: FormNamePath) => string[]", defaultValue: "—" },
  { name: "setFieldErrors", description: "回填指定字段路径的后端错误；用户修改该字段后自动清除。", type: "(name: FormNamePath, errors: string[]) => void", defaultValue: "—" },
  { name: "validateFields", description: "校验所有已注册字段；成功时返回表单值，失败时拒绝并携带字段错误。", type: "() => Promise<Record<string, unknown>>", defaultValue: "—" },
  { name: "resetFields", description: "将指定字段路径或全部已注册字段恢复为初始值，并清除错误。", type: "(names?: FormNamePath[]) => void", defaultValue: "—" },
  { name: "isFieldsDirty", description: "判断全部或指定字段是否相对当前干净基线发生变化。", type: "(names?: FormNamePath[]) => boolean", defaultValue: "—" },
  { name: "markFieldsClean", description: "将全部或指定字段的当前值记录为新的干净基线。", type: "(names?: FormNamePath[]) => void", defaultValue: "—" },
  { name: "scrollToField", description: "将指定字段路径滚动到视口中部，并聚焦其首个可操作控件。", type: "(name: FormNamePath) => void", defaultValue: "—" },
  { name: "submit", description: "触发与用户提交表单相同的校验和提交流程。", type: "() => void", defaultValue: "—" },
] as const satisfies readonly FormInstanceApiItem[];
