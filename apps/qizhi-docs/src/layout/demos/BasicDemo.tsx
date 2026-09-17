import { Layout } from "@wangxiaojinger/qizhi-react";

export default function BasicDemo() {
  return (
    <div className="layout-basic-demo" aria-label="Layout basic examples">
      <Layout>
        <Layout.Header>Header</Layout.Header>
        <Layout.Content>Content</Layout.Content>
        <Layout.Footer>Footer</Layout.Footer>
      </Layout>
      <Layout>
        <Layout.Header>Header</Layout.Header>
        <Layout>
          <Layout.Sider>Sider</Layout.Sider>
          <Layout.Content>Content</Layout.Content>
        </Layout>
        <Layout.Footer>Footer</Layout.Footer>
      </Layout>
    </div>
  );
}
