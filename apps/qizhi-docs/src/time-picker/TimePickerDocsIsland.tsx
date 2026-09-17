import { useEffect } from "react";
import { TimePickerApiTable } from "./TimePickerApiTable";
import { TimePickerDemoCodebox } from "./TimePickerDemoCodebox";
import { timePickerDemos } from "./timePickerDocs.registry";
import "./timePickerDemos.css";
import "./timePickerDocs.css";

export function TimePickerDocsIsland() {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("qizhi:react-island-ready"));
  }, []);
  return (
    <>
      <div className="qz-nav-intro">
        <p>组件 <span className="separator">/</span> <strong>数据输入</strong></p>
        <h1>时间选择器 TimePicker</h1>
        <p>在弹出面板上选择时间，以便捷完成时间输入的控件。</p>
      </div>
      <div className="component-examples qizhi-components-wrapper">
        {timePickerDemos.map((demo) => <TimePickerDemoCodebox key={demo.id} demo={demo} />)}
        <TimePickerApiTable />
      </div>
    </>
  );
}
