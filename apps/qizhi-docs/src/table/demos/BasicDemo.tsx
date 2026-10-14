import {
  useState,
  type CSSProperties,
} from "react";
import {
  Link,
  Space,
  Table,
  Tag,
  Tooltip,
  type TableColumn,
} from "@wangxiaojinger/qizhi-react";

interface Person {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

const initialData: Person[] = [
  {
    key: "1",
    name: "约翰·布朗",
    age: 32,
    address: "纽约第一湖公园",
    tags: ["友好", "资深前端开发工程师", "设计系统", "可访问性"],
  },
  {
    key: "2",
    name: "吉姆·格林",
    age: 42,
    address: "伦敦第一湖公园",
    tags: ["可爱"],
  },
  {
    key: "3",
    name: "乔·布莱克",
    age: 32,
    address: "悉尼第一湖公园",
    tags: ["冷静", "教师"],
  },
];

const MAX_VISIBLE_TAGS = 2;
const MAX_TAG_WIDTH = 96;

function ListTag({ label }: { label: string }) {
  return (
    <Tooltip content={label} trigger={["hover", "focus"]}>
      <Tag style={{ maxWidth: MAX_TAG_WIDTH }} tabIndex={0}>
        {label}
      </Tag>
    </Tooltip>
  );
}

function TagList({ tags }: { tags: string[] }) {
  const visibleTags = tags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTags = tags.slice(MAX_VISIBLE_TAGS);

  return (
    <Space size="small" align="center">
      {visibleTags.map((tag) => <ListTag key={tag} label={tag} />)}
      {hiddenTags.length > 0 ? (
        <Tooltip
          content={hiddenTags.join("、")}
          trigger={["hover", "focus"]}
        >
          <Tag
            tabIndex={0}
            aria-label={`还有 ${hiddenTags.length} 个标签`}
          >
            +{hiddenTags.length}
          </Tag>
        </Tooltip>
      ) : null}
    </Space>
  );
}

type LinkToneStyle = CSSProperties & {
  "--qizhi-link-color": string;
  "--qizhi-link-color-hover": string;
};

const nameLinkStyle: LinkToneStyle = {
  "--qizhi-link-color": "var(--color-text-1)",
  "--qizhi-link-color-hover": "var(--color-link-hover)",
};

const secondaryLinkStyle: LinkToneStyle = {
  "--qizhi-link-color": "var(--color-text-3)",
  "--qizhi-link-color-hover": "var(--color-link-hover)",
};

export default function BasicDemo() {
  const [dataSource, setDataSource] = useState(initialData);
  const [feedback, setFeedback] = useState("");

  const columns: TableColumn<Person>[] = [
    {
      key: "name",
      title: "姓名",
      dataIndex: "name",
      minWidth: 128,
      grow: 1,
      render: (value, record) => (
        <Link
          hoverable={false}
          style={nameLinkStyle}
          onClick={() => setFeedback(`正在查看 ${record.name}`)}
        >
          {String(value)}
        </Link>
      ),
    },
    { key: "age", title: "年龄", dataIndex: "age", width: 72 },
    { key: "address", title: "地址", dataIndex: "address", width: 160 },
    {
      key: "tags",
      title: "标签",
      dataIndex: "tags",
      width: 280,
      render: (_, record) => <TagList tags={record.tags} />,
    },
    {
      key: "action",
      title: "操作",
      width: 120,
      render: (_, record) => (
        <Space size="medium">
          <Link
            hoverable={false}
            aria-label={`邀请 ${record.name}`}
            onClick={() => setFeedback(`已邀请 ${record.name}`)}
          >
            邀请
          </Link>
          <Link
            hoverable={false}
            style={secondaryLinkStyle}
            aria-label={`删除 ${record.name}`}
            onClick={() => {
              setDataSource((current) => current.filter((item) => item.key !== record.key));
              setFeedback(`已删除 ${record.name}`);
            }}
          >
            删除
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="small">
      <Table<Person>
        aria-label="基础人员表格"
        rowKey="key"
        columns={columns}
        dataSource={dataSource}
      />
      <div aria-live="polite">{feedback}</div>
    </Space>
  );
}
