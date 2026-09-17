import { Link, Spin } from "@wangxiaojinger/qizhi-react";

export default function TipDemo() {
  return (
    <Spin
      tip="这可能需要一段时间……"
      aria-label="这可能需要一段时间"
    >
      <article className="spin-demo-card spin-demo-card--fixed">
        <header>
          <strong>延迟加载</strong>
          <Link href="#Spin-自定义描述文案" hoverable={false}>
            查看详情
          </Link>
        </header>
        <p>
          复杂内容可能需要更长时间完成处理，加载文案可以帮助用户理解当前状态。
        </p>
      </article>
    </Spin>
  );
}
