import { ApiTable } from "../api/ApiTable";

export function SliderApiTable() {
  return (
    <section id="slider-API" className="qizhi-api-section">
      <h2 className="qz-demo-title"><a tabIndex={-1} href="#slider-API">API</a></h2>
      <h3>Slider</h3>
      <ApiTable api="sliderApi" label="Slider API" />
    </section>
  );
}

