import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button, Dropdown } from "../index";

const menu = <Dropdown.Menu><Dropdown.Item itemKey="beijing">北京</Dropdown.Item><Dropdown.Item itemKey="shanghai">上海</Dropdown.Item></Dropdown.Menu>;

describe("Dropdown", () => {
  it("lets compound consumers preserve listbox and option semantics", () => {
    render(
      <Dropdown.Menu role="listbox" aria-multiselectable="true">
        <Dropdown.Item itemKey="shanghai" role="option" aria-selected="true">上海</Dropdown.Item>
      </Dropdown.Menu>,
    );

    expect(screen.getByRole("listbox")).toHaveAttribute("aria-multiselectable", "true");
    expect(screen.getByRole("option", { name: "上海" })).toHaveAttribute("aria-selected", "true");
  });

  it("opens by click, closes outside, and reports visibility", async () => {
    const user = userEvent.setup();
    const changes: boolean[] = [];
    render(<><Dropdown trigger="click" droplist={menu} onVisibleChange={(visible) => changes.push(visible)}><Button>Click</Button></Dropdown><button type="button">外部</button></>);
    const trigger = screen.getByRole("button", { name: "Click" });
    expect(trigger).toHaveClass("qizhi-dropdown__trigger");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menu")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "外部" }));
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(changes).toEqual([true, false]);
  });

  it("opens from ArrowDown and Escape closes with focus restored", async () => {
    const user = userEvent.setup();
    render(<Dropdown trigger="click" droplist={menu}><Button>键盘</Button></Dropdown>);
    const trigger = screen.getByRole("button", { name: "键盘" });
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "北京" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("selects an item, closes, and reports its stable key", async () => {
    const user = userEvent.setup();
    const selected: string[] = [];
    const keyedMenu = <Dropdown.Menu onClickMenuItem={(key) => selected.push(key)}>{menu.props.children}</Dropdown.Menu>;
    render(<Dropdown trigger="click" droplist={keyedMenu}><Button>城市</Button></Dropdown>);
    await user.click(screen.getByRole("button", { name: "城市" }));
    await user.click(screen.getByRole("menuitem", { name: "上海" }));
    expect(selected).toEqual(["shanghai"]);
    expect(screen.getByRole("button", { name: "城市" })).toHaveFocus();
  });

  it("renders the six approved positions and accessible submenus", () => {
    const positions = ["top", "tl", "tr", "bottom", "bl", "br"] as const;
    const { container } = render(<>{positions.map((position) => <Dropdown key={position} position={position} droplist={menu}><Button>{position}</Button></Dropdown>)}<Dropdown trigger="click" droplist={<Dropdown.Menu><Dropdown.SubMenu itemKey="beijing" title="北京"><Dropdown.Item itemKey="haidian">海淀</Dropdown.Item></Dropdown.SubMenu></Dropdown.Menu>}><Button>多级</Button></Dropdown></>);
    positions.forEach((position) => expect(container.querySelector(`.qizhi-dropdown--${position}`)).toBeInTheDocument());
    expect(screen.getAllByRole("menuitem", { name: "北京", hidden: true }).at(-1)).toHaveAttribute("aria-haspopup", "menu");
  });

  it("Dropdown.Button keeps primary, disabled, and loading states distinct", async () => {
    const user = userEvent.setup();
    render(<><Dropdown.Button droplist={menu} type="primary">发布</Dropdown.Button><Dropdown.Button droplist={menu} disabled>已禁用</Dropdown.Button><Dropdown.Button droplist={menu} loading>带工具提示</Dropdown.Button></>);
    expect(screen.getByRole("button", { name: "发布" })).toHaveClass("qizhi-btn-primary");
    expect(screen.getByRole("button", { name: "已禁用" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "发布菜单已禁用" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "正在加载" })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("button", { name: "正在加载" })).not.toBeDisabled();
    await user.click(screen.getByRole("button", { name: "正在加载" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
