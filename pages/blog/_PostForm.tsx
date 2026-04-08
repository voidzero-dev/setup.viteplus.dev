import { useIslandForm } from "@void/react";

export default function PostForm() {
  const form = useIslandForm({ title: "", body: "" });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.post("/blog");
      }}
    >
      <div className="form-group">
        <label>Title</label>
        <input
          value={form.data.title}
          onChange={(e) => form.setData("title", e.target.value)}
          placeholder="Enter post title"
        />
        {form.errors.title && <span className="form-error">{form.errors.title}</span>}
      </div>
      <div className="form-group">
        <label>Body</label>
        <textarea
          value={form.data.body}
          onChange={(e) => form.setData("body", e.target.value)}
          placeholder="Write your post content"
        />
        {form.errors.body && <span className="form-error">{form.errors.body}</span>}
      </div>
      <button type="submit" className="btn btn-solid" disabled={form.processing}>
        {form.processing ? "Saving..." : "Add Post"}
      </button>
    </form>
  );
}
