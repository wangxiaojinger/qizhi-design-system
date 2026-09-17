import { useEffect, useState } from "react";
import { Button, Popconfirm } from "@wangxiaojinger/qizhi-react";

const localeCopy = {
  "zh-CN": {
    trigger: "确认操作",
    title: "确认操作",
    content: "确定要继续吗？",
    cancel: "取消",
    confirm: "确定",
  },
  "en-US": {
    trigger: "Confirm action",
    title: "Confirm action",
    content: "Are you sure you want to continue?",
    cancel: "Cancel",
    confirm: "Confirm",
  },
} as const;

type Locale = keyof typeof localeCopy;

export function ConfigPopconfirmIsland() {
  const [locale, setLocale] = useState<Locale>("zh-CN");

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(
      '[data-react-island="config-popconfirm"]',
    );
    const provider = root?.closest<HTMLElement>("[data-config-provider-demo]");
    if (!provider) return;
    const updateLocale = () => setLocale(
      provider.dataset.locale === "en-US" ? "en-US" : "zh-CN",
    );
    updateLocale();
    const observer = new MutationObserver(updateLocale);
    observer.observe(provider, {
      attributes: true,
      attributeFilter: ["data-locale"],
    });
    return () => observer.disconnect();
  }, []);

  const copy = localeCopy[locale];
  return (
    <Popconfirm
      title={copy.title}
      content={copy.content}
      cancelText={copy.cancel}
      okText={copy.confirm}
      position="top"
    >
      <Button type="primary">{copy.trigger}</Button>
    </Popconfirm>
  );
}
