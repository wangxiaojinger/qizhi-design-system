import { ChoiceCard, ChoiceCardGroup } from "@wangxiaojinger/qizhi-react";

export default function ChoiceCardSizesDemo() {
  return (
    <div className="business-choice-sizes">
      <section>
        <h3>small</h3>
        <ChoiceCardGroup
          columns={2}
          size="small"
          defaultValue="public"
          className="business-choice-small"
          aria-label="选择空间计费方式"
        >
          <ChoiceCard value="public" title="公共空间" description="按资源使用量计费。" />
          <ChoiceCard value="private" title="独立空间" description="按时间买断空间内资源。" />
        </ChoiceCardGroup>
      </section>
      <section>
        <h3>default</h3>
        <ChoiceCardGroup
          columns={2}
          defaultValue="dedicated"
          className="business-choice-basic"
          aria-label="选择服务模式"
        >
          <ChoiceCard value="dedicated" title="专属实例" description="长期消耗固定的部署资源，需手动下架模型。" />
          <ChoiceCard value="dynamic" title="动态实例" description="请求模型调用时临时部署，空闲后自动下架。" />
        </ChoiceCardGroup>
      </section>
    </div>
  );
}
