import { useEffect, useState } from "react";
import { Radio } from "@wangxiaojinger/qizhi-react";
import type { RadioSize, RadioValue } from "@wangxiaojinger/qizhi-react";
import { DemoSegmentedControl } from "../../demo-controls/DemoSegmentedControl";

const cities = ["北京", "上海", "广州", "深圳"] as const;

const App = () => {
  const [count, setCount] = useState<RadioValue>(3);
  const [size, setSize] = useState<RadioValue>("default");
  const [city, setCity] = useState<RadioValue>("北京");
  const visibleCities = cities.slice(0, Number(count));

  useEffect(() => {
    if (!visibleCities.includes(city as typeof cities[number])) setCity(visibleCities[0]);
  }, [count, city, visibleCities]);

  return (
    <div className="radio-docs-props">
      <div className="radio-docs-controls">
        <div className="radio-docs-control"><span>数量</span><DemoSegmentedControl<RadioValue> value={count} onChange={setCount} aria-label="线框单选按钮数量" options={[2, 3, 4]} /></div>
        <div className="radio-docs-control radio-docs-control--size"><span>尺寸</span><DemoSegmentedControl<RadioValue> value={size} onChange={setSize} aria-label="线框单选按钮尺寸" options={[
          { label: "small 28px", value: "small" },
          { label: "default 32px", value: "default" },
          { label: "large 36px", value: "large" },
        ]} /></div>
      </div>
      <div className="radio-docs-controls">
        <div className="radio-docs-control radio-docs-control--size"><span>组件</span><Radio.Group data-radio-preview type="button" size={size as RadioSize} value={city} onChange={setCity} aria-label="线框城市选择" options={visibleCities} /></div>
      </div>
    </div>
  );
};

export default App;
