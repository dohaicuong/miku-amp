import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "./index.css";

// `basepath` mirrors Vite's `base` so the router strips `/miku-amp/` (or
// whatever Pages serves under) before matching routes. In dev it's "/".
//
// `scrollRestoration` makes the router remember per-route scroll positions
// so back/forward + reload land the user where they left off — matters
// most for the long folder lists in `/library/...` and the docs sidebar.
const router = createRouter({
  routeTree,
  basepath: import.meta.env.BASE_URL,
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
