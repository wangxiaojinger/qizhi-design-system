import { SkillServiceCard } from "@wangxiaojinger/qizhi-react";

const summary = "这是一个股票分析 Skill，使用 Yahoo Finance API"
  + "提供实时和历史的印度股票数据访问。它允许 AI Agent 和其他应用"
  + "检索股票数据，并将结果作为模型分析与生成的上下文。";

export default function SkillServiceCardDemo() {
  return (
    <SkillServiceCard
      name="Skill股票分析"
      version="v1"
      updatedAt="2026-03-28"
      project="所属项目xxxx"
      summary={summary}
    />
  );
}
