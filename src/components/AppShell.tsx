import { Link } from "@tanstack/react-router";
import { ArchiveIcon } from "./ArchiveIcon";
import type { ReactNode } from "react";

export function AppShell({ children, title, back, actions }: { children: ReactNode; title?: string; back?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col pb-24">
      {title && (
        <header className="sticky top-0 z-20 flex items-center gap-3 bg-background/85 px-4 py-3 backdrop-blur">
          {back}
           <h1 className="min-w-0 break-words text-2xl font-semibold">{title}</h1>
          {actions && <div className="ml-auto flex shrink-0 gap-1">{actions}</div>}
        </header>
      )}
      <main className="flex-1">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-brass/60 bg-card shadow-[var(--shadow-drawer)]">
        <div className="mx-auto grid max-w-md grid-cols-3 gap-1 px-2 pb-1 pt-1.5 text-center font-display">
          {[
            { to: "/", label: "Cabinet", g: "cabinet" },
            { to: "/map", label: "Atlas", g: "atlas" },
            { to: "/favourites", label: "Favorites", g: "favourites" },
          ].map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: true }} className="flex flex-col items-center rounded-md py-2 text-muted-foreground" activeProps={{ className: "bg-secondary text-primary" }}>
              <ArchiveIcon category={n.g} className="h-8 w-8 border-current/20 bg-current/5 text-current" />
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
