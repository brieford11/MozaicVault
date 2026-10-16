import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function AppShell({ children, title, back }: { children: ReactNode; title?: string; back?: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col pb-24">
      {title && (
        <header className="sticky top-0 z-20 flex items-center gap-3 bg-background/85 px-4 py-3 backdrop-blur">
          {back}
          <h1 className="truncate text-2xl font-semibold tracking-wide">{title}</h1>
        </header>
      )}
      <main className="flex-1">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-brass/60 bg-card shadow-[0_-6px_20px_-8px_oklch(0_0_0/0.8)]">
        <div className="mx-auto grid max-w-md grid-cols-3 gap-1 px-2 pb-1 pt-1.5 text-center font-display">
          {[
            { to: "/", label: "Cabinet", g: "▤" },
            { to: "/map", label: "Atlas", g: "✧" },
            { to: "/pinboard", label: "Pinboard", g: "⚲" },
          ].map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: true }} className="flex flex-col items-center rounded-md py-2 text-muted-foreground" activeProps={{ className: "bg-secondary text-primary" }}>
              <span className="text-xl leading-none">{n.g}</span>
              <span className="mt-1 text-base font-semibold tracking-wider">{n.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function BackLink({ cat }: { cat?: string | undefined }) {
  const cls = "text-2xl text-primary";
  return cat ? <Link to="/shelf/$cat" params={{ cat }} className={cls} aria-label="Back">‹</Link> : <Link to="/" className={cls} aria-label="Back">‹</Link>;
}
