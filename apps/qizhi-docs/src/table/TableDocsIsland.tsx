import { useEffect } from "react";
import { TableApiTable } from "./TableApiTable";
import { TableDemoCodebox } from "./TableDemoCodebox";
import { tableDemos } from "./tableDocs.registry";
import "./tableDocs.css";

export function TableDocsIsland() {
  useEffect(() => { window.dispatchEvent(new CustomEvent("qizhi:react-island-ready")); }, []);
  return <><div className="component-intro"><div className="component-intro-meta">组件 / 数据展示</div><div className="component-intro-head"><div className="component-intro-copy"><h3>表格 Table</h3><p>用于承载结构化数据，并提供排序、选择、展开和分页等数据操作。</p><p><strong>文字按钮与链接对齐：</strong>表格单元格内的文字按钮（Button type="text"）和链接（Link），左右内边距统一为 0，与同列普通文本保持对齐。上下内边距、颜色、禁用状态和交互行为不变；普通按钮及表格外控件不受影响。</p></div></div></div><div className="component-examples qizhi-components-wrapper">{tableDemos.map((demo) => <TableDemoCodebox key={demo.id} demo={demo} />)}<TableApiTable /></div></>;
}
