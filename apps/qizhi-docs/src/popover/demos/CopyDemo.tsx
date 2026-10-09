import { useState } from "react";
import { CopyIcon, Popover } from "@wangxiaojinger/qizhi-react";

const account = "qizhi-design-system";

export default function CopyDemo() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(account);
    setCopied(true);
  };

  return (
    <Popover
      variant="dark"
      ariaLabel="复制账号"
      content={(
        <span className="popover-copy-demo__content">
          <span>{account}</span>
          <button
            type="button"
            className="popover-copy-demo__button"
            aria-label="复制文本"
            onClick={copy}
          >
            <CopyIcon />
          </button>
          <span className="popover-copy-demo__status" role="status">
            {copied ? "已复制" : ""}
          </span>
        </span>
      )}
    >
      <span className="popover-demo-trigger popover-copy-demo__trigger" tabIndex={0}>
        复制账号
      </span>
    </Popover>
  );
}
