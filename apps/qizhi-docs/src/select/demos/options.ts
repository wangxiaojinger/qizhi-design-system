import type { SelectOption } from "@wangxiaojinger/qizhi-react";
export const cityOptions: SelectOption[] = [{ label: "北京", value: "北京" }, { label: "上海", value: "上海" }, { label: "广州", value: "广州" }, { label: "深圳", value: "深圳" }];
export const cityOptionsWithDisabled: SelectOption[] = [...cityOptions.slice(0, 3), { label: "禁用选项", value: "禁用选项", disabled: true }];
