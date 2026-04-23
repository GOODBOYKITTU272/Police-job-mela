/**
 * Next 16 defaults `next dev` to Turbopack when no bundler flag is set.
 * Some environments strip npm script args or inherit TURBOPACK=*; this entry
 * always starts the webpack dev server from the app root.
 */
const { spawn } = require("node:child_process");
const path = require("node:path");

const root = path.join(__dirname, "..");
const env = { ...process.env };
delete env.TURBOPACK;
delete env.IS_TURBOPACK_TEST;
delete env.NEXT_PRIVATE_TURBOPACK_INTENTIONAL;

const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
const child = spawn(process.execPath, [nextBin, "dev", "--webpack"], {
  cwd: root,
  env,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
