import { defineHandler, defineHead } from "void";
import { USERS } from "./_data";

export interface Props {
  user: (typeof USERS)[number];
}

export const loader = defineHandler<Props>((c) => {
  const id = Number(c.req.param("id"));
  const user = USERS.find((u) => u.id === id);

  if (!user) {
    return c.notFound();
  }

  return { user };
});

export const head = defineHead<Props>((c, props) => {
  return {
    title: props.user.name,
    meta: [{ property: "og:title", content: props.user.name }],
  };
});
