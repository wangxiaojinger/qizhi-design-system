import { useEffect, useState } from "react";
import { TreeSelect } from "@wangxiaojinger/qizhi-react";
import type { TreeSelectOption } from "@wangxiaojinger/qizhi-react";

const remoteData: TreeSelectOption[] = [
  { label: "北京", value: "beijing" },
  { label: "上海", value: "shanghai" },
  { label: "广州", value: "guangzhou" },
  { label: "深圳", value: "shenzhen" },
];

export default function App() {
  const [query, setQuery] = useState("");
  const [treeData, setTreeData] = useState(remoteData);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const normalized = query.toLowerCase();
      setTreeData(
        remoteData.filter((option) =>
          String(option.value).includes(normalized)),
      );
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  return (
    <TreeSelect
      multiple
      treeData={treeData}
      showSearch
      filterTreeNode={false}
      onSearch={setQuery}
      placeholder="请选择..."
      aria-label="远程搜索"
    />
  );
}
