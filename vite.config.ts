// vite.config.ts
import { execSync } from "node:child_process";
import { defineConfig } from "vite-plus";
import { voidPlugin } from "void";

const commitHash = execSync("git rev-parse --short HEAD").toString().trim();
const buildTime = new Date().toISOString();

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {},
  lint: { options: { typeAware: true, typeCheck: true } },
  plugins: [voidPlugin()],
  define: {
    __DEPLOY_COMMIT__: JSON.stringify(commitHash),
    __DEPLOY_TIME__: JSON.stringify(buildTime),
  },
});
