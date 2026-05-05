```scope
EmptyState
Button
FolderOpenIcon
WarningIcon
MagnifyingGlassIcon
MusicNotesIcon
```

# Empty State

Centred placeholder for first-run, empty-library, no-results, and recoverable-error surfaces. Hero glyph at the top, headline, supporting copy, optional call-to-action button. Drop into any scroll container — the component fills the space it's given and centres its column inside that.

Two variants: `neutral` (the default — "you haven't done X yet") and `error` (recoverable failure — permission revoked, scan failed). The variant only changes the icon tint; the layout stays the same.

```tsx preview
<div className="border border-border rounded-md h-[420px]">
  <EmptyState
    icon={<FolderOpenIcon />}
    title="No library yet"
    description="Pick a folder of music files to scan. Your library lives entirely on this device — nothing is uploaded."
    action={<Button>Pick folder</Button>}
  />
</div>
```

## Examples

### First-run — pick a folder

The first thing the user sees on a clean install. Neutral variant; CTA is the primary affordance for the screen.

```tsx preview
<div className="border border-border rounded-md h-[420px]">
  <EmptyState
    icon={<FolderOpenIcon />}
    title="No library yet"
    description="Pick a folder of music files to scan. Your library lives entirely on this device — nothing is uploaded."
    action={<Button>Pick folder</Button>}
  />
</div>
```

### Permission revoked — error variant

When Android revokes the directory handle between launches, surface this with the `error` variant so the icon reads pink (the design system's recoverable-error tone). The CTA reconnects the same handle rather than re-picking, so the existing library survives.

```tsx preview
<div className="border border-border rounded-md h-[420px]">
  <EmptyState
    variant="error"
    icon={<WarningIcon />}
    title="Library disconnected"
    description="The folder permission was revoked. Reconnect to keep your library — your data stays intact."
    action={<Button>Reconnect</Button>}
  />
</div>
```

### Search — no results

No-icon variant for inline use inside a search-results panel. The headline + description carry the message; no CTA since the recovery is "type something else".

```tsx preview
<div className="border border-border rounded-md h-[320px]">
  <EmptyState
    icon={<MagnifyingGlassIcon />}
    title="No matches"
    description={
      <>
        Nothing matched <span className="text-fg">“miku world”</span>. Try a shorter query or a
        different field.
      </>
    }
  />
</div>
```

### Empty playlist

A title-only empty state when the icon is overkill and the surface already has its own context (e.g. inside a playlist that's clearly a playlist).

```tsx preview
<div className="border border-border rounded-md h-[280px]">
  <EmptyState
    title="This playlist is empty"
    description="Add tracks from the library to start curating."
    action={<Button variant="ghost">Browse library</Button>}
  />
</div>
```

### Inside a scrolling list shell

Drop the EmptyState anywhere `h-full` makes sense — it stretches to fill and centres inside. Here it sits where a track list normally would, so the layout doesn't shift when results arrive.

```tsx preview
<div className="border border-border rounded-md w-[360px] h-[480px] flex flex-col">
  <header className="border-b border-border px-4 py-3">
    <span className="text-style-eyebrow text-fg-muted">Library</span>
    <h1 className="text-style-heading-3 text-fg">Tracks</h1>
  </header>
  <div className="flex-1 min-h-0">
    <EmptyState
      icon={<MusicNotesIcon />}
      title="No tracks yet"
      description="Pick a folder to start scanning."
      action={<Button size="sm">Pick folder</Button>}
    />
  </div>
</div>
```

## Props

```json props
[
  {
    "prop": "icon",
    "type": "ReactElement",
    "default": "—",
    "description": "Hero glyph at the top. Cloned with `size={44}` so the visual scale stays consistent across surfaces. Omit for icon-less variants."
  },
  {
    "prop": "title",
    "type": "string",
    "default": "—",
    "description": "Headline. Rendered as `text-style-heading-3` — short and declarative reads best (e.g. \"No library yet\", not \"You don't have a library yet\")."
  },
  {
    "prop": "description",
    "type": "ReactNode",
    "default": "—",
    "description": "Supporting copy. Plain string for the common case; ReactNode lets you inline an emphasis span or a help link without dropping out of the component."
  },
  {
    "prop": "action",
    "type": "ReactNode",
    "default": "—",
    "description": "Optional call-to-action — typically a `Button`. Sits below the description with a small gap. Omit when the recovery is implicit (search no-results)."
  },
  {
    "prop": "variant",
    "type": "\"neutral\" | \"error\"",
    "default": "\"neutral\"",
    "description": "`neutral` tints the icon `text-fg-subtle`. `error` tints it with the pink `text-highlight` and adds `role=\"alert\"` to the wrapper so the message is announced when it appears."
  },
  {
    "prop": "className",
    "type": "string",
    "default": "—",
    "description": "Merged onto the outer flex column. Use for layout overrides (different padding, max-width, etc.)."
  }
]
```

## Accessibility

- `error` variant adds `role="alert"` to the wrapper so assistive tech announces the message when the component mounts (e.g. after a permission revocation surfaces a fresh empty state).
- The decorative hero icon is `aria-hidden`; the title and description carry the meaning.
- `title` renders as an `<h3>` so it slots into the page heading outline naturally — pair with the page `<h1>`/`<h2>` for a coherent hierarchy.
- The action area accepts any node, so focus management (autoFocus on the primary button after a recoverable error, for instance) is the caller's call.
