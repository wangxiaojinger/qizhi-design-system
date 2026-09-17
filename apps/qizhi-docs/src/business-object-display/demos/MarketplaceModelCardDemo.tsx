import { MarketplaceModelCard } from "@wangxiaojinger/qizhi-react";

const description = "DeepSeek-V3 是一款由深度求索公司自研的 "
  + "MoE 模型。"
  + "DeepSeek-V3 多项评测成绩超越了 Qwen2.5-72B 和 Llama-3.1-405B "
  + "等其他开源模型，并在性能上和世界顶尖的闭源模型 "
  + "GPT-4o 以及 "
  + "Claude-3.5-Sonnet 不分伯仲。";

export default function MarketplaceModelCardDemo() {
  return (
    <div className="business-object-model-grid">
      <MarketplaceModelCard
        name="DeepSeek-V3DeepSeek V1"
        description={description}
        tags={[
          "自然语言处理", "文本生成", "72B", "平台通用",
        ]}
        preset="预置推理"
      />
      <MarketplaceModelCard
        name="通义千问2-72B-指令微调"
        description={
          "阿里达摩院自研的 720 亿参数大规模语言模型，"
          + "优化了指令遵循能力。"
        }
        tags={[
          "自然语言处理", "文本生成", "72B", "平台通用",
        ]}
      />
    </div>
  );
}
