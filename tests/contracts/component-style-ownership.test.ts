import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";

const sourceRoot = "packages/qizhi-react/src";

const walk = (directory: string): string[] => readdirSync(directory).flatMap((name) => {
  const path = join(directory, name);
  return statSync(path).isDirectory() ? walk(path) : [path];
});

const files = walk(sourceRoot);
const componentSources = files.filter((path) => /\.tsx?$/.test(path) && !path.includes(".test."));
const componentStyles = files.filter((path) => path.endsWith(".css"));

it("keeps every public component stylesheet attached to production source code", () => {
  expect(componentStyles).not.toHaveLength(0);

  const missingOwners = componentStyles.filter((stylePath) => {
    const importPath = `./${basename(stylePath)}`;
    return !componentSources.some((sourcePath) => (
      dirname(sourcePath) === dirname(stylePath)
      && readFileSync(sourcePath, "utf8").includes(importPath)
    ));
  });

  expect(missingOwners.map((path) => relative(sourceRoot, path))).toEqual([]);
});
