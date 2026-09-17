import { BusinessGuide } from "@wangxiaojinger/qizhi-react";
import projectImage from
  "../../../../../assets/qizhi-business-guide-project.svg";
import trainingImage from
  "../../../../../assets/qizhi-business-guide-training.svg";
import deployImage from
  "../../../../../assets/qizhi-business-guide-deploy.svg";

export default function BasicDemo() {
  return (
    <BusinessGuide
      title="简单几步开启您的"
      highlight="AI征程"
      subtitle="模型全生命周期管理平台"
      steps={[
        {
          step: "Step 1",
          title: "申请/加入项目",
          image: projectImage,
          actions: [
            { content: "申请项目", href: "#business-guidance-flow" },
            { content: "或由项目管理员添加至项目" },
          ],
        },
        {
          step: "Step 2",
          title: "模型训练与资产沉淀",
          image: trainingImage,
          actions: [
            { content: "AI 资产管理" },
            { content: "模型开发与训练" },
          ],
        },
        {
          step: "Step 3",
          title: "模型服务化部署",
          image: deployImage,
          actions: [
            { content: "在线推理" },
            { content: "离线推理", disabled: true },
          ],
        },
      ]}
    />
  );
}
