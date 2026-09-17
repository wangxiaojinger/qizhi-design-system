import { FinancialModelCard } from "@wangxiaojinger/qizhi-react";

export default function FinancialModelCardDemo() {
  return (
    <FinancialModelCard
      name="IPO Vetting Agent"
      meta={(
        <>
          <span>心理学研究项目</span>
          <time>2026.05.20</time>
        </>
      )}
      description={
        "自动化 IPO 招股书审查，覆盖财务健康度、风险因子、"
        + "行业对比分析，"
        + "输出结构化评估报告。"
      }
      tags={["SEC 文件解析", "金融数据查询", "风险评分"]}
    />
  );
}
