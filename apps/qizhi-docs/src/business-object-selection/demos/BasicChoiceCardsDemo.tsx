import { BasicChoiceCards } from "@wangxiaojinger/qizhi-react";

export default function BasicChoiceCardsDemo() {
  return (
    <BasicChoiceCards
      className="business-choice-basic"
      aria-label="选择部署模式"
      items={[
        {
          value: "dedicated",
          title: "专属实例",
          description: "长期消耗固定的部署资源，适合稳定业务需求。",
        },
        {
          value: "scheduled",
          title: "定时实例",
          description: "该能力暂未开放。",
          disabled: true,
        },
      ]}
    />
  );
}
