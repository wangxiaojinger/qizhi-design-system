import { ApiTable } from "../api/ApiTable";
const tables = [
  ["TaskCard", "taskCardApi"],
  ["MarketplaceModelCard", "marketplaceModelCardApi"],
  ["FinancialModelCard", "financialModelCardApi"],
  ["SkillServiceCard", "skillServiceCardApi"],
  ["ProjectCard", "projectCardApi"],
  ["ResourceSpecificationCard", "resourceSpecificationCardApi"],
  [
    "BillingBudgetCard",
    "billingBudgetCardApi",
  ],
] as const;

export function BusinessObjectApiTable() {
  return (
    <section id="business-object-display-API" className="qizhi-api-section">
      <h2 className="qz-demo-title">
        <a tabIndex={-1} href="#business-object-display-API">API</a>
      </h2>
      <p className="qizhi-api-section__note">
        只列出对象展示公共组件已实现的业务能力。
      </p>
      {tables.map(([name, api]) => (
        <div key={name}>
          <h3>{name}</h3>
          <ApiTable api={api} label={name + " API"} />
        </div>
      ))}
    </section>
  );
}
