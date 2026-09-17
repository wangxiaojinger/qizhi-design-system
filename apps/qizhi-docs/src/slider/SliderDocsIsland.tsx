import { useEffect } from "react";
import { SliderApiTable } from "./SliderApiTable";
import { SliderDemoCodebox } from "./SliderDemoCodebox";
import { sliderDemos } from "./sliderDocs.registry";
import "./sliderDemos.css";
import "./sliderDocs.css";

export function SliderDocsIsland() {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("qizhi:react-island-ready"));
  }, []);
  return (
    <>
      <div className="component-intro">
        <div className="component-intro-meta">组件 / 数据输入</div>
        <div className="component-intro-head"><div className="component-intro-copy">
          <h3>滑动输入条 Slider</h3>
          <p>滑动型输入器，展示当前值和可选范围。</p>
        </div></div>
      </div>
      <div className="component-examples qizhi-components-wrapper">
        {sliderDemos.map((demo) => <SliderDemoCodebox key={demo.id} demo={demo} />)}
        <SliderApiTable />
      </div>
    </>
  );
}

