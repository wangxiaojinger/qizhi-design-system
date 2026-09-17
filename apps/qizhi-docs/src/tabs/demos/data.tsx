import type { TabsItem } from "@wangxiaojinger/qizhi-react";

export const basicItems: readonly TabsItem[] = [
  { key: "one", title: "标签一", content: "标签一内容区。" },
  { key: "two", title: "标签二", content: "标签二内容区。" },
  { key: "three", title: "标签三", content: "标签三内容区。" },
];

export const tabItems = (count = 3): readonly TabsItem[] =>
  Array.from({ length: count }, (_, index) => ({
    key: index + 1,
    title: `Tab ${index + 1}`,
    content: `标签${index + 1}内容区。`,
  }));

export const scrollItems: readonly TabsItem[] = Array.from(
  { length: 10 },
  (_, index) => ({
    key: index + 1,
    title: `标签${index + 1}`,
    content: `这里是标签${index + 1}内容。`,
  }),
);

