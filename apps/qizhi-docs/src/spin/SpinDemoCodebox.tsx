import { useState, type ReactNode } from "react";
import { Button, CodeIcon, CopyIcon } from "@wangxiaojinger/qizhi-react";
import { useCopyFeedback } from "../button/useCopyFeedback";
import { CodeHighlight } from "../code/CodeHighlight";
import "../code/demoCodebox.css";
import type { SpinDemoDefinition } from "./spinDocs.registry";

const renderDescription = (description: string): ReactNode => {
  const parts = description.split(/\b(tip|icon|size)\b/g);
  return parts.map((part, index) => (
    ["tip", "icon", "size"].includes(part)
      ? <code key={`${part}-${index}`}>{part}</code>
      : part
  ));
};

export function SpinDemoCodebox({ demo }: { demo: SpinDemoDefinition }) {
  const [expanded, setExpanded] = useState(false);
  const { copy, message } = useCopyFeedback(demo.source);
  const Demo = demo.component;
  const codeId = `spin-code-${demo.id}`;

  return (
    <article
      id={demo.id}
      className="codebox-wrapper qizhi-react-demo-codebox"
    >
      <div className="qz-description">
        <div className="qz-description-children">
          <div className="code-preview">
            <div>
              <h2 className="qz-demo-title">
                <a tabIndex={-1} href={`#${demo.id}`}>{demo.title}</a>
              </h2>
              {demo.description ? (
                <p>{renderDescription(demo.description)}</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <div className="demo"><Demo /></div>
      <div className="component-example-actions">
        <span className="qizhi-copy-status" role="status">{message}</span>
        <Button
          type="secondary"
          icon={<CodeIcon />}
          className="qizhi-code-action"
          aria-expanded={expanded}
          aria-controls={codeId}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "收起代码" : "查看代码"}
        </Button>
        <Button
          type="secondary"
          icon={<CopyIcon />}
          className="qizhi-code-action"
          onClick={copy}
        >
          复制代码
        </Button>
      </div>
      {expanded ? (
        <div id={codeId} className="qizhi-code-wrapper">
          <pre><CodeHighlight source={demo.source} /></pre>
        </div>
      ) : null}
    </article>
  );
}
