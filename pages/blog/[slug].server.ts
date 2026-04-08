import { defineHandler, defineHead } from "void";
import { POSTS } from "./_data";

export interface Props {
  post: (typeof POSTS)[number];
}

export const loader = defineHandler<Props>((c) => {
  const slug = c.req.param("slug");
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) return c.notFound();
  return { post };
});

export const head = defineHead<Props>((c, props) => {
  return {
    title: props.post.title,
  };
});
