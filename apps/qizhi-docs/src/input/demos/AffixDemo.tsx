import { InfoIcon, Input, SearchIcon, UserIcon } from "@wangxiaojinger/qizhi-react";

export default function AffixDemo() {
  return (
    <div className="input-affix-demo">
      <Input prefix={<UserIcon />} placeholder="请输入内容" />
      <Input suffix={<InfoIcon />} placeholder="请输入内容" />
      <Input prefix={<UserIcon />} suffix={<InfoIcon />} placeholder="请输入内容" />
      <Input
        prefix={<UserIcon />}
        addBefore="+86"
        addAfter={<SearchIcon />}
        placeholder="请输入内容"
      />
    </div>
  );
}
