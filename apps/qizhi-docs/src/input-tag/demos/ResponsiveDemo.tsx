import { InputTag } from "@wangxiaojinger/qizhi-react";

const tags = ["标签 1", "标签 2", "标签 3", "标签 4", "标签 5"];

export default function ResponsiveDemo() {
  return (
    <div className="input-tag-demo-row">
      <InputTag
        style={{ width: 300 }}
        defaultValue={tags}
        maxTagCount="responsive"
        renderMore={(count) => `+${count}`}
        aria-label="响应式标签"
      />
      <InputTag
        style={{ width: 300 }}
        defaultValue={tags}
        maxTagCount="responsive"
        renderMore={(count) => `+${count} 个更多`}
        aria-label="响应式自定义更多标签"
      />
    </div>
  );
}
