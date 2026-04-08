import { Link } from "@void/react";
import type { Props } from "./[id].server";

export default function UserDetailPage({ user }: Props) {
  return (
    <div className="page">
      <h1>{user.name}</h1>
      <div className="card" style={{ display: "inline-block" }}>
        <h3>Contact</h3>
        <p>{user.email}</p>
      </div>
      <div>
        <Link href="/users" prefetch className="back-link">
          &larr; Back to Users
        </Link>
      </div>
    </div>
  );
}
