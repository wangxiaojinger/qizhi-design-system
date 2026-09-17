import { useState } from "react";
import { Input, MarkdownViewer } from "@wangxiaojinger/qizhi-react";

const content = `## 发布检查

- [x] API 契约
- [x] 组件测试
- [ ] 独立验收

| 能力 | 状态 |
| --- | --- |
| 代码预览 | 可用 |
| 内嵌 HTML | ~~支持~~ 不支持 |

[查看启智规范](https://example.com)`;

export default function GfmDemo() {
  const [value, setValue] = useState(content);

  return (
    <div className="markdown-live-demo">
      <section className="markdown-live-demo__pane" aria-labelledby="markdown-gfm-source-title">
        <h3 id="markdown-gfm-source-title" className="markdown-live-demo__title">Markdown 源文</h3>
        <Input.TextArea
          aria-label="扩展语法 Markdown 源文"
          rows={15}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </section>
      <section className="markdown-live-demo__pane" aria-labelledby="markdown-gfm-result-title">
        <h3 id="markdown-gfm-result-title" className="markdown-live-demo__title">渲染结果</h3>
        <div className="markdown-live-demo__result">
          <MarkdownViewer value={value} openLinksInNewTab aria-label="扩展语法渲染结果" />
        </div>
      </section>
    </div>
  );
}
