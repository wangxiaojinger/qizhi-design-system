import importlib.util
import tempfile
import unittest
from pathlib import Path


SKILL_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = SKILL_ROOT.parents[1]


def load_inventory_module():
  module_path = SKILL_ROOT / "scripts" / "inventory_react.py"
  spec = importlib.util.spec_from_file_location("inventory_react", module_path)
  if spec is None or spec.loader is None:
    raise RuntimeError("无法加载 inventory_react.py")
  module = importlib.util.module_from_spec(spec)
  spec.loader.exec_module(module)
  return module


def load_output_validator_module():
  module_path = SKILL_ROOT / "scripts" / "validate_react_output.py"
  spec = importlib.util.spec_from_file_location("validate_react_output", module_path)
  if spec is None or spec.loader is None:
    raise RuntimeError("无法加载 validate_react_output.py")
  module = importlib.util.module_from_spec(spec)
  spec.loader.exec_module(module)
  return module


class SourceScopeTests(unittest.TestCase):
  def test_skill_declares_only_the_four_allowed_design_sources(self):
    content = (SKILL_ROOT / "SKILL.md").read_text(encoding="utf-8")
    self.assertIn("packages/qizhi-react/src/index.ts", content)
    self.assertIn("apps/qizhi-docs/src/*/demos/*.tsx", content)
    self.assertIn("packages/qizhi-tokens/src/tokens.json", content)
    self.assertIn("apps/qizhi-docs/src/api/component-api.json", content)
    self.assertNotIn("styles.css 的 `:root`", content)
    self.assertNotIn("docs/specs", content)
    self.assertNotIn("index.html", content)
    self.assertNotIn("script.js", content)

  def test_skill_requires_fixed_business_card_boundaries(self):
    content = (SKILL_ROOT / "SKILL.md").read_text(encoding="utf-8")
    for component in [
      "TaskCard",
      "MarketplaceModelCard",
      "FinancialModelCard",
      "McpServiceCard",
      "ProjectCard",
      "ResourceSpecificationCard",
      "BillingBudgetCard",
      "BusinessGuide",
      "TaskOverview",
      "BasicChoiceCards",
      "IconChoiceCards",
      "ServiceDetailHeader",
    ]:
      self.assertIn(component, content)
    self.assertIn("不得使用 `ModelCard`", content)
    self.assertIn("不得使用 `ConfirmationSummary`", content)

  def test_skill_uses_the_confirmed_three_layer_component_taxonomy(self):
    content = (SKILL_ROOT / "SKILL.md").read_text(encoding="utf-8")
    for category in ["基础组件", "业务组件", "平台框架组件"]:
      self.assertIn(category, content)
    self.assertIn("`TopNavigation`", content)
    self.assertIn("`SideNavigation`", content)
    self.assertIn("`PlatformShell`", content)
    self.assertIn("顶部导航", content)
    self.assertIn("侧边导航", content)
    self.assertIn("平台框架", content)
    self.assertLess(content.index("`PlatformShell`"), content.index("`Layout`"))

  def test_skill_requires_the_project_responsive_and_localization_architecture(self):
    content = (SKILL_ROOT / "SKILL.md").read_text(encoding="utf-8")
    responsive = (SKILL_ROOT / "references/responsive-layout-contract.md").read_text(encoding="utf-8")
    localization = (SKILL_ROOT / "references/localization-contract.md").read_text(encoding="utf-8")
    self.assertIn("responsive-layout-contract.md", content)
    self.assertIn("LocaleProvider", localization)
    self.assertIn("scrollY", responsive)
    self.assertIn("scrollHeight", responsive)
    self.assertIn("clientHeight", responsive)
    self.assertIn("scrollWidth", responsive)
    self.assertIn("clientWidth", responsive)
    self.assertIn("1199", responsive)
    self.assertIn("1200", responsive)
    self.assertIn("public component prop", responsive)

  def test_output_validator_rejects_root_scroll_locking_css(self):
    module = load_output_validator_module()
    findings = module.validate_texts({
      "src/page.css": "html, body { overflow-x: hidden; } #root { overflow-y: hidden; height: 100vh; }",
    })
    self.assertEqual({finding.code for finding in findings}, {"ROOT_SCROLL_LOCK"})

  def test_inventory_returns_only_exports_demos_component_apis_and_tokens(self):
    module = load_inventory_module()
    inventory = module.build_inventory(REPO_ROOT)
    self.assertEqual(set(inventory), {"components", "icons", "demos", "componentApis", "tokens"})
    self.assertIn("Button", inventory["components"])
    self.assertTrue(any(path.endswith("/button/demos/BasicDemo.tsx") for path in inventory["demos"]))
    token = next(item for item in inventory["tokens"] if item["cssVariable"] == "--color-text-1")
    self.assertEqual(set(token), {"name", "cssVariable", "value", "category", "description"})
    self.assertTrue(token["value"])
    self.assertTrue(token["category"])
    self.assertTrue(token["description"])
    button_api = inventory["componentApis"]["buttonApi"]
    self.assertTrue(any(item["name"] == "loading" for item in button_api))
    self.assertEqual(set(button_api[0]), {"name", "description", "type", "defaultValue"})

  def test_scope_validator_rejects_unrelated_sources(self):
    module = load_inventory_module()
    findings = module.validate_requested_sources([
      "packages/qizhi-react/src/index.ts",
      "apps/qizhi-docs/src/button/demos/BasicDemo.tsx",
      "packages/qizhi-tokens/src/tokens.json",
      "apps/qizhi-docs/src/api/component-api.json",
      "styles.css:root",
      "docs/specs/qizhi-button-contract-v1.md",
      "index.html",
    ])
    self.assertEqual(findings, [
      "styles.css:root",
      "docs/specs/qizhi-button-contract-v1.md",
      "index.html",
    ])

  def test_output_validator_rejects_non_qizhi_ui_and_raw_colors(self):
    module = load_output_validator_module()
    findings = module.validate_texts({
      "src/App.tsx": 'import { Button } from "antd"; export default () => <><button>提交</button><svg /></>;',
      "src/page.css": ".page { color: #123456; background: var(--color-bg-1); }",
    })
    self.assertEqual({finding.code for finding in findings}, {
      "NON_QIZHI_UI_IMPORT",
      "NATIVE_INTERACTIVE_CONTROL",
      "HAND_WRITTEN_SVG",
      "RAW_COLOR",
    })

  def test_api_docs_render_from_generated_component_api_data(self):
    api_table = (REPO_ROOT / "apps/qizhi-docs/src/api/ApiTable.tsx").read_text(encoding="utf-8")
    self.assertIn('from "./component-api.json"', api_table)
    self.assertIn("api:", api_table)

  def test_output_validator_accepts_qizhi_components_tokens_and_layout(self):
    module = load_output_validator_module()
    findings = module.validate_texts({
      "src/App.tsx": 'import { Button, Layout } from "@wangxiaojinger/qizhi-react"; export default () => <Layout><section><Button>提交</Button></section></Layout>;',
      "src/page.css": ".page { display: grid; gap: 16px; color: var(--color-text-1); }",
    })
    self.assertEqual(findings, [])

  def test_output_validator_rejects_unregistered_css_variables(self):
    module = load_output_validator_module()
    findings = module.validate_texts({
      "src/page.css": ".page { color: var(--invented-color); background: var(--color-bg-1); }",
    })
    self.assertEqual({finding.code for finding in findings}, {"UNKNOWN_CSS_VARIABLE"})

  def test_directory_validator_ignores_generated_dependencies_and_tests(self):
    module = load_output_validator_module()
    with tempfile.TemporaryDirectory() as directory:
      root = Path(directory)
      (root / "src").mkdir()
      (root / "node_modules/package").mkdir(parents=True)
      (root / "dist").mkdir()
      (root / "src/App.tsx").write_text(
        'import { Button } from "@wangxiaojinger/qizhi-react"; export default () => <Button>提交</Button>;',
        encoding="utf-8",
      )
      (root / "src/App.test.tsx").write_text('import { Button } from "antd";', encoding="utf-8")
      (root / "node_modules/package/index.js").write_text('import x from "antd";', encoding="utf-8")
      (root / "dist/index.js").write_text('import x from "antd";', encoding="utf-8")

      self.assertEqual(
        {finding.code for finding in module.validate_directory(root)},
        {"MISSING_BILINGUAL_LOCALE"},
      )

  def test_output_validator_rejects_docs_source_imports(self):
    module = load_output_validator_module()
    findings = module.validate_texts({
      "src/App.tsx": 'import { Preview } from "../../../apps/qizhi-docs/src/menu/demos/Preview";',
    })
    self.assertEqual({finding.code for finding in findings}, {"OUT_OF_SCOPE_SOURCE_IMPORT"})

  def test_directory_validator_requires_bilingual_locale_contract(self):
    module = load_output_validator_module()
    with tempfile.TemporaryDirectory() as directory:
      root = Path(directory)
      (root / "src").mkdir()
      (root / "src/App.tsx").write_text(
        'import { PlatformShell } from "@wangxiaojinger/qizhi-react"; export default () => <PlatformShell />;',
        encoding="utf-8",
      )
      findings = module.validate_directory(root)
      self.assertEqual({finding.code for finding in findings}, {"MISSING_BILINGUAL_LOCALE"})

      (root / "src/locales.ts").write_text(
        'export const messages = { "zh-CN": { title: "工作台" }, "en-US": { title: "Workbench" } };',
        encoding="utf-8",
      )
      (root / "src/App.tsx").write_text(
        'import { LocaleProvider, PlatformShell, useLocale } from "@wangxiaojinger/qizhi-react"; export default () => <LocaleProvider><PlatformShell /></LocaleProvider>;',
        encoding="utf-8",
      )
      self.assertEqual(module.validate_directory(root), [])

  def test_agent_management_page_respects_the_output_boundary(self):
    module = load_output_validator_module()
    findings = module.validate_directory(REPO_ROOT / "generated-react-pages/agent-management")
    self.assertEqual({finding.code for finding in findings}, {"MISSING_BILINGUAL_LOCALE"})


if __name__ == "__main__":
  unittest.main()
