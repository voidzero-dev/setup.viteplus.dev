// vite.config.ts
import { defineConfig } from "vite-plus";
import { voidPlugin } from "void";
import { voidReact } from "@void/react/plugin";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {},
  lint: { options: { typeAware: true, typeCheck: true } },
  plugins: [voidPlugin(), voidReact()],
  // stabilize dev server start for tests
  optimizeDeps: { include: ["valibot"] },
});
