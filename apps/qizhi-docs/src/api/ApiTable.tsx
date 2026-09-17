import type { ReactNode } from "react";
import componentApi from "./component-api.json";
import "./apiTable.css";

export interface ComponentApiItem<Name extends string = string> {
  name: Name;
  description: string;
  type: string;
  defaultValue: string;
}

function renderDescription(description: string): ReactNode {
  return description.split(/(`[^`]+`)/g).map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={`${part}-${index}`}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

function ApiCode({ children, accent = false }: { children: string; accent?: boolean }) {
  const className = accent && /[A-Za-z]/.test(children)
    ? "qizhi-api-english"
    : undefined;
  return <code className={className}>{children}</code>;
}

export type ComponentApiName = keyof typeof componentApi.apis;

export function ApiTable({
  api,
  label,
}: {
  api: ComponentApiName;
  label: string;
}) {
  const items: readonly ComponentApiItem[] = componentApi.apis[api].items;
  return (
    <div className="qizhi-api-table-scroll">
      <table className="qizhi-api-table" aria-label={label}>
        <thead>
          <tr>
            <th>参数名</th>
            <th>描述</th>
            <th>类型</th>
            <th>默认值</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.name}>
              <td><ApiCode>{item.name}</ApiCode></td>
              <td>{renderDescription(item.description)}</td>
              <td><ApiCode accent>{item.type}</ApiCode></td>
              <td><ApiCode accent>{item.defaultValue}</ApiCode></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
