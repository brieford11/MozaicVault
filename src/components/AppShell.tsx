import { Link } from "@tanstack/react-router";
import { ArchiveIcon } from "./ArchiveIcon";
import type { ReactNode } from "react";

export function AppShell({
  children,
  title,
  back,
  actions,
}: {
  children: ReactNode;
  title?: string;
  back?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col pb-20">
      {title && (
        <header className="sticky top-0 z-20 flex items-center gap-3 bg-background/85 px-4 py-3 backdrop-blur">
          {back}
          <h1 className="min-w-0 break-words text-2xl font-semibold">{title}</h1>
          {actions && <div className="ml-auto flex shrink-0 gap-1">{actions}</div>}
        </header>
      )}
      <main className="flex-1">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-brass/60 bg-card shadow-[var(--shadow-drawer)]">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-0.5 px-1 py-1 text-center font-sans">
          {[
            { to: "/", label: "Bookshelf", g: "cabinet" },
            { to: "/calendar", label: "Calendar", g: "calendar" },
            { to: "/map", label: "Atlas", g: "atlas" },
            { to: "/reading", label: "Reading", g: "books" },
            { to: "/favourites", label: "Favorites", g: "favourites" },
          ].map((n) => (
            <Link
              key={n.to}
              aria-label={n.to === "/reading" ? "Current and upcoming books" : n.label}
              to={n.to}
              activeOptions={{ exact: true }}
              className="flex flex-col items-center rounded-md min-h-12 justify-center py-1 text-muted-foreground"
              activeProps={{ className: "bg-secondary text-primary" }}
            >
              <ArchiveIcon
                category={n.g}
                className="h-6 w-6 border-transparent bg-transparent text-current"
              />
              <span className="mt-0.5 text-[11px] font-semibold">{n.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function BackLink({ cat }: { cat?: string | undefined }) {
  const cls = "text-2xl text-primary";
  return cat ? (
    <Link to="/shelf/$cat" params={{ cat }} className={cls} aria-label="Back">
      ‹
    </Link>
  ) : (
    <Link to="/" className={cls} aria-label="Back">
      ‹
    </Link>
  );
}
