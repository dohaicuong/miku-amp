# miku-amp

A local-library music player tuned for the HiBy Digital M500 (Miku edition). Dark, OLED-friendly, single accent for interaction, single highlight for state.

## Two-accent model

A music player runs two cognitive layers at once — _what you can interact with_ and _what's currently playing_. Most apps collapse these into one accent. The M500's chassis itself separates them: the body is cyan (the brand identity), and the buttons are pink (the actuators). The design system follows the same split.

- **Cyan accent** — the interaction layer. Focus rings, primary buttons, links, slider thumbs, active nav-tabs. Reads as "where you are / what you're touching".
- **Pink highlight** — the state layer. Currently-playing rows, music-note glyphs, mini-player progress fill, "now playing" eyebrow. Reads as "this is the song right now".

A track list can show both at once without conflict: the hovered row tints cyan, the playing row tints pink. They never compete because they signal different things.

## Tokens

The full token list lives at [Color](/components/color); typography is at [Typography](/components/typography).
