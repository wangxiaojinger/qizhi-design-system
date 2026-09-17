import { Tooltip, Typography } from "@wangxiaojinger/qizhi-react";

export default function MiniDemo() {
  return (
    <Tooltip content="123456789" mini>
      <Typography.Text tabIndex={0}>
        鼠标移入展示文字气泡
      </Typography.Text>
    </Tooltip>
  );
}
