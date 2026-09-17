import { render, screen } from "@testing-library/react";
import { Layout } from "./Layout";

describe("Layout", () => {
  it("composes header, content, footer and automatically marks a sider row", () => {
    const { container } = render(
      <>
        <Layout aria-label="纵向布局">
          <Layout.Header>Header</Layout.Header>
          <Layout.Content>Content</Layout.Content>
          <Layout.Footer>Footer</Layout.Footer>
        </Layout>
        <Layout aria-label="复合布局">
          <Layout.Header>Header</Layout.Header>
          <Layout>
            <Layout.Sider>Sider</Layout.Sider>
            <Layout.Content>Content</Layout.Content>
          </Layout>
          <Layout.Footer>Footer</Layout.Footer>
        </Layout>
      </>,
    );

    expect(screen.getByLabelText("纵向布局")).toHaveClass("qizhi-layout");
    expect(screen.getAllByText("Header")[0]?.tagName).toBe("HEADER");
    expect(screen.getAllByText("Content")[0]?.tagName).toBe("MAIN");
    expect(screen.getByText("Sider").tagName).toBe("ASIDE");
    expect(screen.getAllByText("Footer")[0]?.tagName).toBe("FOOTER");
    expect(container.querySelector(".qizhi-layout--has-sider")).toBeInTheDocument();
  });
});
