import { Link, useForm } from "@void/react";
import type { Props } from "./index.server";

export default function UsersPage({ users }: Props) {
  const form = useForm("/users", {
    name: "",
    email: "",
  });

  return (
    <div className="page">
      <h1>Users</h1>
      <p>Manage your users directory.</p>

      <ul className="item-list">
        {users.map((user) => (
          <li key={user.id}>
            <Link href={`/users/${user.id}`} prefetch="visible">
              <strong>{user.name}</strong>
              <span className="item-meta">{user.email}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="form-card card">
        <h2>Add User</h2>
        <p style={{ marginBottom: 20 }}>Create a new user entry.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.post();
          }}
        >
          <div className="form-group">
            <label>Name</label>
            <input
              value={form.data.name}
              onChange={(e) => form.setData("name", e.target.value)}
              placeholder="Enter name"
            />
            {form.errors.name && <span className="form-error">{form.errors.name}</span>}
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              value={form.data.email}
              onChange={(e) => form.setData("email", e.target.value)}
              placeholder="Enter email"
            />
            {form.errors.email && <span className="form-error">{form.errors.email}</span>}
          </div>
          <button type="submit" className="btn btn-solid" disabled={form.processing}>
            {form.processing ? "Saving..." : "Add User"}
          </button>
        </form>
      </div>
    </div>
  );
}
