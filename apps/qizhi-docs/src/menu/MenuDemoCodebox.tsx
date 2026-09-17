import { useState } from "react";
import { Button, CodeIcon, CopyIcon } from "@wangxiaojinger/qizhi-react";
import { useCopyFeedback } from "../button/useCopyFeedback";
import { CodeHighlight } from "../code/CodeHighlight";
import type { MenuDemoDefinition } from "./menuDocs.registry";

export function MenuDemoCodebox({ demo }: { demo: MenuDemoDefinition }) {
  const [expanded, setExpanded] = useState(false);
  const { copy, message } = useCopyFeedback(demo.source);
  const Demo = demo.component;
  const codeId = `menu-code-${demo.id}`;
  const description = demo.id === "顶部导航菜单" ? (
    <>
      设置 <code>mode</code> 为 <code>horizontal</code> 时，使用水平菜单；
      仅当导航项无法在当前可用空间内完整展示时出现“更多”，空间恢复后自动展开全部导航项。
    </>
  ) : demo.description;

  return (
    <article id={demo.id} className="codebox-wrapper">
      <div className="qz-description">
        <div className="qz-description-children">
          <div className="code-preview">
            <div>
              <h2 className="qz-demo-title">
                <a tabIndex={-1} href={`#${demo.id}`}>{demo.title}</a>
              </h2>
              <p>{description}</p>
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
