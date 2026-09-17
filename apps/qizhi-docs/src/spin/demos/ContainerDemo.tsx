import { useState } from "react";
import { Button, Link, Spin } from "@wangxiaojinger/qizhi-react";

function SpinCard({
  title,
  children,
}: {
  title: string;
  children: string;
}) {
  return (
    <article className="spin-demo-card">
      <header>
        <strong>{title}</strong>
        <Link href="#Spin-容器中" hoverable={false}>
          查看详情
        </Link>
      </header>
      <p>{children}</p>
    </article>
  );
}

export default function ContainerDemo() {
  const [loading, setLoading] = useState(true);
  return (
    <div className="spin-container-demo">
      <Button
        type="secondary"
        aria-pressed={loading}
        onClick={() => setLoading((value) => !value)}
      >
        加载中：{loading ? "是" : "否"}
      </Button>
      <div className="spin-container-demo__row">
        <Spin loading={loading} aria-label="数据同步中">
          <SpinCard title="数据同步">
            系统正在同步项目数据，完成后将在此处展示最新的任务状态和处理结果。
          </SpinCard>
        </Spin>
        <Spin loading={loading} aria-label="内容更新中">
          <SpinCard title="内容更新">
            系统正在更新页面内容，请稍候。加载结束后可以继续浏览和执行相关操作。
          </SpinCard>
        </Spin>
      </div>
      <Spin loading={loading} block aria-label="区块加载中">
        <SpinCard title="区块加载">
          块级加载容器会撑满当前可用宽度，适用于列表、表格和页面主内容区。
        </SpinCard>
      </Spin>
    </div>
  );
}
