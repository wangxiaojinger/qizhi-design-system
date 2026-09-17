import { Statistic } from "@wangxiaojinger/qizhi-react";

const createdAt = new Date(2019, 3, 10, 12, 16, 53).getTime();

export default function TimeFormatDemo() {
  return (
    <Statistic
      title="创建时间"
      value={createdAt}
      format="YYYY/MM/DD HH:mm:ss"
    />
  );
}
