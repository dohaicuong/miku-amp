```scope
LandingScreen
```

# Landing Screen

First-launch surface — the user lands here, the app explains why it's asking for access to a folder of audio, a single primary CTA opens the OS directory picker. Pure presentational; the picker logic lives in `useLibraryPicker` (`@/lib/library-picker`) and is wired in at the route level. Designed for the M500's portrait viewport but holds up unchanged in a wide container.

```tsx preview
() => {
  const [picking, setPicking] = useState(false);
  return (
    <div className="border border-border rounded-md overflow-hidden mx-auto w-[360px] h-[640px]">
      <LandingScreen
        onPickFolder={() => {
          setPicking(true);
          setTimeout(() => setPicking(false), 1000);
        }}
        picking={picking}
        supported
      />
    </div>
  );
};
```

## Examples

### Picking state

`picking` flips while the OS dialog is open. The CTA disables and switches its label so a double-tap doesn't reopen the picker.

```tsx preview
<div className="border border-border rounded-md overflow-hidden mx-auto w-[360px] h-[640px]">
  <LandingScreen onPickFolder={() => {}} picking supported />
</div>
```

### Error state

Failures land in `error` and render below the CTA in `text-highlight` (pink) — the "needs attention" tone in the design system. `AbortError` (the user dismissing the picker) is filtered out by the hook before reaching the prop, so this only fires on real failures (permission denied, security error).

```tsx preview
<div className="border border-border rounded-md overflow-hidden mx-auto w-[360px] h-[640px]">
  <LandingScreen
    onPickFolder={() => {}}
    error="Permission to read the folder was denied."
    supported
  />
</div>
```

### Unsupported browser

When the host lacks `window.showDirectoryPicker` (Safari, iOS, older Chromiums), the CTA is replaced by a fallback notice that names the supported browsers. Avoids a dead button + a confusing silent no-op.

```tsx preview
<div className="border border-border rounded-md overflow-hidden mx-auto w-[360px] h-[640px]">
  <LandingScreen onPickFolder={() => {}} supported={false} />
</div>
```

## Props

### LandingScreen

```json props
[
  {
    "prop": "onPickFolder",
    "type": "() => void",
    "default": "—",
    "description": "Required. Fires when the user taps the primary CTA. Caller drives the actual `showDirectoryPicker` call (see `useLibraryPicker`); LandingScreen itself is presentational."
  },
  {
    "prop": "picking",
    "type": "boolean",
    "default": "false",
    "description": "Disables the CTA and swaps its label to \"Choosing folder…\" while the OS dialog is open. Wire to the picker hook's `picking` flag."
  },
  {
    "prop": "supported",
    "type": "boolean",
    "default": "true",
    "description": "When false, hides the CTA and renders an \"unsupported browser\" notice naming Chrome / Edge / Brave as supported routes. Wire to the picker hook's `supported` flag."
  },
  {
    "prop": "error",
    "type": "string | null",
    "default": "—",
    "description": "Last failure message. Renders below the CTA in `text-highlight` with `role=\"alert\"`. The picker hook filters AbortError (user-cancelled) before this prop, so the error state only fires on real failures."
  },
  {
    "prop": "className",
    "type": "string",
    "default": "—",
    "description": "Merged onto the root container. The component's default `min-h-dvh` lets it own the viewport at the route level; override (e.g. with a fixed height) when mounting inside a constrained frame."
  }
]
```

### useLibraryPicker

```json props
[
  {
    "prop": "supported",
    "type": "boolean",
    "default": "—",
    "description": "True iff `window.showDirectoryPicker` exists. False on Safari, iOS, older Chromiums."
  },
  {
    "prop": "picking",
    "type": "boolean",
    "default": "—",
    "description": "True while the OS dialog is open. Pair with `LandingScreen`'s `picking` prop."
  },
  {
    "prop": "error",
    "type": "string | null",
    "default": "—",
    "description": "Last failure message, or null. Cleared at the start of each `pick()`. AbortError (user-cancelled) is treated as a non-error and does not land here."
  },
  {
    "prop": "pick",
    "type": "() => Promise<FileSystemDirectoryHandle | null>",
    "default": "—",
    "description": "Opens the picker. Resolves to the chosen directory handle on success, or null when the user cancelled / the API is unsupported / a real error occurred (the latter two also populate `error`)."
  }
]
```

## Accessibility

- The single `<h1>` carries the app name and is the natural landmark for screen readers landing on the page.
- The icon is `alt=""` + `aria-hidden` — purely decorative; the heading next to it carries the meaning.
- `aria-busy={picking}` on the CTA announces the loading state without needing a live region.
- The error block uses `role="alert"` so a permission failure is announced when it appears.
- The unsupported-browser fallback names the supported alternatives so the user can act on it; a silent missing button would leave them stuck.
