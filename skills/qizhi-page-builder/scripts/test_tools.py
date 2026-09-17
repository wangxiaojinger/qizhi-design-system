import json
import tempfile
import unittest
from pathlib import Path

from inventory_qizhi import build_inventory
from validate_output import validate_output


class InventoryTests(unittest.TestCase):
  def test_extracts_component_sections_and_qizhi_contracts(self):
    with tempfile.TemporaryDirectory() as temp_dir:
      root = Path(temp_dir)
      (root / "index.html").write_text(
        '<section class="doc-section" id="component-table">'
        '<button class="qizhi-btn" data-table-demo></button></section>',
        encoding="utf-8",
      )
      (root / "styles.css").write_text(".qizhi-btn {}", encoding="utf-8")
      (root / "script.js").write_text(
        'const initTableDemo = () => {};', encoding="utf-8"
      )

      inventory = build_inventory(root)

      self.assertEqual(inventory["sections"][0]["id"], "component-table")
      self.assertIn("qizhi-btn", inventory["classes"])
      self.assertIn("data-table-demo", inventory["data_attributes"])
      self.assertIn("initTableDemo", inventory["initializers"])


class OutputValidationTests(unittest.TestCase):
  def create_candidate(self, root: Path):
    (root / "index.html").write_text(
      '<!doctype html><html lang="zh-CN"><head><title>模型管理</title></head>'
      '<body><main><button class="qizhi-btn" type="button">创建</button></main>'
      '</body></html>',
      encoding="utf-8",
    )
    (root / "page-spec.md").write_text(
      "# Page Spec\n\n## 已确认事实\n\n## 假设\n\n## 未决问题\n",
      encoding="utf-8",
    )
    (root / "generation-report.md").write_text(
      "# Generation Report\n\nstatus: candidate_pass\n"
      "independent_verification: pending\n\n## 组件来源\n\n"
      "- Button: `index.html#component-button` / `.qizhi-btn` / `styles.css:10`\n\n"
      "## 验收\n",
      encoding="utf-8",
    )

  def test_accepts_complete_candidate_contract(self):
    with tempfile.TemporaryDirectory() as temp_dir:
      root = Path(temp_dir)
      self.create_candidate(root)

      result = validate_output(root)

      self.assertEqual(result["errors"], [])

  def test_rejects_unscoped_components_and_missing_report_status(self):
    with tempfile.TemporaryDirectory() as temp_dir:
      root = Path(temp_dir)
      self.create_candidate(root)
      (root / "index.html").write_text(
        '<!doctype html><html><head><title>页面</title></head>'
        '<body><button class="arco-btn" onclick="save()">保存</button></body></html>',
        encoding="utf-8",
      )
      (root / "generation-report.md").write_text(
        "# Generation Report\n", encoding="utf-8"
      )

      result = validate_output(root)

      self.assertTrue(any("lang" in error for error in result["errors"]))
      self.assertTrue(any("arco" in error for error in result["errors"]))
      self.assertTrue(any("内联事件" in error for error in result["errors"]))
      self.assertTrue(any("candidate_pass" in error for error in result["errors"]))

  def test_rejects_report_without_component_source_evidence(self):
    with tempfile.TemporaryDirectory() as temp_dir:
      root = Path(temp_dir)
      self.create_candidate(root)
      report_path = root / "generation-report.md"
      report_path.write_text(
        report_path.read_text(encoding="utf-8").replace(
          "- Button: `index.html#component-button` / `.qizhi-btn` / `styles.css:10`\n", ""
        ),
        encoding="utf-8",
      )

      result = validate_output(root)

      self.assertTrue(any("组件来源证据" in error for error in result["errors"]))

  def test_rejects_report_without_style_source_evidence(self):
    with tempfile.TemporaryDirectory() as temp_dir:
      root = Path(temp_dir)
      self.create_candidate(root)
      report_path = root / "generation-report.md"
      report_path.write_text(
        report_path.read_text(encoding="utf-8").replace(" / `styles.css:10`", ""),
        encoding="utf-8",
      )

      result = validate_output(root)

      self.assertTrue(any("样式来源证据" in error for error in result["errors"]))

  def test_rejects_unproven_custom_component_namespace(self):
    with tempfile.TemporaryDirectory() as temp_dir:
      root = Path(temp_dir)
      self.create_candidate(root)
      html_path = root / "index.html"
      html_path.write_text(
        html_path.read_text(encoding="utf-8").replace(
          "qizhi-btn", "model-special-button"
        ),
        encoding="utf-8",
      )

      result = validate_output(root)

      self.assertTrue(any("QIZHI 组件类" in error for error in result["errors"]))

  def test_rejects_qizhi_class_missing_from_current_source(self):
    with tempfile.TemporaryDirectory() as temp_dir:
      root = Path(temp_dir) / "candidate"
      source = Path(temp_dir) / "source"
      root.mkdir()
      source.mkdir()
      self.create_candidate(root)
      (source / "index.html").write_text(
        '<section class="doc-section" id="component-button">'
        '<button class="qizhi-btn"></button></section>',
        encoding="utf-8",
      )
      (source / "styles.css").write_text(".qizhi-btn {}", encoding="utf-8")
      (source / "script.js").write_text("", encoding="utf-8")
      html_path = root / "index.html"
      html_path.write_text(
        html_path.read_text(encoding="utf-8").replace(
          'class="qizhi-btn"', 'class="qizhi-btn qz-invented-control"'
        ),
        encoding="utf-8",
      )

      result = validate_output(root, source_root=source)

      self.assertTrue(any("源站不存在" in error for error in result["errors"]))


if __name__ == "__main__":
  unittest.main()
