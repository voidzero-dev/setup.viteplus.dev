import { defineHandler, defer } from "void";
import type { Deferred } from "void";

export interface Props {
  title: string;
  stats: Deferred<{ count: number }>;
}

export const loader = defineHandler<Props>(() => {
  return {
    title: "Deferred Page",
    stats: defer(async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return { count: 42 };
    }),
  };
});
