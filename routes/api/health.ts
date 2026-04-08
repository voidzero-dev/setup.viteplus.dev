import { defineHandler } from "void";

export const GET = defineHandler((c) => {
  return c.json({ status: "ok" });
});
