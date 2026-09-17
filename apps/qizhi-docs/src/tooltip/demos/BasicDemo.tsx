import { Space, Tooltip, Typography } from "@wangxiaojinger/qizhi-react";

export default function BasicDemo() {
  return (
    <Space className="tooltip-docs-basic" size="large">
      <Tooltip content="这是一段文字气泡内容">
        <Typography.Text tabIndex={0}>
          鼠标移入展示文字气泡
        </Typography.Text>
      </Tooltip>
      <Tooltip
        content={(
          <span className="tooltip-docs-wide-content">
            这是一段多行文字气泡内容。这是一段多行文字气泡内容。
          </span>
        )}
      >
        <Typography.Text tabIndex={0}>
          鼠标移入展示多行文字气泡
        </Typography.Text>
      </Tooltip>
    </Space>
  );
}
