import { Link, Outlet, createFileRoute, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  PaletteIcon,
  PuzzlePieceIcon,
  SidebarSimpleIcon,
  StackIcon,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { Accordion } from "@/components/primitives/accordion";
import { cn } from "@/lib/cn";

// Sidebar focus-visible style — pinned outline-color so focus doesn't flash
// the wrong colour during transition-colors animations.
const focusOutline = "outline-accent outline-offset-2 focus-visible:outline-2";

export const Route = createFileRoute("/components")({
  component: ComponentsLayout,
});

type NavItem = { to: string; label: string };
type NavGroupConfig = { id: string; label: string; icon: Icon; items: NavItem[] };

const themeGroup: NavGroupConfig = {
  id: "theme",
  label: "Theme",
  icon: PaletteIcon,
  items: [
    { to: "/components/color", label: "Color" },
    { to: "/components/typography", label: "Typography" },
    { to: "/components/breakpoints", label: "Breakpoints" },
    { to: "/components/scroll-style", label: "Scroll Style" },
    { to: "/components/animation", label: "Animation" },
  ],
};

const primitivesGroup: NavGroupConfig = {
  id: "primitives",
  label: "Primitives",
  icon: PuzzlePieceIcon,
  items: [
    { to: "/components/accordion", label: "Accordion" },
    { to: "/components/button", label: "Button" },
    { to: "/components/code", label: "Code" },
    { to: "/components/dialog", label: "Dialog" },
    { to: "/components/drawer", label: "Drawer" },
    { to: "/components/empty-state", label: "Empty State" },
    { to: "/components/icon-button", label: "Icon Button" },
    { to: "/components/input", label: "Input" },
    { to: "/components/knob", label: "Knob" },
    { to: "/components/menu", label: "Menu" },
    { to: "/components/progress", label: "Progress" },
    { to: "/components/skeleton", label: "Skeleton" },
    { to: "/components/slider", label: "Slider" },
    { to: "/components/switch", label: "Switch" },
    { to: "/components/tabs", label: "Tabs" },
    { to: "/components/toast", label: "Toast" },
    { to: "/components/tooltip", label: "Tooltip" },
  ],
};

const featuresGroup: NavGroupConfig = {
  id: "features",
  label: "Features",
  icon: StackIcon,
  items: [
    { to: "/components/cover-art", label: "Cover Art" },
    { to: "/components/album-card", label: "Album Card" },
    { to: "/components/artist-card", label: "Artist Card" },
    { to: "/components/bottom-nav", label: "Bottom Nav" },
    { to: "/components/track-row", label: "Track Row" },
    { to: "/components/mini-player", label: "Mini Player" },
    { to: "/components/full-player", label: "Full Player" },
    { to: "/components/lyric-view", label: "Lyric View" },
  ],
};

const groups: NavGroupConfig[] = [themeGroup, primitivesGroup, featuresGroup];

function ComponentsLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // If the current pathname matches an item, open that group exclusively.
  // Otherwise fall back to Primitives (the most-trafficked group).
  const [initialOpenGroups] = useState<string[]>(() => {
    const match = groups.find((g) => g.items.some((item) => item.to === location.pathname));
    return match ? [match.id] : ["primitives"];
  });

  // Track the viewport across the small/large breakpoint and mirror it onto
  // the collapsed state — collapse below 640px, expand at or above. Manual
  // toggling within a viewport size still wins until the next breakpoint
  // crossing, since the listener only fires on `change`.
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 640px)");
    setCollapsed(mql.matches);
    const handler = (e: MediaQueryListEvent) => setCollapsed(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const expand = () => setCollapsed(false);

  return (
    <div className="h-dvh flex">
      <aside
        className={cn(
          "shrink-0 border-r border-border py-12 flex flex-col gap-1",
          "overflow-y-auto scroll-style transition-[width] duration-200",
          collapsed ? "w-14 px-2 items-center" : "w-60 px-6",
        )}
      >
        <div
          className={cn(
            "flex items-center mb-8 w-full",
            collapsed ? "flex-col gap-3" : "justify-between",
          )}
        >
          <Link
            to="/"
            aria-label="Back to player"
            className={cn(
              "text-style-eyebrow text-fg-muted hover:text-fg transition-colors flex items-center gap-1 rounded-sm",
              focusOutline,
            )}
          >
            {collapsed ? <ArrowLeftIcon size={18} weight="light" /> : "← Player"}
          </Link>
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            onClick={() => setCollapsed((c) => !c)}
            className={cn(
              "inline-flex items-center justify-center h-8 w-8 rounded-sm",
              "text-fg-muted hover:text-fg hover:bg-surface transition-colors",
              "cursor-pointer select-none",
              focusOutline,
            )}
          >
            <SidebarSimpleIcon size={16} weight="light" />
          </button>
        </div>

        <Link
          to="/components"
          activeOptions={{ exact: true }}
          aria-label={collapsed ? "Overview" : undefined}
          className={cn(
            "text-style-body text-fg-muted hover:text-fg transition-colors flex items-center mb-4 rounded-sm",
            "data-[status=active]:text-accent",
            focusOutline,
            collapsed
              ? "justify-center p-2"
              : "gap-2 -ml-3 border-l-2 border-transparent pl-3 py-1 data-[status=active]:border-accent",
          )}
        >
          <BookOpenIcon size={18} weight="light" className="shrink-0" />
          {!collapsed ? <span>Overview</span> : null}
        </Link>

        {collapsed ? (
          // Icon-only stub per group; tapping any of them re-expands.
          groups.map((g) => <CollapsedGroupButton key={g.id} config={g} onExpand={expand} />)
        ) : (
          // One Accordion holds all groups; multiple may be open at once.
          <Accordion
            defaultValue={initialOpenGroups}
            // Override the primitive's bordered-card chrome — sidebar is
            // already inside its own framing, doesn't want a second border.
            className="border-0 rounded-none bg-transparent overflow-visible"
          >
            {groups.map((g) => (
              <Accordion.Item key={g.id} value={g.id} className="border-b-0 mb-2 last:mb-0">
                <Accordion.Header>
                  <Accordion.Trigger
                    className={cn(
                      "px-1 py-2 -ml-1 rounded-sm",
                      "text-sm font-semibold text-fg-muted",
                      "hover:bg-transparent hover:text-fg",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <g.icon size={16} weight="light" className="shrink-0" />
                      {g.label}
                    </span>
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Panel contentClassName="pl-5 pt-1 pb-1 pr-0">
                  <div className="flex flex-col gap-1">
                    {g.items.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={cn(
                          "text-style-body text-fg-muted hover:text-fg transition-colors rounded-sm",
                          "-ml-3 border-l-2 border-transparent pl-3 py-1",
                          "data-[status=active]:text-accent data-[status=active]:border-accent",
                          focusOutline,
                        )}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        )}
      </aside>
      <main className="flex-1 overflow-y-auto scroll-style">
        <div className="px-12 py-12 max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function CollapsedGroupButton({
  config,
  onExpand,
}: {
  config: NavGroupConfig;
  onExpand: () => void;
}) {
  const GroupIcon = config.icon;
  return (
    <button
      type="button"
      onClick={onExpand}
      aria-label={config.label}
      title={config.label}
      className={cn(
        "flex items-center justify-center p-2 text-fg-muted hover:text-fg transition-colors rounded-sm",
        "cursor-pointer select-none",
        focusOutline,
      )}
    >
      <GroupIcon size={20} weight="light" />
    </button>
  );
}
