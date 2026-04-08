// vite.config.ts
import { defineConfig } from "vite-plus";
import { voidPlugin } from "void";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {},
  lint: { options: { typeAware: true, typeCheck: true } },
  plugins: [voidPlugin()],
});
