import { useState } from "react";
import { Input, MarkdownViewer } from "@wangxiaojinger/qizhi-react";

const content = `# Skill 使用说明

启智 Skill 用于封装可复用的 Agent 能力。

## 使用步骤

1. 选择所属项目
2. 上传 Skill.md
3. 验证运行结果

> 发布前请确认输入、输出与权限边界。`;

export default function BasicDemo() {
  const [value, setValue] = useState(content);

  return (
    <div className="markdown-live-demo">
      <section className="markdown-live-demo__pane" aria-labelledby="markdown-basic-source-title">
        <h3 id="markdown-basic-source-title" className="markdown-live-demo__title">Markdown 源文</h3>
        <Input.TextArea
          aria-label="基础文档 Markdown 源文"
          rows={15}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </section>
      <section className="markdown-live-demo__pane" aria-labelledby="markdown-basic-result-title">
        <h3 id="markdown-basic-result-title" className="markdown-live-demo__title">渲染结果</h3>
        <div className="markdown-live-demo__result">
          <MarkdownViewer value={value} aria-label="基础文档渲染结果" />
        </div>
      </section>
    </div>
  );
}
