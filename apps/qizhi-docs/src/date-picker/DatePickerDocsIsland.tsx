import { useEffect } from "react";
import { DatePickerApiTable } from "./DatePickerApiTable";
import { DatePickerDemoCodebox } from "./DatePickerDemoCodebox";
import { datePickerDemos } from "./datePickerDocs.registry";
import "./datePickerDocs.css";

export function DatePickerDocsIsland() {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("qizhi:react-island-ready"));
  }, []);

  return (
    <>
      <div className="qz-nav-intro">
        <p>
          组件 <span className="separator">/</span> <strong>数据输入</strong>
        </p>
        <h1>日期选择器 DatePicker</h1>
        <p>用于选择日期、日期范围及时间。</p>
      </div>

      <div className="component-examples qizhi-components-wrapper">
        {datePickerDemos.map((demo) => (
          <DatePickerDemoCodebox key={demo.id} demo={demo} />
        ))}
        <DatePickerApiTable />
      </div>
    </>
  );
}
