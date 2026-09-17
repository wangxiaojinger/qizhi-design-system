import { ApiTable } from "../api/ApiTable";
const tables = [
  ["BasicChoiceCards", "basicChoiceCardsApi"],
  ["IconChoiceCards", "iconChoiceCardsApi"],
  ["ChoiceCard", "choiceCardApi"],
  ["ChoiceCardGroup", "choiceCardGroupApi"],
  ["ObjectSelector", "objectSelectorApi"],
] as const;

export function BusinessObjectSelectionApiTable() {
  return (
    <section id="business-object-selection-API" className="qizhi-api-section">
      <h2 className="qz-demo-title"><a tabIndex={-1} href="#business-object-selection-API">API</a></h2>
      <p className="qizhi-api-section__note">只列出对象选择公共组件已实现的业务能力。</p>
      {tables.map(([name, api]) => (
        <div key={name}><h3>{name}</h3><ApiTable api={api} label={`${name} API`} /></div>
      ))}
    </section>
  );
}
