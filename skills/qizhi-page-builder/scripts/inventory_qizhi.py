#!/usr/bin/env python3
"""Inventory QIZHI component contracts from the current static documentation site."""

import argparse
import json
import re
from pathlib import Path


SECTION_RE = re.compile(
  r'<section\s+class="[^"]*\bdoc-section\b[^"]*"\s+id="((?:component|business)-[^"]+)"'
)
CLASS_RE = re.compile(r'class="([^"]+)"')
DATA_RE = re.compile(r"\b(data-[a-z0-9-]+)(?:=|\s|>)")
INIT_RE = re.compile(r"\bconst\s+(init[A-Z][A-Za-z0-9_]*)\s*=")


def line_number(text: str, offset: int) -> int:
  return text.count("\n", 0, offset) + 1


def build_inventory(root: Path):
  root = root.resolve()
  required = [root / "index.html", root / "styles.css", root / "script.js"]
  missing = [str(path) for path in required if not path.is_file()]
  if missing:
    raise FileNotFoundError("缺少 QIZHI 源文件: " + ", ".join(missing))

  html = required[0].read_text(encoding="utf-8")
  css = required[1].read_text(encoding="utf-8")
  script = required[2].read_text(encoding="utf-8")

  sections = [
    {"id": match.group(1), "line": line_number(html, match.start())}
    for match in SECTION_RE.finditer(html)
  ]
  classes = set()
  for match in CLASS_RE.finditer(html):
    classes.update(
      item for item in match.group(1).split() if item.startswith(("qizhi-", "qz-"))
    )
  classes.update(re.findall(r"\.((?:qizhi|qz)-[a-zA-Z0-9_-]+)", css))

  return {
    "root": str(root),
    "sections": sections,
    "classes": sorted(classes),
    "data_attributes": sorted(set(DATA_RE.findall(html + "\n" + script))),
    "initializers": sorted(set(INIT_RE.findall(script))),
  }


def render_markdown(inventory) -> str:
  lines = [
    "# QIZHI 当前能力清单",
    "",
    f"源目录：`{inventory['root']}`",
    "",
    "## 文档章节",
    "",
  ]
  lines.extend(
    f"- `{item['id']}`（`index.html:{item['line']}`）"
    for item in inventory["sections"]
  )
  lines.extend(["", "## QIZHI 类", ""])
  lines.extend(f"- `.{name}`" for name in inventory["classes"])
  lines.extend(["", "## data 协议", ""])
  lines.extend(f"- `{name}`" for name in inventory["data_attributes"])
  lines.extend(["", "## 初始化函数", ""])
  lines.extend(f"- `{name}`" for name in inventory["initializers"])
  return "\n".join(lines) + "\n"


def main():
  parser = argparse.ArgumentParser()
  parser.add_argument("root", nargs="?", default=".")
  parser.add_argument("--format", choices=("json", "markdown"), default="markdown")
  args = parser.parse_args()
  inventory = build_inventory(Path(args.root))
  if args.format == "json":
    print(json.dumps(inventory, ensure_ascii=False, indent=2))
  else:
    print(render_markdown(inventory), end="")


if __name__ == "__main__":
  main()
