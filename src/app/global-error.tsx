"use client";

import type { CSSProperties } from "react";

/**
 * App-level global error UI. Avoids relying on Next's built-in global-error
 * virtual path, which Turbopack can omit from the React Client Manifest
 * (especially with spaced project paths on Windows).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={bodyStyle}>
        <main style={mainStyle}>
          <h1 style={h1Style}>Something went wrong</h1>
          <p style={pStyle}>{error.message || "An unexpected error occurred."}</p>
          <button type="button" onClick={reset} style={btnStyle}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}

const bodyStyle: CSSProperties = {
  margin: 0,
  minHeight: "100vh",
  fontFamily: "system-ui, sans-serif",
  background: "#0f172a",
  color: "#e2e8f0",
};

const mainStyle: CSSProperties = {
  maxWidth: 480,
  margin: "0 auto",
  padding: "48px 24px",
};

const h1Style: CSSProperties = {
  fontSize: "1.5rem",
  marginBottom: 12,
};

const pStyle: CSSProperties = {
  color: "#94a3b8",
  marginBottom: 24,
  lineHeight: 1.5,
};

const btnStyle: CSSProperties = {
  padding: "10px 20px",
  cursor: "pointer",
  border: "none",
  borderRadius: "10px",
  fontWeight: 700,
  background: "#2563eb",
  color: "#ffffff",
};
