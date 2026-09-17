import { ApiTable } from "../api/ApiTable";
import { inputApiSections } from "./inputApi";

const inputApiNames = [
  "inputApi",
  "inputTextAreaApi",
  "inputGroupApi",
  "inputSearchApi",
  "inputPasswordApi",
  "inputRefApi",
] as const;

export function InputApiTable() {
  return (
    <section id="input-API" className="qizhi-input-api">
      <h2 className="qz-demo-title">
        <a tabIndex={-1} href="#input-API">API</a>
      </h2>
      {inputApiSections.map((section, index) => (
        <div className="qizhi-input-api__section" key={section.title}>
          <h3>{section.title}</h3>
          <p className="qizhi-input-api__note">{section.description}</p>
          <ApiTable label={section.ariaLabel} api={inputApiNames[index]} />
        </div>
      ))}
    </section>
  );
}
