import { Menu } from "./Menu";

describe("Menu type contract", () => {
  it("publishes only the approved compound API", () => {
    const menu = (
      <Menu mode="horizontal" defaultSelectedKey="home">
        <Menu.Item itemKey="home">首页</Menu.Item>
        <Menu.Group title="分组">
          <Menu.Item itemKey="detail">详情</Menu.Item>
        </Menu.Group>
      </Menu>
    );
    // @ts-expect-error v1 没有 SubMenu。
    const submenu = <Menu.SubMenu itemKey="more" title="更多" />;
    // @ts-expect-error v1 没有 defaultOpenKeys。
    const openKeys = <Menu defaultOpenKeys={["more"]} />;

    expect(menu).toBeTruthy();
    expect(submenu).toBeTruthy();
    expect(openKeys).toBeTruthy();
  });
});
