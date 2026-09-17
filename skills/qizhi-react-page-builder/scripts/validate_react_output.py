#!/usr/bin/env python3
import argparse
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Optional, Set


@dataclass(frozen=True)
class Finding:
  code: str
  path: str
  message: str


IMPORT_RE = re.compile(r"from\s+[\"']([^\"']+)[\"']")
RAW_COLOR_RE = re.compile(r"(?<![-\w])(?:#[0-9a-fA-F]{3,8}\b|rgba?\s*\(|hsla?\s*\()")
CSS_VARIABLE_RE = re.compile(r"var\(\s*(--[a-zA-Z0-9-]+)")
IGNORED_DIRECTORIES = {"node_modules", "dist", "build", "coverage"}
ROOT_RULE_RE = re.compile(r"(?:html|body|#root)(?:\s*,\s*(?:html|body|#root))*\s*\{([^}]*)\}", re.IGNORECASE | re.DOTALL)


def load_public_css_variables() -> set[str]:
  manifest_path = Path(__file__).resolve().parents[3] / "packages" / "qizhi-tokens" / "src" / "tokens.json"
  manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
  return {token["cssVariable"] for token in manifest["tokens"].values()}


def validate_texts(files: dict[str, str], allowed_css_variables: Optional[Set[str]] = None) -> list[Finding]:
  allowed_css_variables = allowed_css_variables if allowed_css_variables is not None else load_public_css_variables()
  findings = []
  for path, text in files.items():
    if path.endswith((".tsx", ".ts", ".jsx", ".js")):
      for package in IMPORT_RE.findall(text):
        if "apps/qizhi-docs" in package:
          findings.append(Finding("OUT_OF_SCOPE_SOURCE_IMPORT", path, f"docs source import: {package}"))
          continue
        if package.startswith((".", "/", "react", "@wangxiaojinger/qizhi-react")):
          continue
        findings.append(Finding("NON_QIZHI_UI_IMPORT", path, f"unsupported package import: {package}"))
      if re.search(r"<(?:button|input|select|textarea)\b", text):
        findings.append(Finding("NATIVE_INTERACTIVE_CONTROL", path, "use a public QIZHI React component"))
      if re.search(r"<svg\b", text, re.IGNORECASE):
        findings.append(Finding("HAND_WRITTEN_SVG", path, "use a public QIZHI icon"))
      if re.search(r"style\s*=\s*\{\{", text):
        findings.append(Finding("INLINE_STYLE", path, "use page-owned CSS and QIZHI variables"))
    if path.endswith((".css", ".scss", ".less")):
      if RAW_COLOR_RE.search(text):
        findings.append(Finding("RAW_COLOR", path, "use an allowed QIZHI color variable"))
      if re.search(r"\.qizhi-[\w-]+__", text):
        findings.append(Finding("PRIVATE_COMPONENT_SELECTOR", path, "do not select QIZHI component internals"))
      for css_variable in sorted(set(CSS_VARIABLE_RE.findall(text)) - allowed_css_variables):
        findings.append(Finding("UNKNOWN_CSS_VARIABLE", path, f"not declared by @wangxiaojinger/qizhi-tokens: {css_variable}"))
      root_scroll_locked = any(
        re.search(r"overflow-(?:x|y)\s*:\s*hidden", declarations, re.IGNORECASE)
        for declarations in ROOT_RULE_RE.findall(text)
      )
      if root_scroll_locked:
        findings.append(Finding(
          "ROOT_SCROLL_LOCK",
          path,
          "keep document vertical scrolling; fix the overflowing child or use scoped overflow-x: clip",
        ))
  return findings


def validate_directory(root: Path) -> list[Finding]:
  scan_root = root / "src" if (root / "src").is_dir() else root
  files = {}
  for path in scan_root.rglob("*"):
    relative = path.relative_to(scan_root)
    if any(part in IGNORED_DIRECTORIES for part in relative.parts):
      continue
    if path.name.endswith((".test.ts", ".test.tsx", ".spec.ts", ".spec.tsx")) or path.name in {"setupTests.ts", "setupTests.tsx"}:
      continue
    if path.is_file() and path.suffix in {".ts", ".tsx", ".js", ".jsx", ".css", ".scss", ".less"}:
      files[relative.as_posix()] = path.read_text(encoding="utf-8")
  findings = validate_texts(files)
  source = "\n".join(files.values())
  has_provider = "LocaleProvider" in source and "useLocale" in source
  has_dictionaries = '"zh-CN"' in source and '"en-US"' in source
  if not has_provider or not has_dictionaries:
    findings.append(Finding(
      "MISSING_BILINGUAL_LOCALE",
      "src",
      "generated pages must use LocaleProvider/useLocale and include zh-CN plus en-US messages",
    ))
  return findings


def main() -> int:
  parser = argparse.ArgumentParser(description="Validate a generated QIZHI React page source boundary.")
  parser.add_argument("output_dir", type=Path)
  args = parser.parse_args()
  findings = validate_directory(args.output_dir.resolve())
  for finding in findings:
    print(f"{finding.code}: {finding.path}: {finding.message}")
  return 1 if findings else 0


if __name__ == "__main__":
  raise SystemExit(main())
