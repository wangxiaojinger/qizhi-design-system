import type { ComponentType } from "react";
import cssSource from "./inputDemos.css?raw";
import BasicDemo from "./demos/BasicDemo";
import basicTsx from "./demos/BasicDemo.tsx?raw";
import StatusDemo from "./demos/StatusDemo";
import statusTsx from "./demos/StatusDemo.tsx?raw";
import SizeDemo from "./demos/SizeDemo";
import sizeTsx from "./demos/SizeDemo.tsx?raw";
import AddonDemo from "./demos/AddonDemo";
import addonTsx from "./demos/AddonDemo.tsx?raw";
import AffixDemo from "./demos/AffixDemo";
import affixTsx from "./demos/AffixDemo.tsx?raw";
import SearchDemo from "./demos/SearchDemo";
import searchTsx from "./demos/SearchDemo.tsx?raw";
import SearchLoadingDemo from "./demos/SearchLoadingDemo";
import searchLoadingTsx from "./demos/SearchLoadingDemo.tsx?raw";
import GroupDemo from "./demos/GroupDemo";
import groupTsx from "./demos/GroupDemo.tsx?raw";
import WordLimitDemo from "./demos/WordLimitDemo";
import wordLimitTsx from "./demos/WordLimitDemo.tsx?raw";
import TextAreaDemo from "./demos/TextAreaDemo";
import textAreaTsx from "./demos/TextAreaDemo.tsx?raw";
import AutoSizeDemo from "./demos/AutoSizeDemo";
import autoSizeTsx from "./demos/AutoSizeDemo.tsx?raw";
import PasswordDemo from "./demos/PasswordDemo";
import passwordTsx from "./demos/PasswordDemo.tsx?raw";
import NormalizeDemo from "./demos/NormalizeDemo";
import normalizeTsx from "./demos/NormalizeDemo.tsx?raw";
import AutoWidthDemo from "./demos/AutoWidthDemo";
import autoWidthTsx from "./demos/AutoWidthDemo.tsx?raw";
export interface InputDemoDefinition { id: string; title: string; description: readonly string[]; component: ComponentType; tsxSource: string; cssSource: string }
const demo = (id: string, title: string, description: string | readonly string[], component: ComponentType, tsxSource: string): InputDemoDefinition => ({ id, title, description: typeof description === "string" ? [description] : description, component, tsxSource, cssSource });

export const inputDemos: readonly InputDemoDefinition[] = [
  demo("输入框-基本用法", "基本用法", "通过鼠标或键盘输入内容。", BasicDemo, basicTsx),
  demo("输入框状态", "输入框状态", "不同的输入框状态。", StatusDemo, statusTsx),
  demo("四种尺寸", "四种尺寸", "输入框定义了四种默认尺寸（mini、small、default、large），分别为 24px、28px、32px、36px。", SizeDemo, sizeTsx),
  demo("前置、后置标签", "前置、后置标签", "指定 addBefore 和 addAfter 在输入框前后添加元素。", AddonDemo, addonTsx),
  demo("前后缀", "前后缀", "通过指定 prefix 和 suffix 来在输入框内添加前缀和后缀。", AffixDemo, affixTsx),
  demo("搜索框", "搜索框", "带有搜索图标的输入框，用于内容检索。", SearchDemo, searchTsx),
  demo("搜索框-Loading", "搜索框 Loading", "通过 loading 属性可以设置搜索框在 onSearch 的时候展示 loading。", SearchLoadingDemo, searchLoadingTsx),
  demo("输入框组合", "输入框组合", "将选择器、日期输入、搜索输入等控件组合在一起，形成紧凑录入区域。", GroupDemo, groupTsx),
  demo("字数统计", "字数统计", ["设置 maxLength 可以限制最大字数，配合 showWordLimit 可以显示字数统计。", "设置 maxLength.errorOnly 后不会限制用户输入字数，但是超过最大字数会展示错误状态。"], WordLimitDemo, wordLimitTsx),
  demo("文本域", "文本域", "可以用于多行输入。", TextAreaDemo, textAreaTsx),
  demo("适应文本高度文本域", "适应文本高度文本域", "指定 autoSize，文本域会自动根据输入的文本调整高度。也可以指定最小行数和最大行数。", AutoSizeDemo, autoSizeTsx),
  demo("密码输入", "密码输入", "用于密码的输入。", PasswordDemo, passwordTsx),
  demo("格式化输入值", "格式化输入值", "在指定时机对用户输入的值进行格式化处理，前后值不一致时，会触发 onChange。", NormalizeDemo, normalizeTsx),
  demo("宽度自适应", "宽度自适应", "通过 autoWidth 属性可以设置 Input 的宽度跟随文字自适应。", AutoWidthDemo, autoWidthTsx),
];
