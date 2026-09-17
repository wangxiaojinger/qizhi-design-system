import { Divider, Select } from "@wangxiaojinger/qizhi-react";

const tags = Array.from({ length: 5 }, (_, index) => ({
  label: `标签 ${index}`,
  value: `标签 ${index}`,
}));
const firstFourValues = tags.slice(0, 4).map((item) => item.value);

export default function MaxTagsDemo() {
  return (
    <div className="select-docs-max">
      <Divider>最多显示三个标签</Divider>
      <Select
        mode="multiple"
        options={tags.slice(0, 4)}
        defaultValue={firstFourValues}
        maxTagCount={3}
        renderMore={(count) => `+${count}...`}
      />

      <Divider>自定义渲染省略节点</Divider>
      <Select
        mode="multiple"
        options={tags.slice(0, 4)}
        defaultValue={firstFourValues}
        maxTagCount={3}
        renderMore={(count) => `+${count}`}
      />

      <Divider>根据 Select 宽度自适应渲染标签个数</Divider>
      <Select
        mode="multiple"
        options={tags}
        defaultValue={tags.map((item) => item.value)}
        maxTagCount="responsive"
        renderMore={(count) => `+ ${count} ...`}
      />
    </div>
  );
}
