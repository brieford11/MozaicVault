import { index, route, type RouteConfig } from "@react-router/dev/routes";

// Explicitly match / as well as the archive’s existing nested URLs.
export default [
  index("archive.tsx", { id: "archive-index" }),
  route("*", "archive.tsx"),
] satisfies RouteConfig;
