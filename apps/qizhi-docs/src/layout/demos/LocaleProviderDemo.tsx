import { Button, LocaleProvider, useLocale } from "@wangxiaojinger/qizhi-react";

const messages = {
  "zh-CN": { welcome: "欢迎使用启智" },
  "en-US": { welcome: "Welcome to QIZHI" },
};

function LocaleContent() {
  const { locale, setLocale, t } = useLocale();
  return (
    <div className="qz-demo-row">
      <span>{t("welcome")}</span>
      <Button onClick={() => setLocale(locale === "zh-CN" ? "en-US" : "zh-CN")}>
        {locale === "zh-CN" ? "English" : "中文"}
      </Button>
    </div>
  );
}

export default function LocaleProviderDemo() {
  return (
    <LocaleProvider messages={messages}>
      <LocaleContent />
    </LocaleProvider>
  );
}
