#!/usr/bin/env python3
import argparse
import json
import re
from pathlib import Path


ALLOWED_SOURCE_PATTERNS = (
  re.compile(r"^packages/qizhi-react/src/(?:index|icon/index)\.ts$"),
  re.compile(r"^apps/qizhi-docs/src/[^/]+/demos/[^/]+\.tsx$"),
  re.compile(r"^apps/qizhi-docs/src/[^/]+/[^/]*Docs\.registry\.ts$", re.IGNORECASE),
  re.compile(r"^packages/qizhi-tokens/src/tokens\.json$"),
  re.compile(r"^apps/qizhi-docs/src/api/component-api\.json$"),
)


def exported_values(path: Path) -> list[str]:
  text = path.read_text(encoding="utf-8")
  names = set()
  for match in re.finditer(r"export\s+\{([^}]+)\}\s+from", text, re.DOTALL):
    for item in match.group(1).split(","):
      name = item.strip().split(" as ")[-1].strip()
      if name and not name.startswith("type "):
        names.add(name)
  return sorted(names)


def design_tokens(path: Path) -> list[dict[str, str]]:
  manifest = json.loads(path.read_text(encoding="utf-8"))
  return [
    {
      "name": name,
      "cssVariable": token["cssVariable"],
      "value": token["value"],
      "category": token["category"],
      "description": token["description"],
    }
    for name, token in manifest["tokens"].items()
  ]


def component_apis(path: Path) -> dict[str, list[dict[str, str]]]:
  manifest = json.loads(path.read_text(encoding="utf-8"))
  return {name: api["items"] for name, api in manifest["apis"].items()}


def build_inventory(repo_root: Path) -> dict[str, list]:
  component_index = repo_root / "packages/qizhi-react/src/index.ts"
  icon_index = repo_root / "packages/qizhi-react/src/icon/index.ts"
  demos_root = repo_root / "apps/qizhi-docs/src"
  return {
    "components": exported_values(component_index),
    "icons": exported_values(icon_index),
    "demos": sorted(path.relative_to(repo_root).as_posix() for path in demos_root.glob("*/demos/*.tsx")),
        "componentApis": component_apis(repo_root / "apps/qizhi-docs/src/api/component-api.json"),
        "componentDefaultBehaviors": {
            name: api["defaultBehaviors"]
            for name, api in json.loads((repo_root / "apps/qizhi-docs/src/api/component-api.json").read_text(encoding="utf-8"))["apis"].items()
            if api.get("defaultBehaviors")
        },
    "tokens": design_tokens(repo_root / "packages/qizhi-tokens/src/tokens.json"),
  }


def validate_requested_sources(paths: list[str]) -> list[str]:
  return [path for path in paths if not any(pattern.match(path) for pattern in ALLOWED_SOURCE_PATTERNS)]


def as_markdown(inventory: dict[str, list]) -> str:
  sections = []
  for key in ("components", "icons", "demos", "componentApis", "componentDefaultBehaviors", "tokens"):
    if key == "tokens":
      items = (
        f"- `{item['cssVariable']}` (`{item['name']}`): `{item['value']}` — "
        f"{item['category']}，{item['description']}"
        for item in inventory[key]
      )
    elif key == "componentDefaultBehaviors":
      items = (f"- `{name}`: {behavior}" for name, behaviors in inventory[key].items() for behavior in behaviors)
    elif key == "componentApis":
      items = (
        f"- `{api_name}`: " + ", ".join(f"`{item['name']}`" for item in api_items)
        for api_name, api_items in inventory[key].items()
      )
    else:
      items = (f"- `{item}`" for item in inventory[key])
    sections.append(f"## {key}\n\n" + "\n".join(items))
  return "\n\n".join(sections) + "\n"


def main() -> int:
  parser = argparse.ArgumentParser(description="Inventory the allowed QIZHI React page-builder sources.")
  parser.add_argument("--repo-root", type=Path, required=True)
  parser.add_argument("--format", choices=("json", "markdown"), default="markdown")
  args = parser.parse_args()
  inventory = build_inventory(args.repo_root.resolve())
  print(json.dumps(inventory, ensure_ascii=False, indent=2) if args.format == "json" else as_markdown(inventory), end="")
  return 0


if __name__ == "__main__":
  raise SystemExit(main())
