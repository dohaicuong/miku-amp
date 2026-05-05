```scope
Drawer
Button
```

# Drawer

A panel that slides in from any edge — right or left for side drawers, bottom for action sheets. Dims the page with a backdrop, traps focus. Built on Base UI's `Dialog` primitive with side-aware styling. Compound: `Drawer` is the root, with `Drawer.Trigger`, `Drawer.Portal`, `Drawer.Backdrop`, `Drawer.Popup`, `Drawer.Title`, `Drawer.Description`, and `Drawer.Close`.

```tsx preview
<Drawer>
  <Drawer.Trigger render={<Button variant="primary">Open Settings</Button>} />
  <Drawer.Portal>
    <Drawer.Backdrop />
    <Drawer.Popup side="right">
      <Drawer.Title>Settings</Drawer.Title>
      <Drawer.Description>Player preferences</Drawer.Description>
      <p className="text-style-body mt-2 text-fg">
        Tune the output gain, replay-gain mode, and crossfade. The drawer traps focus while open and
        returns it to the trigger on close.
      </p>
      <div className="mt-auto flex justify-end gap-2">
        <Drawer.Close render={<Button variant="ghost">Cancel</Button>} />
        <Drawer.Close render={<Button variant="primary">Save</Button>} />
      </div>
    </Drawer.Popup>
  </Drawer.Portal>
</Drawer>
```

## Anatomy

The trigger uses Base UI's `render` prop to project drawer semantics onto any focusable control. The popup must live inside `Drawer.Portal` so it escapes ancestor `overflow`; pass `side="left"` or `side="right"` to anchor the panel.

```tsx
import { Drawer } from "@/components/primitives/drawer";
import { Button } from "@/components/primitives/button";

<Drawer>
  <Drawer.Trigger render={<Button>Open</Button>} />
  <Drawer.Portal>
    <Drawer.Backdrop />
    <Drawer.Popup side="right">
      <Drawer.Title>…</Drawer.Title>
      <Drawer.Description>…</Drawer.Description>
      <div className="mt-auto flex justify-end gap-2">
        <Drawer.Close render={<Button variant="ghost">Cancel</Button>} />
        <Drawer.Close render={<Button variant="primary">Save</Button>} />
      </div>
    </Drawer.Popup>
  </Drawer.Portal>
</Drawer>;
```

## Examples

### Right side

The default. Slides in from the right; the backdrop fades behind it. Footer actions push to the bottom via `mt-auto`.

```tsx preview
<Drawer>
  <Drawer.Trigger render={<Button variant="primary">Open Settings</Button>} />
  <Drawer.Portal>
    <Drawer.Backdrop />
    <Drawer.Popup side="right">
      <Drawer.Title>Settings</Drawer.Title>
      <Drawer.Description>Player preferences</Drawer.Description>
      <div className="text-style-body mt-2 flex flex-col gap-3 text-fg">
        <p>
          Tune the output gain, replay-gain mode, and crossfade. Your choices persist between
          sessions.
        </p>
        <p className="text-fg-muted">Nothing here is saved yet — this is a demo.</p>
      </div>
      <div className="mt-auto flex justify-end gap-2">
        <Drawer.Close render={<Button variant="ghost">Cancel</Button>} />
        <Drawer.Close render={<Button variant="primary">Save</Button>} />
      </div>
    </Drawer.Popup>
  </Drawer.Portal>
</Drawer>
```

### Left side

`side="left"` slides the panel in from the opposite edge. Useful for navigational surfaces (library index, queue) where the muscle memory is "back / index lives on the left."

```tsx preview
<Drawer>
  <Drawer.Trigger render={<Button variant="secondary">Open Queue</Button>} />
  <Drawer.Portal>
    <Drawer.Backdrop />
    <Drawer.Popup side="left">
      <Drawer.Title>Up Next</Drawer.Title>
      <Drawer.Description>Tracks queued in order</Drawer.Description>
      <ul className="text-style-track-title mt-2 flex flex-col gap-2 text-fg">
        <li>1. World Is Mine</li>
        <li>2. Tell Your World</li>
        <li>3. Senbonzakura</li>
        <li>4. Melt</li>
      </ul>
      <Drawer.Close />
    </Drawer.Popup>
  </Drawer.Portal>
</Drawer>
```

### Bottom sheet

`side="bottom"` anchors the panel to the bottom of the viewport with rounded top corners. Content-driven height capped at `85vh` so a long action list never pushes past the top. Natural fit for track-action menus, sort/filter pickers, and any "tap, pick, dismiss" flow on the M500's narrow viewport.

```tsx preview
<Drawer>
  <Drawer.Trigger render={<Button variant="primary">Track actions</Button>} />
  <Drawer.Portal>
    <Drawer.Backdrop />
    <Drawer.Popup side="bottom">
      <Drawer.Title>World Is Mine</Drawer.Title>
      <Drawer.Description>supercell · World Is Mine</Drawer.Description>
      <ul className="text-style-track-title flex flex-col gap-1 text-fg">
        <li className="cursor-pointer rounded-sm px-3 py-3 hover:bg-surface">Play next</li>
        <li className="cursor-pointer rounded-sm px-3 py-3 hover:bg-surface">Add to queue</li>
        <li className="cursor-pointer rounded-sm px-3 py-3 hover:bg-surface">Add to playlist…</li>
        <li className="cursor-pointer rounded-sm px-3 py-3 hover:bg-surface">Go to album</li>
        <li className="cursor-pointer rounded-sm px-3 py-3 hover:bg-surface">Go to artist</li>
      </ul>
      <Drawer.Close render={<Button variant="ghost">Cancel</Button>} />
    </Drawer.Popup>
  </Drawer.Portal>
</Drawer>
```

### Scrolling content

When the panel content can outgrow the viewport, add `scroll-style` and `overflow-y-auto` to the scrolling region so native scrollbars pick up the design tokens. Header, body, and footer stay laid out by the popup's flex column.

```tsx preview
<Drawer>
  <Drawer.Trigger render={<Button variant="outline">Open Library</Button>} />
  <Drawer.Portal>
    <Drawer.Backdrop />
    <Drawer.Popup side="right">
      <Drawer.Title>Library</Drawer.Title>
      <Drawer.Description>Every track on the device</Drawer.Description>
      <ul className="scroll-style text-style-track-title mt-2 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-2 text-fg">
        <li>World Is Mine</li>
        <li>Tell Your World</li>
        <li>Senbonzakura</li>
        <li>Melt</li>
        <li>Romeo and Cinderella</li>
        <li>Rolling Girl</li>
        <li>Hibikase</li>
        <li>Ghost Rule</li>
        <li>Shake It!</li>
        <li>Glass Wall</li>
        <li>Ievan Polkka</li>
        <li>Two-Sided Lovers</li>
        <li>Po Pi Po</li>
        <li>Triple Baka</li>
        <li>Hatsune Miku no Shoushitsu</li>
        <li>Saihate</li>
      </ul>
      <div className="mt-auto flex justify-end gap-2">
        <Drawer.Close render={<Button variant="ghost">Close</Button>} />
      </div>
    </Drawer.Popup>
  </Drawer.Portal>
</Drawer>
```

## Props

### Drawer

Root provider. Manages open state, focus, and scroll lock.

```json props
[
  {
    "prop": "...rest",
    "type": "Base UI Dialog.Root props",
    "default": "—",
    "description": "Forwards directly to Base UI's `Dialog.Root`. Supports `open` / `defaultOpen`, `onOpenChange`, `modal`, `dismissible`, etc."
  }
]
```

### Drawer.Trigger

The control that opens the drawer. Use `render` to project drawer semantics onto a `Button` / custom element.

```json props
[
  {
    "prop": "render",
    "type": "ReactElement",
    "default": "—",
    "description": "Element to render as the trigger. Drawer state and ARIA attributes are merged onto it."
  },
  {
    "prop": "...rest",
    "type": "Base UI Dialog.Trigger props",
    "default": "—",
    "description": "Standard button props pass through."
  }
]
```

### Drawer.Portal

Renders children into a portal at the document root so the popup escapes any clipping ancestor.

```json props
[
  {
    "prop": "container",
    "type": "HTMLElement | null",
    "default": "document.body",
    "description": "Override portal target. Rarely needed."
  }
]
```

### Drawer.Backdrop

The dimmer behind the popup. Fades in via `data-starting-style` / `data-ending-style`. Click-to-dismiss is handled by Base UI when the drawer is `dismissible`.

```json props
[
  {
    "prop": "...rest",
    "type": "Base UI Dialog.Backdrop props",
    "default": "—",
    "description": "Standard div props pass through."
  }
]
```

### Drawer.Popup

The panel surface. For `side="left"` / `"right"` it's full-height and capped at `w-96` / `max-w-[90vw]`. For `side="bottom"` it's full-width with content-driven height capped at `85vh` and rounded top corners. Slide direction follows `side`.

```json props
[
  {
    "prop": "side",
    "type": "\"left\" | \"right\" | \"bottom\"",
    "default": "\"right\"",
    "description": "Which edge the panel anchors to. Drives layout, slide direction, and corner rounding (bottom sheet rounds the top corners)."
  },
  {
    "prop": "...rest",
    "type": "Base UI Dialog.Popup props",
    "default": "—",
    "description": "Standard div props pass through to the popup root."
  }
]
```

```json data-attributes
[
  {
    "attribute": "data-starting-style",
    "description": "Set on entry; drives the slide-in from the off-screen side."
  },
  { "attribute": "data-ending-style", "description": "Set on exit; reverses the slide." }
]
```

### Drawer.Title

The drawer heading. Wired via `aria-labelledby` automatically.

```json props
[
  {
    "prop": "...rest",
    "type": "Base UI Dialog.Title props",
    "default": "—",
    "description": "Standard h2 props pass through."
  }
]
```

### Drawer.Description

Supporting copy directly under the title. Wired via `aria-describedby` automatically.

```json props
[
  {
    "prop": "...rest",
    "type": "Base UI Dialog.Description props",
    "default": "—",
    "description": "Standard p props pass through."
  }
]
```

### Drawer.Close

Closes the drawer when activated. With no `render`, renders a default text button labelled _Close_. Pass `render={<Button …>}` for the standard footer pair.

```json props
[
  {
    "prop": "render",
    "type": "ReactElement",
    "default": "—",
    "description": "Element to render as the close affordance. Click handlers are merged."
  },
  {
    "prop": "children",
    "type": "ReactNode",
    "default": "\"Close\"",
    "description": "Label for the bare close button when `render` isn't provided."
  },
  {
    "prop": "...rest",
    "type": "Base UI Dialog.Close props",
    "default": "—",
    "description": "Standard button props pass through."
  }
]
```

## Accessibility

- `Drawer.Title` and `Drawer.Description` are wired via `aria-labelledby` and `aria-describedby` on the popup automatically. Always include both.
- Focus moves into the panel on open and returns to the trigger on close. The first focusable child receives initial focus.
- Apply `scroll-style` to any overflow region inside the popup so native scrollbars match the design tokens.

### Keyboard

```json keyboard
[
  { "keys": ["Enter", "Space"], "description": "Activates the trigger to open the drawer." },
  { "keys": ["Escape"], "description": "Closes the drawer and returns focus to the trigger." },
  {
    "keys": ["Tab"],
    "description": "Cycles focus within the panel; cannot escape the drawer while open."
  }
]
```
