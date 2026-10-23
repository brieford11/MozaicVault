import type { ReactNode } from "react";
import { Links, Meta, Outlet, Scripts } from "react-router";
import appCss from "./styles.css?url";

export function links() {
  return [
    { rel: "stylesheet", href: appCss },
    { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
  ];
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

export function HydrateFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <title>Mozaic Vault</title>
      <p role="status" className="font-display text-xl">
        Opening your private archive…
      </p>
    </main>
  );
}

export function ErrorBoundary() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">This page didn’t load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Refresh to try opening your archive again.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Go home
        </a>
      </div>
    </main>
  );
}

export default function App() {
  return <Outlet />;
}
