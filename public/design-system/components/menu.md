```scope
Menu
Button
```

# Menu

Dropdown menus for sort, filter, and action lists. Headless via Base UI, themed to match the app's surfaces and toasts. The compound exposes a trigger, a portalled popup, items, separators, and groups.

```tsx preview
<Menu>
  <Menu.Trigger render={<Button variant="ghost">Sort</Button>} />
  <Menu.Portal>
    <Menu.Positioner sideOffset={6}>
      <Menu.Popup>
        <Menu.Item>Title (A → Z)</Menu.Item>
        <Menu.Item>Recently played</Menu.Item>
        <Menu.Item>Recently added</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu>
```

## Anatomy

`Menu` is the root. The trigger uses Base UI's `render` prop to project menu semantics onto whatever button you choose. The popup must live inside `Menu.Portal` + `Menu.Positioner` so it escapes ancestor `overflow` and floats freely.

```tsx
import { Menu } from "@/components/primitives/menu";
import { Button } from "@/components/primitives/button";

<Menu>
  <Menu.Trigger render={<Button variant="ghost">Open menu</Button>} />
  <Menu.Portal>
    <Menu.Positioner sideOffset={6}>
      <Menu.Popup>
        <Menu.Item>…</Menu.Item>
        <Menu.Separator />
        <Menu.Group>
          <Menu.GroupLabel>…</Menu.GroupLabel>
          <Menu.Item>…</Menu.Item>
        </Menu.Group>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu>;
```

## Examples

### Default — Library Sort

A flat list of items. Hover or arrow-key to highlight; click or Enter to activate.

```tsx preview
<Menu>
  <Menu.Trigger render={<Button variant="ghost">Sort</Button>} />
  <Menu.Portal>
    <Menu.Positioner sideOffset={6}>
      <Menu.Popup>
        <Menu.Item>Title (A → Z)</Menu.Item>
        <Menu.Item>Recently played</Menu.Item>
        <Menu.Item>Recently added</Menu.Item>
        <Menu.Separator />
        <Menu.Group>
          <Menu.GroupLabel>By Artist</Menu.GroupLabel>
          <Menu.Item>Hatsune Miku</Menu.Item>
          <Menu.Item>Kagamine Rin/Len</Menu.Item>
          <Menu.Item>Megurine Luka</Menu.Item>
          <Menu.Item>KAITO</Menu.Item>
          <Menu.Item>MEIKO</Menu.Item>
        </Menu.Group>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu>
```

### Disabled item

`disabled` on an item dims it and removes it from keyboard cycling. Useful for actions that need to be visible but currently unavailable.

```tsx preview
<Menu>
  <Menu.Trigger render={<Button variant="outline">Actions</Button>} />
  <Menu.Portal>
    <Menu.Positioner sideOffset={6}>
      <Menu.Popup>
        <Menu.Item>Play next</Menu.Item>
        <Menu.Item>Add to queue</Menu.Item>
        <Menu.Item disabled>Remove from library (locked)</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu>
```

## Props

### Menu

Root provider. Manages open state, focus, and the portal target.

```json props
[
  {
    "prop": "...rest",
    "type": "Base UI Menu.Root props",
    "default": "—",
    "description": "Forwards directly to Base UI's `Menu.Root`. Supports `open` / `defaultOpen`, `onOpenChange`, `modal`, etc."
  }
]
```

### Menu.Trigger

The control that opens the menu. Use `render` to project menu semantics onto a `Button` / `IconButton` / custom element.

```json props
[
  {
    "prop": "render",
    "type": "ReactElement",
    "default": "—",
    "description": "Element to render as the trigger. Menu state and ARIA attributes are merged onto it."
  },
  {
    "prop": "...rest",
    "type": "Base UI Menu.Trigger props",
    "default": "—",
    "description": "Standard button props pass through."
  }
]
```

### Menu.Portal

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

### Menu.Positioner

Anchors the popup relative to the trigger. Defaults to `sideOffset={6}` so the popup doesn't kiss the trigger edge.

```json props
[
  {
    "prop": "side",
    "type": "\"top\" | \"right\" | \"bottom\" | \"left\"",
    "default": "\"bottom\"",
    "description": "Preferred placement. Base UI may flip if there isn't room."
  },
  {
    "prop": "sideOffset",
    "type": "number",
    "default": "6",
    "description": "Pixel gap between trigger and popup along the side axis."
  },
  {
    "prop": "...rest",
    "type": "Base UI Menu.Positioner props",
    "default": "—",
    "description": "Includes `align`, `alignOffset`, `collisionPadding`, etc."
  }
]
```

### Menu.Popup

The visible surface — bordered, rounded, shadowed. Animates in/out via Base UI's starting / ending styles.

```json props
[
  {
    "prop": "...rest",
    "type": "Base UI Menu.Popup props",
    "default": "—",
    "description": "Standard div props pass through to the popup root."
  }
]
```

```json data-attributes
[
  {
    "attribute": "data-starting-style",
    "description": "Set on the entry frame so the open animation can interpolate from `opacity-0 scale-95`."
  },
  {
    "attribute": "data-ending-style",
    "description": "Set on the close frame for the matching exit animation."
  }
]
```

### Menu.Item

A selectable row. Highlight follows hover and arrow-key focus; both highlight states share the same `data-highlighted` attribute and accent-soft background.

```json props
[
  {
    "prop": "disabled",
    "type": "boolean",
    "default": "false",
    "description": "Dims the item, removes it from keyboard cycling, and blocks click activation."
  },
  {
    "prop": "closeOnClick",
    "type": "boolean",
    "default": "true",
    "description": "Whether activation closes the menu. Set false for items that toggle a checked state, etc."
  },
  {
    "prop": "...rest",
    "type": "Base UI Menu.Item props",
    "default": "—",
    "description": "`onClick`, `className`, etc. pass through."
  }
]
```

```json data-attributes
[
  {
    "attribute": "data-highlighted",
    "description": "Present when the item is the active item (hover or keyboard focus). Drives the accent-soft background."
  },
  { "attribute": "data-disabled", "description": "Mirrored when `disabled` is set." }
]
```

### Menu.Separator

A 1 px horizontal rule, full-bleed inside the popup padding.

```json props
[
  {
    "prop": "...rest",
    "type": "Base UI Menu.Separator props",
    "default": "—",
    "description": "Standard div props pass through."
  }
]
```

### Menu.Group + Menu.GroupLabel

Visual + ARIA grouping for related items. The label is `text-style-eyebrow` and not focusable.

```json props
[
  {
    "prop": "...rest",
    "type": "Base UI Menu.Group / GroupLabel props",
    "default": "—",
    "description": "Standard div props pass through. The label is wired as `aria-labelledby` for the group automatically."
  }
]
```

## Accessibility

- The popup is rendered to a portal but ARIA-wires back to the trigger via `aria-controls` / `aria-expanded`.
- Focus is trapped to the popup while open and returns to the trigger on close.
- Disabled items are skipped during arrow-key navigation but remain in the DOM for screen-reader context.

### Keyboard

```json keyboard
[
  {
    "keys": ["Enter", "Space"],
    "description": "Opens the menu (when focused on the trigger) or activates the highlighted item."
  },
  {
    "keys": ["ArrowDown"],
    "description": "Moves highlight to the next enabled item; opens the menu from a closed trigger."
  },
  { "keys": ["ArrowUp"], "description": "Moves highlight to the previous enabled item." },
  { "keys": ["Home"], "description": "Highlights the first item." },
  { "keys": ["End"], "description": "Highlights the last item." },
  { "keys": ["Escape"], "description": "Closes the menu and returns focus to the trigger." },
  {
    "keys": ["Tab"],
    "description": "Closes the menu and moves focus to the next focusable element."
  }
]
```
