import { RouterProvider } from "@tanstack/react-router";
import { useState } from "react";
import { getRouter } from "./router";

export default function Archive() {
  const [router] = useState(getRouter);
  return <RouterProvider router={router} />;
}
