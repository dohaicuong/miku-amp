```scope
Button
useToast
```

# Toast

Transient notifications. Slide in from the top-right, stack as a deck of cards, expand on hover, swipe to dismiss. The left border carries the type colour: cyan accent for `info`, neutral muted-foreground for `success`, pink highlight for `error` (miku-amp's palette is intentionally minimal — there's no green token, and pink doubles as the "needs attention" state). Wraps Base UI's `Toast` primitive.

```tsx preview
() => {
  const toast = useToast();
  return (
    <Button
      variant="secondary"
      onClick={() =>
        toast.add({
          type: "info",
          title: "Track queued",
          description: "World is Mine added to the play queue.",
        })
      }
    >
      Show toast
    </Button>
  );
};
```

## Anatomy

`Toast.Provider` and `Toast.Viewport` are mounted once at the app root — the provider holds the toast queue, the viewport is the visual stack. From any component below the provider, call `useToast()` to receive the manager and call `add({ type, title, description, … })` to enqueue.

```tsx
// app shell — once
import { Toast } from "@/components/primitives/toast";

<Toast.Provider>
  <App />
  <Toast.Viewport />
</Toast.Provider>;

// any descendant
import { useToast } from "@/components/primitives/toast";

function SaveButton() {
  const toast = useToast();
  return <Button onClick={() => toast.add({ type: "success", title: "Saved" })}>Save</Button>;
}
```

## Examples

### Types

`type` controls the left-border accent and is forwarded as `data-type` for any further styling. Pick the type that matches the message's intent — `info` for neutral confirmations, `success` for completed actions, `error` for failures.

```tsx preview
() => {
  const toast = useToast();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant="secondary"
        onClick={() =>
          toast.add({
            type: "info",
            title: "Track queued",
            description: "World is Mine added to the play queue.",
          })
        }
      >
        Info
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast.add({
            type: "success",
            title: "Library scanned",
            description: "247 tracks indexed from /Music.",
          })
        }
      >
        Success
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast.add({
            type: "error",
            title: "Couldn't load track",
            description: "The file could not be decoded. Try another format.",
          })
        }
      >
        Error
      </Button>
    </div>
  );
};
```

### With action

`actionProps` adds an inline action button inside the toast — typically Undo, Retry, or View. Activating it doesn't auto-dismiss; the action's `onClick` decides what happens next. The handler can spawn follow-up toasts via the same manager.

```tsx preview
() => {
  const toast = useToast();
  return (
    <Button
      variant="secondary"
      onClick={() =>
        toast.add({
          type: "info",
          title: "Track removed",
          description: "World is Mine was removed from the queue.",
          actionProps: {
            children: "Undo",
            onClick: () =>
              toast.add({
                type: "success",
                title: "Track restored",
                description: "World is Mine is back in the queue.",
              }),
          },
        })
      }
    >
      Remove with undo
    </Button>
  );
};
```

## Props

### useToast()

Returns the toast manager. Call from any component below `Toast.Provider`.

```json props
[
  {
    "prop": "add",
    "type": "(options: ToastOptions) => string",
    "default": "—",
    "description": "Enqueues a toast and returns its id. Pass `{ type, title, description, actionProps?, … }`."
  },
  {
    "prop": "close",
    "type": "(id: string) => void",
    "default": "—",
    "description": "Dismisses a specific toast early."
  },
  {
    "prop": "update",
    "type": "(id: string, options: Partial<ToastOptions>) => void",
    "default": "—",
    "description": "Mutates a queued toast in place — useful for promise-style updates."
  }
]
```

### ToastOptions (passed to `add`)

```json props
[
  {
    "prop": "type",
    "type": "\"info\" | \"success\" | \"error\"",
    "default": "—",
    "description": "Drives the left-border colour and `data-type` attribute. The wrapper styles only these three values."
  },
  {
    "prop": "title",
    "type": "string",
    "default": "—",
    "description": "Bold heading line. Required for the toast to be announced meaningfully."
  },
  {
    "prop": "description",
    "type": "string",
    "default": "—",
    "description": "Supporting copy under the title. Optional but strongly recommended."
  },
  {
    "prop": "actionProps",
    "type": "{ children: ReactNode; onClick: () => void }",
    "default": "—",
    "description": "Inline action button (Undo / Retry / View). The `onClick` handler can call `toast.add` to spawn follow-up toasts."
  },
  {
    "prop": "...rest",
    "type": "Base UI ToastOptions",
    "default": "—",
    "description": "`timeout`, `priority`, etc. forward to Base UI."
  }
]
```

### Toast.Provider

Mounted once at the app root. Holds the queue and the swipe / expand state for the viewport.

```json props
[
  {
    "prop": "...rest",
    "type": "Base UI Toast.Provider props",
    "default": "—",
    "description": "Supports `limit`, `timeout`, etc."
  }
]
```

### Toast.Viewport

The visual stack. Anchored top-right with `fixed` positioning and a 22 rem column width. Renders the current toast queue as a stack-of-cards collapsed deck that expands on hover/focus.

```json props
[
  {
    "prop": "...rest",
    "type": "Base UI Toast.Viewport props",
    "default": "—",
    "description": "Standard div props pass through."
  }
]
```

```json data-attributes
[
  {
    "attribute": "data-type",
    "description": "On each toast root: `info` / `success` / `error`. Drives the left-border colour."
  },
  {
    "attribute": "data-expanded",
    "description": "Set on the viewport while hovered/focused; toasts fan out vertically instead of stacking."
  },
  {
    "attribute": "data-swiping",
    "description": "Set on a toast while the user is dragging it; the toast tracks the cursor 1:1 until release."
  },
  {
    "attribute": "data-starting-style",
    "description": "Set on entry; drives the slide-in from off-screen right."
  },
  { "attribute": "data-ending-style", "description": "Set on exit." }
]
```

## Accessibility

- Toasts are announced via `aria-live="polite"` from Base UI's viewport. `error`-type toasts use the more urgent `aria-live="assertive"`.
- The viewport itself is focusable so keyboard users can Tab into the stack and dismiss with Esc — the swipe-to-dismiss gesture is mouse / touch only.
- Always provide both `title` and `description`. A title-only toast still announces, but the description carries the actionable detail screen-reader users will want.

### Keyboard

```json keyboard
[
  {
    "keys": ["F6"],
    "description": "Cycles focus into the toast viewport from anywhere on the page."
  },
  {
    "keys": ["Tab"],
    "description": "Moves through the close button and (when present) the action button on the focused toast."
  },
  { "keys": ["Escape"], "description": "Dismisses the focused toast." },
  {
    "keys": ["Enter", "Space"],
    "description": "Activates the focused toast's action or close button."
  }
]
```
