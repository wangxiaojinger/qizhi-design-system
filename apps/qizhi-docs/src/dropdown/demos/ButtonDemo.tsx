import { ChevronDownIcon, Dropdown, MoreIcon } from "@wangxiaojinger/qizhi-react";

const menu = (
  <Dropdown.Menu>
    <Dropdown.Item itemKey="draft">保存草稿</Dropdown.Item>
    <Dropdown.Item itemKey="schedule">定时发布</Dropdown.Item>
    <Dropdown.Item itemKey="preview">预览</Dropdown.Item>
  </Dropdown.Menu>
);

export default function ButtonDemo() {
  return (
    <div className="qizhi-dropdown-demo-row">
      <Dropdown.Button droplist={menu} toggleIcon={<MoreIcon />}>
        发布
      </Dropdown.Button>
      <Dropdown.Button droplist={menu} disabled>
        已禁用
      </Dropdown.Button>
      <Dropdown.Button
        droplist={menu}
        type="primary"
        toggleIcon={<ChevronDownIcon />}
      >
        发布
      </Dropdown.Button>
      <span
        className="tooltip-demo tooltip-demo--top qizhi-dropdown-button-tooltip"
        tabIndex={0}
      >
        <Dropdown.Button droplist={menu} type="primary" loading>
          带工具提示
        </Dropdown.Button>
        <span className="tooltip-demo__bubble" role="tooltip">
          <span className="tooltip-demo__content">带工具提示</span>
        </span>
      </span>
    </div>
  );
}
