import { defineHandler } from "void";

export const GET = defineHandler((c) => {
  return c.redirect("https://viteplus.dev/favicon.svg", 301);
});
