import type { Props } from "./deferred.server";

export default function DeferredPage({ title, stats }: Props) {
  if (stats.loading) {
    return (
      <div className="page-center">
        <h1>{title}</h1>
        <p>
          Demonstrates <strong>deferred data loading</strong> with streaming SSR.
        </p>
        <div className="deferred-box" data-testid="deferred-loading">
          <span className="badge badge-loading">Loading...</span>
        </div>
      </div>
    );
  }
  if (stats.error) {
    return (
      <div className="page-center">
        <h1>{title}</h1>
        <p>
          Demonstrates <strong>deferred data loading</strong> with streaming SSR.
        </p>
        <div className="deferred-box" data-testid="deferred-error">
          <span className="badge badge-error">Error: {stats.error.message}</span>
        </div>
      </div>
    );
  }
  return (
    <div className="page-center">
      <h1>{title}</h1>
      <p>
        Demonstrates <strong>deferred data loading</strong> with streaming SSR.
      </p>
      <div className="deferred-box" data-testid="deferred-resolved">
        <span className="badge badge-accent">Resolved</span>
        <div style={{ marginTop: 16 }}>
          Count: <strong>{stats.value.count}</strong>
        </div>
      </div>
    </div>
  );
}
