import { useState } from "react";

export default function Counter({ initial = 0 }: { initial?: number }) {
  const [count, setCount] = useState(initial);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <button className="btn" onClick={() => setCount((c) => c + 1)}>
        Count is <span data-testid="count">{count}</span>
      </button>
    </div>
  );
}
