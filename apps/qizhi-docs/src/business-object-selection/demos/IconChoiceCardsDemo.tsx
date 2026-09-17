import {
  CustomDeploymentColorIcon,
  IconChoiceCards,
  LargeLanguageModelColorIcon,
} from "@wangxiaojinger/qizhi-react";

export default function IconChoiceCardsDemo() {
  return (
    <IconChoiceCards
      defaultValue="custom"
      className="business-choice-icons"
      aria-label="选择部署框架"
      items={[
        {
          value: "custom",
          title: "自定义部署",
          description: "通过镜像、模型、代码和运行命令灵活部署服务。",
          icon: <CustomDeploymentColorIcon />,
        },
        {
          value: "llm",
          title: "大语言模型部署",
          description: "使用标准推理框架快速部署大语言模型。",
          icon: <LargeLanguageModelColorIcon />,
        },
      ]}
    />
  );
}
