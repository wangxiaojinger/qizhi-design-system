import { InputTag } from "@wangxiaojinger/qizhi-react";

export default function MaxTagCountDemo() {
  return (
    <div className="input-tag-demo-row">
      <InputTag
        defaultValue={["1", "2", "3", "4", "5"]}
        maxTagCount={3}
        renderMore={(count) => `+${count}`}
        aria-label="固定最大标签数"
      />
      <InputTag
        defaultValue={["11", "22", "33", "44", "55"]}
        maxTagCount={3}
        renderMore={(count) => `${count} 个更多`}
        aria-label="自定义更多标签"
      />
    </div>
  );
}
