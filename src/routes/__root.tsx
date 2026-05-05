import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toast } from "@/components/primitives/toast";
import { Tooltip } from "@/components/primitives/tooltip";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    // Toast.Provider holds the queue + animation state for toasts spawned
    // anywhere below; the matching Toast.Viewport is the visual stack.
    // Tooltip.Provider shares the hover-delay budget across adjacent triggers.
    // Both are mounted once at the route tree root.
    <Toast.Provider>
      <Tooltip.Provider>
        <Outlet />
        <Toast.Viewport />
      </Tooltip.Provider>
      {import.meta.env.DEV ? <TanStackRouterDevtools position="bottom-right" /> : null}
    </Toast.Provider>
  );
}
