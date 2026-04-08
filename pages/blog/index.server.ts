import { defineHandler } from "void";
import * as v from "valibot";
import { POSTS } from "./_data";

export interface Props {
  posts: typeof POSTS;
}

export const loader = defineHandler<Props>(() => {
  return { posts: POSTS };
});

export const action = defineHandler.withValidator({
  body: v.object({
    title: v.pipe(v.string(), v.minLength(1, "Title is required")),
    body: v.pipe(v.string(), v.minLength(1, "Body is required")),
  }),
})(async (c, { body }) => {
  const slug = body.title.toLowerCase().replace(/\s+/g, "-");
  POSTS.push({ slug, title: body.title, body: body.body });
});
