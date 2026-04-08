import Counter from "./_Counter" with { island: "load" };
import PostForm from "./_PostForm" with { island: "load" };

interface Props {
  posts: Array<{ slug: string; title: string }>;
}

export default function BlogIndex({ posts }: Props) {
  return (
    <div className="page">
      <h1>Blog</h1>
      <p>Interactive islands demo with posts and a counter.</p>

      <div style={{ marginTop: 24, marginBottom: 24 }}>
        <Counter initial={0} />
      </div>

      <h2>Posts</h2>
      <ul className="item-list">
        {posts.map((post) => (
          <li key={post.slug}>
            <a href={`/blog/${post.slug}`}>
              <strong>{post.title}</strong>
            </a>
          </li>
        ))}
      </ul>

      <div className="form-card card">
        <h2>New Post</h2>
        <p style={{ marginBottom: 20 }}>Write a new blog post.</p>
        <PostForm />
      </div>
    </div>
  );
}
