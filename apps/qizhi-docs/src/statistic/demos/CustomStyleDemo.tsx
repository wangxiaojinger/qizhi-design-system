import { Statistic } from "@wangxiaojinger/qizhi-react";

const dangerStyle = { color: "var(--color-danger)" };
const successStyle = { color: "rgb(var(--success-6))" };

export default function CustomStyleDemo() {
  return (
    <div className="statistic-docs-row statistic-docs-row--three">
      <Statistic
        title="新用户"
        value="192393"
        suffix={
          <i
            className="ri-arrow-up-line"
            aria-hidden="true"
            style={dangerStyle}
          />
        }
      />
      <Statistic
        title="活跃用户"
        value="934230"
        suffix={
          <i
            className="ri-arrow-down-line"
            aria-hidden="true"
            style={successStyle}
          />
        }
      />
      <Statistic
        title="用户增长率"
        value={50.32}
        prefix={<i className="ri-arrow-up-line" aria-hidden="true" />}
        suffix="%"
        valueStyle={dangerStyle}
      />
    </div>
  );
}
