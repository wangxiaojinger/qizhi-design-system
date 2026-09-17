import { useState } from "react";
import { Cascader } from "@wangxiaojinger/qizhi-react";
import type { CascaderOption } from "@wangxiaojinger/qizhi-react";

const initialOptions: CascaderOption[] = [
  { label: "浙江", value: "zhejiang", isLeaf: false },
];

export default function LazyDemo() {
  const [options, setOptions] = useState(initialOptions);

  const loadMore = async () => {
    await new Promise((resolve) => window.setTimeout(resolve, 300));
    setOptions([
      {
        label: "浙江",
        value: "zhejiang",
        children: [{ label: "杭州", value: "hangzhou", isLeaf: true }],
      },
    ]);
  };

  return (
    <div className="cascader-docs-row">
      <Cascader
        options={options}
        loadMore={loadMore}
        showSearch
        allowClear
      />
      <Cascader
        mode="multiple"
        options={options}
        loadMore={loadMore}
        showSearch
        allowClear
      />
    </div>
  );
}
