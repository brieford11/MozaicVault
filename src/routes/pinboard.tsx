import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/pinboard")({
  beforeLoad: () => { throw redirect({ to: "/favourites", replace: true }); },
});