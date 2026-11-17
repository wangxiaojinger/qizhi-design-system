import { spawn } from "node:child_process";
import { cp, mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixtureRoot = resolve(repositoryRoot, "tests/fixtures/packed-consumer");

function run(command, arguments_, cwd) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, arguments_, { cwd, stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`${command} ${arguments_.join(" ")} failed with ${signal ?? `exit code ${code}`}`));
    });
  });
}

async function findTarball(directory, packageFragment) {
  const tarballs = (await readdir(directory)).filter((file) => file.endsWith(".tgz") && file.includes(packageFragment));
  if (tarballs.length !== 1) throw new Error(`expected one ${packageFragment} tarball, received: ${tarballs.join(", ") || "none"}`);
  return join(directory, tarballs[0]);
}

const temporaryRoot = await mkdtemp(join(tmpdir(), "qizhi-packed-consumer-"));
try {
  const tarballDirectory = join(temporaryRoot, "tarballs");
  const consumerRoot = join(temporaryRoot, "consumer");
  await mkdir(tarballDirectory);

  await run("pnpm", ["--filter", "@wangxiaojinger/qizhi-tokens", "pack", "--pack-destination", tarballDirectory], repositoryRoot);
  await run("pnpm", ["--filter", "@wangxiaojinger/qizhi-react", "pack", "--pack-destination", tarballDirectory], repositoryRoot);

  const tokensTarball = await findTarball(tarballDirectory, "qizhi-tokens");
  const reactTarball = await findTarball(tarballDirectory, "qizhi-react");
  await cp(fixtureRoot, consumerRoot, { recursive: true });
  await writeFile(join(consumerRoot, "package.json"), `${JSON.stringify({
    name: "qizhi-packed-consumer",
    private: true,
    type: "module",
    scripts: { build: "vite build" },
    dependencies: {
      "@wangxiaojinger/qizhi-react": `file:${reactTarball}`,
      "@wangxiaojinger/qizhi-tokens": `file:${tokensTarball}`,
      antd: "6.6.6",
      react: "19.3.0",
      "react-dom": "19.3.0",
    },
    devDependencies: {
      "@types/react": "19.2.18",
      "@types/react-dom": "19.2.4",
      "@vitejs/plugin-react": "6.0.5",
      typescript: "7.0.2",
      vite: "8.2.1",
    },
  }, null, 2)}\n`, "utf8");
  await writeFile(join(consumerRoot, "pnpm-workspace.yaml"), `overrides:\n  \"@wangxiaojinger/qizhi-tokens\": \"file:${tokensTarball}\"\n`, "utf8");

  await run("pnpm", ["install", "--strict-peer-dependencies"], consumerRoot);
  await run("pnpm", ["run", "build"], consumerRoot);

  const lockfile = await readFile(join(consumerRoot, "pnpm-lock.yaml"), "utf8");
  if (!lockfile.includes("antd@6.6.6:")) throw new Error("packed consumer did not resolve antd@6.6.6");

  const packedManifest = await readFile(join(consumerRoot, "node_modules/@wangxiaojinger/qizhi-react/package.json"), "utf8");
  if (packedManifest.includes("workspace:")) throw new Error("packed React manifest leaked a workspace dependency");

  const assets = await readdir(join(consumerRoot, "dist/assets"));
  if (!assets.some((file) => file.endsWith(".js"))) throw new Error("packed consumer did not produce a JavaScript bundle");

  console.log("packed consumer verification passed with React 19.3.0 and antd 6.6.6.");
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
