import { Statistic } from "@wangxiaojinger/qizhi-react";

export default function BasicDemo() {
  return (
    <div className="statistic-docs-row">
      <Statistic title="下载" value={125670} />
      <Statistic value={40509} precision={2} extra="评论" />
    </div>
  );
}
