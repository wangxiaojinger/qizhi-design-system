import { Space, Tag } from "@wangxiaojinger/qizhi-react";
import type { TagPresetColor } from "@wangxiaojinger/qizhi-react";

const colors: TagPresetColor[] = ["red", "orangered", "orange", "gold", "lime", "green", "cyan", "blue", "qizhiblue", "purple", "magenta", "gray"];

const App = () => {
  return (
    <Space size="small" className="tag-docs-row tag-docs-row--wrap">
      {colors.map((color) => (
        <Tag key={color} color={color}>{color}</Tag>
      ))}
    </Space>
  );
};

export default App;
