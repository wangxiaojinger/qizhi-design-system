import type { TableColumn } from "@wangxiaojinger/qizhi-react";

export interface Person {
  key: number;
  name: string;
  salary: number;
  address: string;
  email: string;
  department?: string;
  role?: string;
  date?: string;
  children?: Person[];
}

export const people: Person[] = [
  {
    key: 1,
    name: "简·多伊",
    salary: 23000,
    address: "伦敦公园路32号",
    email: "jane.doe@example.com",
    department: "产品设计",
    role: "设计师",
    date: "2022-04-12",
  },
  {
    key: 2,
    name: "艾丽莎·罗斯",
    salary: 25000,
    address: "伦敦公园路35号",
    email: "alisa.ross@example.com",
    department: "研发平台",
    role: "工程师",
    date: "2021-11-08",
  },
  {
    key: 3,
    name: "凯文·桑德拉",
    salary: 22000,
    address: "伦敦公园路31号",
    email: "kevin.sandra@example.com",
    department: "数据分析",
    role: "分析师",
    date: "2023-02-16",
  },
  {
    key: 4,
    name: "艾德·海伦",
    salary: 17000,
    address: "伦敦公园路42号",
    email: "ed.hellen@example.com",
    department: "运营支持",
    role: "运营专员",
    date: "2020-09-21",
  },
  {
    key: 5,
    name: "威廉·史密斯",
    salary: 27000,
    address: "伦敦公园路62号",
    email: "william.smith@example.com",
    department: "商业平台",
    role: "产品经理",
    date: "2023-07-04",
  },
];

export const columns: TableColumn<Person>[] = [
  { key: "name", title: "姓名", dataIndex: "name", width: 150 },
  { key: "salary", title: "薪水", dataIndex: "salary", width: 120 },
  { key: "address", title: "地址", dataIndex: "address", width: 210 },
  { key: "email", title: "电子邮件", dataIndex: "email", width: 240 },
];
