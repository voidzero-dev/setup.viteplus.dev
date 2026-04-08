import { Link, useShared } from "@void/react";
import "./global.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  const shared = useShared();
  return (
    <div className="app-shell">
      <nav className="nav">
        <Link href="/" prefetch className="nav-brand">
          {shared.appName}
        </Link>
        <Link href="/users" prefetch>
          Users
        </Link>
        <Link href="/blog" prefetch>
          Blog
        </Link>
        <Link href="/deferred" prefetch>
          Deferred
        </Link>
      </nav>
      {children}
      <div className="ticks"></div>
      <div className="spacer"></div>
    </div>
  );
}
