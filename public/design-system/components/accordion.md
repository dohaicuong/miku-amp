```scope
Accordion
```

# Accordion

Vertically-stacked collapsible panels. Compound: `Accordion` is the root, with `Accordion.Item`, `Accordion.Header`, `Accordion.Trigger`, and `Accordion.Panel`. Wraps Base UI's headless `Accordion` so animation, ARIA semantics, and keyboard nav come built-in. The Examples section in this very docs page is rendered with it.

```tsx preview
<Accordion>
  <Accordion.Item value="one">
    <Accordion.Header>
      <Accordion.Trigger>What's a DAP?</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>
      A digital audio player — a dedicated music device with a higher-quality DAC than a phone.
      miku-amp targets the HiBy M500.
    </Accordion.Panel>
  </Accordion.Item>
  <Accordion.Item value="two">
    <Accordion.Header>
      <Accordion.Trigger>Why pink and cyan?</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>
      Sampled from the M500 Miku edition's chassis (cyan) and button accents (pink). Cyan reads as
      the interaction layer; pink as the playback-state layer.
    </Accordion.Panel>
  </Accordion.Item>
</Accordion>
```

## Anatomy

`Accordion` is the root container. Each panel is an `Accordion.Item` with a `value` (the open/close key). Inside the item, `Accordion.Header` wraps `Accordion.Trigger` (the clickable bar) and `Accordion.Panel` (the content that expands/collapses). Multiple items can be open at once by default.

```tsx
import { Accordion } from "@/components/primitives/accordion";

<Accordion>
  <Accordion.Item value="…">
    <Accordion.Header>
      <Accordion.Trigger>…</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>…</Accordion.Panel>
  </Accordion.Item>
</Accordion>;
```

## Examples

### Default open

`defaultValue` accepts an array of item values to start opened. The pattern fits the docs system — first example open so the page isn't all-collapsed.

```tsx preview
<Accordion defaultValue={["intro"]}>
  <Accordion.Item value="intro">
    <Accordion.Header>
      <Accordion.Trigger>Intro (open by default)</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>
      This panel renders open on first paint because its value is in `defaultValue`.
    </Accordion.Panel>
  </Accordion.Item>
  <Accordion.Item value="details">
    <Accordion.Header>
      <Accordion.Trigger>More details</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>Click the trigger to open this one.</Accordion.Panel>
  </Accordion.Item>
</Accordion>
```

### Single-open

Pass `openMultiple={false}` to enforce a one-open-at-a-time behaviour. Opening any item closes the others — useful for FAQ-style copy.

```tsx preview
<Accordion openMultiple={false} defaultValue={["a"]}>
  <Accordion.Item value="a">
    <Accordion.Header>
      <Accordion.Trigger>Track A</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>Opening this closes the others.</Accordion.Panel>
  </Accordion.Item>
  <Accordion.Item value="b">
    <Accordion.Header>
      <Accordion.Trigger>Track B</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>And opening this closes Track A and Track C.</Accordion.Panel>
  </Accordion.Item>
  <Accordion.Item value="c">
    <Accordion.Header>
      <Accordion.Trigger>Track C</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>Only one panel can be open at a time.</Accordion.Panel>
  </Accordion.Item>
</Accordion>
```

## Props

### Accordion

Root container. Manages open-item state and orchestrates animations across items.

```json props
[
  {
    "prop": "defaultValue",
    "type": "string[]",
    "default": "[]",
    "description": "Item values to start in the open state. Uncontrolled."
  },
  {
    "prop": "value",
    "type": "string[]",
    "default": "—",
    "description": "Controlled list of open item values. Pair with `onValueChange` if you want the parent to own state."
  },
  {
    "prop": "onValueChange",
    "type": "(value: string[]) => void",
    "default": "—",
    "description": "Fires whenever the open set changes."
  },
  {
    "prop": "openMultiple",
    "type": "boolean",
    "default": "true",
    "description": "Whether multiple items may be open at once. Set false for FAQ-style single-open behaviour."
  },
  {
    "prop": "...rest",
    "type": "Base UI Accordion.Root props",
    "default": "—",
    "description": "Standard div props pass through."
  }
]
```

### Accordion.Item

Single panel container. Pairs a header/trigger with a panel.

```json props
[
  {
    "prop": "value",
    "type": "string",
    "default": "—",
    "description": "Stable id for the item. Used as the key in `defaultValue` / `value` to control open state."
  },
  {
    "prop": "...rest",
    "type": "Base UI Accordion.Item props",
    "default": "—",
    "description": "Standard div props pass through."
  }
]
```

### Accordion.Header

Wraps the trigger so heading semantics stay intact (`<h3>` underneath by default in Base UI).

```json props
[
  {
    "prop": "...rest",
    "type": "Base UI Accordion.Header props",
    "default": "—",
    "description": "Standard h3 props pass through."
  }
]
```

### Accordion.Trigger

The clickable bar. Renders a caret that rotates 180° when its panel opens (`group-data-[panel-open]:rotate-180`).

```json props
[
  {
    "prop": "...rest",
    "type": "Base UI Accordion.Trigger props",
    "default": "—",
    "description": "Standard button props pass through."
  }
]
```

```json data-attributes
[
  {
    "attribute": "data-panel-open",
    "description": "Set on the trigger while its panel is open. Drives the caret rotation."
  }
]
```

### Accordion.Panel

The collapsible body. Animates `height` from `0` → `var(--accordion-panel-height)` (Base UI sets this CSS variable to the natural panel height on each open).

```json props
[
  {
    "prop": "...rest",
    "type": "Base UI Accordion.Panel props",
    "default": "—",
    "description": "Standard div props pass through."
  }
]
```

```json data-attributes
[
  {
    "attribute": "data-starting-style",
    "description": "Set on entry; drives the open animation from `h-0`."
  },
  {
    "attribute": "data-ending-style",
    "description": "Set on exit; reverses the animation back to `h-0`."
  }
]
```

## Accessibility

- Triggers are wired with `aria-expanded` and `aria-controls` automatically by Base UI; the panel carries the matching `aria-labelledby`.
- Panel headings use real `<h3>` elements so they're announced as headings in the page outline — not buttons.
- Keyboard nav works without extra wiring.

### Keyboard

```json keyboard
[
  { "keys": ["Enter", "Space"], "description": "Toggles the focused panel." },
  { "keys": ["ArrowDown"], "description": "Moves focus to the next trigger." },
  { "keys": ["ArrowUp"], "description": "Moves focus to the previous trigger." },
  { "keys": ["Home"], "description": "Focuses the first trigger." },
  { "keys": ["End"], "description": "Focuses the last trigger." }
]
```
