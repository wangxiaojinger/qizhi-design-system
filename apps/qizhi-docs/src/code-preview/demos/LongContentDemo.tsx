import { CodePreview } from "@wangxiaojinger/qizhi-react";

const source = Array.from(
  { length: 24 },
  (_, index) => `step_${index + 1}: execute a deliberately long QIZHI workflow instruction with traceable output and safe fallback behavior`,
).join("\n");

export default function LongContentDemo() {
  return (
    <CodePreview
      value={source}
      language="yaml"
      wrap
      downloadable
      fileName="workflow.yaml"
      maxHeight={280}
    />
  );
}
