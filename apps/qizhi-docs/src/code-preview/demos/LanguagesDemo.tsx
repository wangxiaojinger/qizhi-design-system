import { useState } from "react";
import { CodePreview, Select } from "@wangxiaojinger/qizhi-react";
import type { CodePreviewLanguage } from "@wangxiaojinger/qizhi-react";

const samples: Record<CodePreviewLanguage, string> = {
  javascript: "const platform = 'QIZHI';",
  typescript: "const enabled: boolean = true;",
  jsx: "const title = <h1>QIZHI</h1>;",
  tsx: "const title: JSX.Element = <h1>QIZHI</h1>;",
  json: '{\n  "name": "QIZHI"\n}',
  yaml: "name: QIZHI\nenabled: true",
  markdown: "# QIZHI\n\n欢迎使用启智平台。",
  shell: "echo \"QIZHI\"",
  python: "platform = \"QIZHI\"\nprint(platform)",
  text: "QIZHI plain text",
};

export default function LanguagesDemo() {
  const [language, setLanguage] = useState<CodePreviewLanguage>("json");
  return (
    <div className="content-viewer-demo-stack">
      <Select
        aria-label="代码语言"
        value={language}
        options={Object.keys(samples).map((value) => ({ label: value, value }))}
        onChange={(value) => setLanguage(String(value) as CodePreviewLanguage)}
      />
      <CodePreview value={samples[language]} language={language} />
    </div>
  );
}
