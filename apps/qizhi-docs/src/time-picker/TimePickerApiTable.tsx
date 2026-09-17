import { ApiTable } from "../api/ApiTable";

export function TimePickerApiTable() {
  return (
    <section id="time-picker-API" className="qizhi-api-section">
      <h2 className="qz-demo-title"><a tabIndex={-1} href="#time-picker-API">API</a></h2>
      <h3>TimePicker</h3>
      <ApiTable api="timePickerApi" label="TimePicker API" />
    </section>
  );
}
