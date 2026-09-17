#!/usr/bin/env python3
"""Validate the minimum contract of a generated QIZHI page candidate."""

import argparse
import json
import re
from html.parser import HTMLParser
from pathlib import Path

from inventory_qizhi import build_inventory


class CandidateParser(HTMLParser):
  def __init__(self):
    super().__init__()
    self.html_lang = None
    self.title_depth = 0
    self.title_text = []
    self.ids = []
    self.classes = []
    self.buttons_without_type = 0
    self.inline_events = []

  def handle_starttag(self, tag, attrs):
    attributes = dict(attrs)
    if tag == "html":
      self.html_lang = attributes.get("lang")
    if tag == "title":
      self.title_depth += 1
    if attributes.get("id"):
      self.ids.append(attributes["id"])
    if attributes.get("class"):
      self.classes.extend(attributes["class"].split())
    if tag == "button" and not attributes.get("type"):
      self.buttons_without_type += 1
    self.inline_events.extend(name for name, _ in attrs if name.startswith("on"))

  def handle_endtag(self, tag):
    if tag == "title" and self.title_depth:
      self.title_depth -= 1

  def handle_data(self, data):
    if self.title_depth:
      self.title_text.append(data.strip())


def duplicate_values(values):
  seen = set()
  duplicates = set()
  for value in values:
    if value in seen:
      duplicates.add(value)
    seen.add(value)
  return sorted(duplicates)


def validate_output(output_dir: Path, source_root: Path = None):
  root = output_dir.resolve()
  errors = []
  warnings = []
  required = {
    "index.html": root / "index.html",
    "page-spec.md": root / "page-spec.md",
    "generation-report.md": root / "generation-report.md",
  }
  for name, path in required.items():
    if not path.is_file():
      errors.append(f"缺少必需产物: {name}")
  if errors:
    return {"status": "fail", "errors": errors, "warnings": warnings}

  html = required["index.html"].read_text(encoding="utf-8")
  page_spec = required["page-spec.md"].read_text(encoding="utf-8")
  report = required["generation-report.md"].read_text(encoding="utf-8")
  parser = CandidateParser()
  parser.feed(html)

  if parser.html_lang != "zh-CN":
    errors.append('HTML 必须设置 lang="zh-CN"')
  if not "".join(parser.title_text).strip():
    errors.append("HTML 必须包含非空 title")
  if re.search(r"\barco[-_]", html, re.IGNORECASE):
    errors.append("产物包含禁止使用的 arco 命名")
  if re.search(r"\bac[-_]", html):
    errors.append("产物包含禁止作为命名空间的 ac 前缀")
  if parser.inline_events:
    errors.append("禁止使用内联事件处理器: " + ", ".join(sorted(set(parser.inline_events))))
  if parser.buttons_without_type:
    errors.append(f"存在 {parser.buttons_without_type} 个未声明 type 的 button")
  duplicates = duplicate_values(parser.ids)
  if duplicates:
    errors.append("存在重复 ID: " + ", ".join(duplicates))
  if not any(name.startswith(("qizhi-", "qz-")) for name in parser.classes):
    errors.append("页面没有可识别的 QIZHI 组件类，不能证明复用")
  if source_root is not None:
    source_classes = set(build_inventory(source_root)["classes"])
    candidate_classes = {
      name for name in parser.classes if name.startswith(("qizhi-", "qz-"))
    }
    unknown_classes = sorted(candidate_classes - source_classes)
    if unknown_classes:
      errors.append(
        "以下 QIZHI 命名类在当前源站不存在，不得作为公共组件使用: "
        + ", ".join(unknown_classes)
      )

  for heading in ("已确认事实", "假设", "未决问题"):
    if heading not in page_spec:
      errors.append(f"page-spec.md 缺少章节: {heading}")
  if "status: candidate_pass" not in report:
    errors.append("generation-report.md 必须声明 status: candidate_pass")
  if "independent_verification: pending" not in report:
    errors.append("generation-report.md 必须声明 independent_verification: pending")
  if "组件来源" not in report:
    errors.append("generation-report.md 缺少组件来源章节")
  if not re.search(r"index\.html(?::\d+|#component-|#business-)", report):
    errors.append("generation-report.md 缺少可核对的组件来源证据")
  if not re.search(r"styles\.css:\d+", report):
    errors.append("generation-report.md 缺少可核对的样式来源证据")
  if "验收" not in report:
    errors.append("generation-report.md 缺少验收章节")

  return {
    "status": "pass" if not errors else "fail",
    "errors": errors,
    "warnings": warnings,
  }


def main():
  parser = argparse.ArgumentParser()
  parser.add_argument("output_dir")
  parser.add_argument("--source-root")
  parser.add_argument("--json", action="store_true")
  args = parser.parse_args()
  result = validate_output(
    Path(args.output_dir),
    source_root=Path(args.source_root) if args.source_root else None,
  )
  if args.json:
    print(json.dumps(result, ensure_ascii=False, indent=2))
  else:
    print(f"status: {result['status']}")
    for error in result["errors"]:
      print(f"ERROR: {error}")
    for warning in result["warnings"]:
      print(f"WARN: {warning}")
  raise SystemExit(0 if result["status"] == "pass" else 1)


if __name__ == "__main__":
  main()
