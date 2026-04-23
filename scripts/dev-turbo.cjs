/**
 * Opt-in Turbopack dev. Sets NEXT_PRIVATE_TURBOPACK_INTENTIONAL so next.config.ts does not
 * strip process.env.TURBOPACK (see next.config.ts).
 */
const { spawn } = require("node:child_process");
const path = require("node:path");

const root = path.join(__dirname, "..");
const env = {
  ...process.env,
  NEXT_PRIVATE_TURBOPACK_INTENTIONAL: "1",
};

const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
const child = spawn(process.execPath, [nextBin, "dev", "--turbopack"], {
  cwd: root,
  env,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
