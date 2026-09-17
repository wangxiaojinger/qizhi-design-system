import { useState } from "react";
import { Space, StarIcon, Switch, Tag } from "@wangxiaojinger/qizhi-react";

const App = () => {
  const [visible, setVisible] = useState(true);
  const [tags, setTags] = useState(["plain", "star"]);

  return (
    <div className="tag-docs-stack">
      <Space size="large" className="tag-docs-row">
        {tags.includes("plain") ? (
          <Tag
            closable
            visible={visible}
            onClose={() => setTags((items) => items.filter((item) => item !== "plain"))}
          >
            Tag
          </Tag>
        ) : null}
        {tags.includes("star") ? (
          <Tag
            closable
            visible={visible}
            icon={<StarIcon />}
            onClose={() => setTags((items) => items.filter((item) => item !== "star"))}
          >
            Tag
          </Tag>
        ) : null}
      </Space>
      <div className="tag-docs-toggle">
        <Switch aria-label="显示标签" size="small" checked={visible} onChange={setVisible} />
        <span>Toggle</span>
      </div>
    </div>
  );
};

export default App;
