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
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto grid max-w-md grid-cols-3 text-center font-display text-sm">
          {[
            { to: "/", label: "Cabinet", g: "▤" },
            { to: "/map", label: "Atlas", g: "✧" },
            { to: "/pinboard", label: "Pinboard", g: "📌" },
          ].map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: true }} className="flex flex-col items-center py-2.5 text-muted-foreground" activeProps={{ className: "text-primary" }}>
              <span className="text-lg leading-none">{n.g}</span>
              <span className="mt-1 tracking-wider">{n.label}</span>
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
