import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";

const assetsDirectory = resolve("dist/assets");
const javascriptFiles = (await readdir(assetsDirectory)).filter((file) => file.endsWith(".js"));
const javascript = (await Promise.all(
  javascriptFiles.map((file) => readFile(resolve(assetsDirectory, file), "utf8")),
)).join("\n");

if (!javascript.includes("ArrowDownIcon")) {
  throw new Error("单图标 smoke 产物缺少 ArrowDownIcon");
}

for (const excludedIcon of ["RobotType1Icon", "CustomDeploymentColorIcon", "HpcTaskIcon"]) {
  if (javascript.includes(excludedIcon)) {
    throw new Error(`单图标与无图标 smoke 产物意外包含 ${excludedIcon}`);
  }
}

console.log(`bundle-boundary check passed (${javascriptFiles.length} JavaScript files)`);
