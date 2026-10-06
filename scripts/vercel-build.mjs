import { cpSync, copyFileSync, existsSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";

const build = spawnSync("npm", ["run", "build", "--workspace=@bizaffle/web"], {
  stdio: "inherit",
  shell: true,
});
if (build.status !== 0) process.exit(build.status ?? 1);

if (!existsSync("apps/web/.next")) {
  console.error("apps/web/.next was not produced");
  process.exit(1);
}

mkdirSync(".next", { recursive: true });
cpSync("apps/web/.next", ".next", { recursive: true });
copyFileSync("apps/web/next.config.ts", "next.config.ts");
if (existsSync("apps/web/public")) {
  cpSync("apps/web/public", "public", { recursive: true });
}
console.log("Copied Next.js output to repo root for Vercel");
