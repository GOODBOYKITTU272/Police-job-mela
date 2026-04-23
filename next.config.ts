import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Dev server picks Turbopack when `!!process.env.TURBOPACK` (see router-server.js), so even
// the implicit value `"auto"` enables Turbopack and breaks the RSC client manifest on some
// Windows paths. Strip it unless the user explicitly opted into Turbopack (see scripts/dev-turbo.cjs).
if (
  process.env.__NEXT_DEV_SERVER === "1" &&
  process.env.NEXT_PRIVATE_TURBOPACK_INTENTIONAL !== "1"
) {
  delete process.env.TURBOPACK;
  delete process.env.IS_TURBOPACK_TEST;
}

// Next may pick a parent folder (e.g. C:\Users\abhil) when multiple package-lock.json
// files exist, which widens Turbopack/ESLint scope in dev. Pin the app root here.
const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)));

const nextConfig: NextConfig = {
  turbopack: {
    root: appRoot,
  },
};

export default nextConfig;
