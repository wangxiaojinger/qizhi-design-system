import Prism from "prismjs";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-tsx";
import "./codeHighlight.css";

const tokenClassNames: Record<string, string> = {
  "attr-name": "qizhi-code-token--property",
  boolean: "qizhi-code-token--boolean",
  comment: "qizhi-code-token--comment",
  "function-variable": "qizhi-code-token--function",
  keyword: "qizhi-code-token--keyword",
  operator: "qizhi-code-token--operator",
  punctuation: "qizhi-code-token--punctuation",
  string: "qizhi-code-token--string",
};

function tokenText(content: Prism.TokenStream): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map(tokenText).join("");
  return tokenText(content.content);
}

function renderToken(token: string | Prism.Token, key: string, parentType?: string): React.ReactNode {
  if (typeof token === "string") {
    if (parentType === "attr-value" && token) {
      return <span className="qizhi-code-token--attribute-value" key={key}>{token}</span>;
    }
    if (parentType === "tag" && /^[A-Za-z][\w.-]*$/.test(token)) {
      const className = /^[A-Z]/.test(token) ? "qizhi-code-token--component" : "qizhi-code-token--tag";
      return <span className={className} key={key}>{token}</span>;
    }
    return token;
  }

  const text = tokenText(token.content);
  let className = token.type === "class-name"
    ? /^[A-Z]/.test(text) ? "qizhi-code-token--component" : "qizhi-code-token--tag"
    : tokenClassNames[token.type];
  if (token.type === "punctuation" && parentType === "attr-value" && token.alias !== "attr-equals") {
    className = "qizhi-code-token--attribute-punctuation";
  }
  const children = Array.isArray(token.content)
    ? token.content.map((child, index) => renderToken(child, `${key}-${index}`, token.type))
    : renderToken(token.content, `${key}-content`, token.type);

  return className ? <span className={className} key={key}>{children}</span> : children;
}

export function CodeHighlight({ source }: { source: string }) {
  const tokens = Prism.tokenize(source, Prism.languages.tsx);
  return <code className="qizhi-code-highlight qizhi-code-highlight--tsx">
    {tokens.map((token, index) => renderToken(token, String(index)))}
  </code>;
}
