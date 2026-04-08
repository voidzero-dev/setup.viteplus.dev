interface Props {
  post: { slug: string; title: string; body: string };
}

export default function BlogPost({ post }: Props) {
  return (
    <div className="page">
      <h1>{post.title}</h1>
      <div className="card" style={{ display: "inline-block" }}>
        <p>{post.body}</p>
      </div>
      <div>
        <a href="/blog" className="back-link">
          &larr; Back to Blog
        </a>
      </div>
    </div>
  );
}
