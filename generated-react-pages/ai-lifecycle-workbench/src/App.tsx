import { useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Empty,
  Input,
  MetricCard,
  Pagination,
  PlatformShell,
  ProjectCard,
  Select,
  Steps,
  Tabs,
  Tag,
  Tooltip,
} from "@wangxiaojinger/qizhi-react";
import type { TabsKey } from "@wangxiaojinger/qizhi-react";
import {
  AddIcon,
  CloseIcon,
  InfoIcon,
  SearchIcon,
} from "@wangxiaojinger/qizhi-react/icon";

const taskMetrics = [
  ["交互式建模", 23, "运行中", 3],
  ["分布式训练", 12, "运行中", 2],
  ["高性能计算", 8, "运行中", 1],
  ["模型评测", 16, "最近运行", 4],
  ["专属实例", 4, "服务中", 2],
  ["动态实例", 9, "服务中", 3],
  ["弹性任务", 6, "运行中", 1],
] as const;

const projects = [
  {
    name: "基础-启智",
    englishName: "inspire-foundation",
    status: "项目申请成功",
    tone: "success" as const,
    rows: [
      ["申请空间", "华为乌兰察布公共空间"],
      ["存储配额", "已申请 10 TiB　剩余 8.42 TiB　更新于 2026-08-28 10:30 CST"],
      ["作业预算", "¥158,609.00　可用预算：¥34,706.59"],
      ["权重优先级", "普通项目-4"],
    ] as const,
    members: [{ label: "林", name: "林猫猫" }, { label: "启", name: "启智管理员" }],
  },
  {
    name: "模型训练验证项目",
    englishName: "model-training-validation",
    status: "项目申请成功",
    tone: "success" as const,
    rows: [
      ["申请空间", "华为乌兰察布公共空间"],
      ["存储配额", "已申请 2 TiB　剩余 1.72 TiB　更新于 2026-08-28 10:30 CST"],
      ["作业预算", "¥10,000.00　可用预算：¥8,992.30"],
      ["权重优先级", "高优项目-10"],
    ] as const,
    members: [{ label: "林", name: "林猫猫" }],
  },
] as const;

const approvalItems = [
  ["立项申请", 3],
  ["资源申请", 5],
  ["资源变更", 2],
] as const;

const recentItems = ["交互式建模", "数据集管理", "Agent 运行实例", "Agent 自定义部署", "Agent", "空间概览"];

export function App() {
  const [selectedNav, setSelectedNav] = useState("workbench");
  const [region, setRegion] = useState("ulanchabu");
  const [language, setLanguage] = useState("zh-CN");
  const [guideVisible, setGuideVisible] = useState(true);
  const [space, setSpace] = useState("all");
  const [activeProjectTab, setActiveProjectTab] = useState<TabsKey>("managed");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState("页面数据为本地 Mock，未接入后端、鉴权或持久化。");

  const filteredProjects = useMemo(
    () => projects.filter((project) => `${project.name} ${project.englishName}`.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  const mockAction = (label: string) => setNotice(`Mock 行为：已触发“${label}”，未执行真实跳转或提交。`);

  return (
    <PlatformShell
      className="workbench"
      aria-label="启智 AI 全生命周期管理平台工作台"
      selectedKey={selectedNav}
      onSelect={(key) => {
        setSelectedNav(key);
        mockAction(key === "workbench" ? "工作台" : key);
      }}
      greeting={null}
      topNavigationProps={{
        productName: "启智",
        tenantName: "AI 全生命周期管理平台",
        regions: [
            { key: "ulanchabu", label: "华为乌兰察布", shortLabel: "华为乌兰察布" },
            { key: "beijing", label: "华为北京", shortLabel: "华为北京" },
        ],
        region,
        onRegionChange: (key) => {
          setRegion(key);
          mockAction(`切换组织或区域：${key === "ulanchabu" ? "华为乌兰察布" : "华为北京"}`);
        },
        languages: [
            { key: "zh-CN", label: "简体中文" },
            { key: "en-US", label: "English" },
        ],
        language,
        onLanguageChange: (key) => {
          setLanguage(key);
          mockAction(`切换语言：${key === "zh-CN" ? "简体中文" : "English"}`);
        },
        onHelp: () => mockAction("资源/帮助"),
        onUserMenu: () => mockAction("用户菜单"),
      }}
    >
      <div className="page-shell">
        <div className="main-column">
          <header className="welcome">
            <p>Good day，欢迎使用</p>
            <h1>启智 AI 全生命周期管理平台</h1>
            <p>开启新的一天</p>
          </header>

          <Alert content={notice} type="info" closable onClose={() => setNotice("")} />

          {guideVisible && (
            <section className="panel guide" aria-labelledby="guide-title">
              <div className="section-heading">
                <div>
                  <h2 id="guide-title">简单几步开启您的 AI 征程</h2>
                  <p>模型全生命周期管理平台</p>
                </div>
                <Button icon={<CloseIcon />} aria-label="关闭 AI 征程引导" onClick={() => setGuideVisible(false)} />
              </div>
              <Steps
                current={1}
                items={[
                  { title: "申请 / 加入项目", description: "申请项目，或由项目管理员添加至项目" },
                  { title: "模型训练与资产沉淀", description: "AI 资产管理、模型开发与训练" },
                  { title: "模型服务化部署", description: "在线推理、离线推理" },
                ]}
                aria-label="AI 征程三步引导"
              />
              <div className="guide-actions">
                <Button type="primary" onClick={() => mockAction("申请项目")}>申请项目</Button>
                <Button onClick={() => mockAction("模型开发与训练")}>模型开发与训练</Button>
                <Button onClick={() => mockAction("在线推理")}>在线推理</Button>
              </div>
            </section>
          )}

          <section className="panel" aria-labelledby="tasks-title">
            <div className="section-heading">
              <h2 id="tasks-title">任务概览</h2>
              <Select
                aria-label="任务空间筛选"
                addBefore="空间"
                value={space}
                options={[{ label: "全部", value: "all" }, { label: "华为乌兰察布公共空间", value: "public" }]}
                onChange={(value) => setSpace(String(value))}
              />
            </div>
            <div className="metric-grid">
              {taskMetrics.map(([title, total, label, value]) => (
                <MetricCard
                  key={title}
                  title={title}
                  info={title === "专属实例" ? "统计范围与口径待产品确认" : undefined}
                  total={total}
                  label={label}
                  value={value}
                  onClick={() => mockAction(`${title}任务列表`)}
                />
              ))}
            </div>
          </section>

          <section className="panel" aria-labelledby="projects-title">
            <div className="section-heading">
              <h2 id="projects-title">项目</h2>
              <Button type="primary" icon={<AddIcon />} onClick={() => mockAction("申请项目")}>申请项目</Button>
            </div>
            <Tabs
              activeKey={activeProjectTab}
              onChange={(key) => { setActiveProjectTab(key); setPage(1); }}
              renderContent={false}
              items={[
                { key: "managed", title: "我管理的项目（2）", content: null },
                { key: "joined", title: "我参与的项目（0）", content: null },
                { key: "closed", title: "已结项项目（0）", content: null },
              ]}
            />
            <div className="project-toolbar">
              <Input
                prefix={<SearchIcon />}
                value={query}
                placeholder="搜索项目中文名或英文名"
                allowClear
                onChange={(event) => { setQuery(event.target.value); setPage(1); }}
              />
              <Tag bordered>{filteredProjects.length} 个结果</Tag>
            </div>
            {activeProjectTab === "managed" && filteredProjects.length > 0 ? (
              <div className="project-grid">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.englishName}
                    {...project}
                    onOpen={() => mockAction(`${project.name}详情`)}
                    action={{ label: "资源变更", icon: <AddIcon />, onClick: () => mockAction(`${project.name}资源变更`) }}
                    onManageMembers={() => mockAction(`${project.name}成员管理`)}
                  />
                ))}
              </div>
            ) : <Empty description="当前分类暂无项目" />}
            <Pagination
              current={page}
              total={filteredProjects.length}
              pageSize={10}
              showTotal
              showPageSize
              onChange={(nextPage) => setPage(nextPage)}
              aria-label="项目列表分页"
            />
          </section>
        </div>

        <aside className="side-column" aria-label="用户与快捷信息">
          <section className="info-module user-summary">
            <Avatar size="large">林</Avatar>
            <div><h2>林猫猫</h2><p>138****8888</p></div>
            <Button type="text" onClick={() => mockAction("个人中心")}>个人中心</Button>
          </section>
          <section className="info-module">
            <h2>我的审批单</h2>
            <div className="approval-grid">
              {approvalItems.map(([label, count]) => (
                <Button key={label} long onClick={() => mockAction(`${label}审批列表`)}>{label}　{count}</Button>
              ))}
            </div>
          </section>
          <section className="info-module">
            <h2>最近访问</h2>
            <div className="recent-list">
              {recentItems.map((label) => <Button key={label} type="text" long onClick={() => mockAction(label)}>{label}</Button>)}
            </div>
          </section>
          <section className="info-module promotion">
            <div className="section-heading">
              <h2>InspireCode 功能上新</h2>
              <Tooltip content="宣传素材、投放范围与有效期均待运营配置">
                <span tabIndex={0} aria-label="宣传位说明"><InfoIcon /></span>
              </Tooltip>
            </div>
            <p>宣传位图片能力未在当前 QIZHI 公共组件与 Demo 中形成可用证据，因此仅保留已确认文案与操作。</p>
            <Button type="primary" onClick={() => mockAction("立即体验 InspireCode")}>立即体验</Button>
          </section>
        </aside>
      </div>
    </PlatformShell>
  );
}
