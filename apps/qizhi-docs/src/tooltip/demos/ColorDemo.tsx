import { Tooltip, Typography } from "@wangxiaojinger/qizhi-react";

const colors = [
  ["蓝色", "rgb(var(--primary-6))"],
  ["绿色", "rgb(var(--success-6))"],
  ["橙色", "rgb(var(--orange-6))"],
  ["红色", "rgb(var(--danger-6))"],
  ["灰色", "rgb(var(--gray-7))"],
] as const;

export default function ColorDemo() {
  return (
    <div className="tooltip-docs-colors">
      {colors.map(([label, color]) => (
        <Tooltip content={label} color={color} key={label}>
          <Typography.Text
            className="tooltip-docs-color-trigger"
            tabIndex={0}
          >
            {label}
          </Typography.Text>
        </Tooltip>
      ))}
    </div>
  );
}
