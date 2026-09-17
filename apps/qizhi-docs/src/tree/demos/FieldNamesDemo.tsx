import { Tree } from "@wangxiaojinger/qizhi-react";

const treeData = [
  {
    id: "field-0-0",
    name: "Trunk 0-0",
    nodes: [
      {
        id: "field-0-0-2",
        name: "Branch 0-0-2",
        canSelect: false,
        nodes: [
          {
            id: "field-0-0-2-1",
            name: "Leaf",
            nodes: [
              {
                id: "field-0-0-2-1-0",
                name: "Leaf 0-0-2",
                nodes: [
                  { id: "field-0-0-2-1-0-0", name: "Leaf" },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "field-0-1",
    name: "Trunk 0-1",
    nodes: [
      {
        id: "field-0-1-1",
        name: "Branch 0-1-1",
        nodes: [{ id: "field-0-1-1-0", name: "Leaf" }],
      },
    ],
  },
];

export default function FieldNamesDemo() {
  return (
    <Tree
      treeData={treeData}
      fieldNames={{
        key: "id",
        title: "name",
        children: "nodes",
        selectable: "canSelect",
      }}
      defaultExpandedKeys={[
        "field-0-0",
        "field-0-0-2",
        "field-0-0-2-1",
        "field-0-0-2-1-0",
        "field-0-1",
        "field-0-1-1",
      ]}
      defaultSelectedKeys={["field-0-1"]}
    />
  );
}
