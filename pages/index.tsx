import { Link } from "@void/react";
import type { Props } from "./index.server";

export default function HomePage({ title }: Props) {
  return (
    <div className="page-center">
      <h1>{title}</h1>
      <p>
        This is the <strong>React Pages</strong> playground. Edit <code>pages/index.tsx</code> and
        save to test <code>HMR</code>
      </p>
      <div style={{ marginTop: 32 }}>
        <Link href="/users" prefetch="mount" className="btn">
          Explore Users
        </Link>
      </div>
    </div>
  );
}
