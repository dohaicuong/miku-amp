```scope
VolumeView
```

# Volume View

Full-panel control surface for master volume + stereo balance. Mirrors `LyricView`'s shape — header strip on top, body fills the remainder — so the two cohabit cleanly when both surface as drawers from `FullPlayer`'s action row. Two big knobs instead of horizontal sliders to suit a thumb-driven DAP and to read as a deliberate audiophile control rather than a generic media-player HUD.

```tsx preview
() => {
  const [volume, setVolume] = useState(45);
  const [balance, setBalance] = useState(0);
  return (
    <div className="border border-border rounded-md overflow-hidden mx-auto w-[360px] h-[420px]">
      <VolumeView
        volume={volume}
        onVolumeChange={setVolume}
        balance={balance}
        onBalanceChange={setBalance}
      />
    </div>
  );
};
```

## Examples

### Default centred

Both knobs sit at their resting positions — volume at the caller's last value, balance dead-centre (`0`). The balance knob is bipolar (fill grows outward from centre), so a centred reading shows no fill arc.

```tsx preview
() => {
  const [volume, setVolume] = useState(60);
  const [balance, setBalance] = useState(0);
  return (
    <div className="border border-border rounded-md overflow-hidden mx-auto w-[360px] h-[420px]">
      <VolumeView
        volume={volume}
        onVolumeChange={setVolume}
        balance={balance}
        onBalanceChange={setBalance}
      />
    </div>
  );
};
```

### Off-centre balance

Drag the balance knob left for `L<n>`, right for `R<n>`, centre snaps to `C`. Same handle behaviour as any bipolar knob — drag, scroll, arrow-key, or double-tap to reset.

```tsx preview
() => {
  const [volume, setVolume] = useState(75);
  const [balance, setBalance] = useState(-35);
  return (
    <div className="border border-border rounded-md overflow-hidden mx-auto w-[360px] h-[420px]">
      <VolumeView
        volume={volume}
        onVolumeChange={setVolume}
        balance={balance}
        onBalanceChange={setBalance}
      />
    </div>
  );
};
```

## Props

### VolumeView

```json props
[
  {
    "prop": "volume",
    "type": "number",
    "default": "—",
    "description": "Master volume, 0–100. Controlled — the parent owns the state so the value survives the panel unmounting."
  },
  {
    "prop": "onVolumeChange",
    "type": "(value: number) => void",
    "default": "—",
    "description": "Fires on every drag tick of the volume knob (and on keyboard / wheel adjustments) so the host's audio output tracks the user's hand."
  },
  {
    "prop": "balance",
    "type": "number",
    "default": "—",
    "description": "Stereo balance, -100 to +100. Negative = left-biased, 0 = centred, positive = right-biased. Bipolar knob fill grows outward from centre."
  },
  {
    "prop": "onBalanceChange",
    "type": "(value: number) => void",
    "default": "—",
    "description": "Fires on every balance-knob drag tick. Pair with double-tap on the knob (built-in to the `Knob` primitive) for a quick reset to zero."
  },
  {
    "prop": "onClose",
    "type": "() => void",
    "default": "—",
    "description": "When provided, renders a close X in the header. Use when the panel is surfaced as the FullPlayer's wide-layout right column — the panel must ship its own close UI since FullPlayer doesn't render one. Drawer-based narrow surfaces typically omit this since the Drawer's backdrop / Esc already handles dismiss."
  },
  {
    "prop": "className",
    "type": "string",
    "default": "—",
    "description": "Merged onto the outer flex column. Use for layout overrides at the AppShell level (the panel itself fills its parent container by default)."
  }
]
```

## Accessibility

- Both knobs forward `aria-label` (`"Volume"`, `"Balance"`) to the underlying `Knob` primitive, which renders proper `role="slider"` semantics with min/max/value range so screen-reader users hear the position and can step with arrow keys.
- Knob primitive supports keyboard input (arrow keys for fine, page up/down for coarse) and double-tap-to-reset, which the bipolar Balance knob uses as a quick "back to centre" gesture.
- The header eyebrow (`"Volume"`) is visual; the knob labels (`"Volume"`, `"Balance"`) underneath each control carry the per-knob meaning for AT users — the eyebrow is decoration above already-labelled controls.
