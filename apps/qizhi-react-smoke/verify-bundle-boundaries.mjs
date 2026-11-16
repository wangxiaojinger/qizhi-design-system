import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";

const assetsDirectory = resolve("dist/assets");
const javascriptFiles = (await readdir(assetsDirectory)).filter((file) => file.endsWith(".js"));
const javascript = (await Promise.all(
  javascriptFiles.map((file) => readFile(resolve(assetsDirectory, file), "utf8")),
)).join("\n");

for (const expectedCopy of ["搜索资源", "成员管理"]) {
  if (!javascript.includes(expectedCopy)) {
    throw new Error(`后台 smoke 产物缺少 ${expectedCopy} 示例`);
  }
}

console.log(`bundle-boundary check passed (${javascriptFiles.length} JavaScript files)`);
