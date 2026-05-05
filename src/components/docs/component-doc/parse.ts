// Pure markdown structure parsing — no JSX, no React. Splits the doc by code
// fences, extracts the scope directive, walks heading levels for sections and
// the table of contents.

// The full pool of identifiers a `tsx preview` block is allowed to reference.
// Each markdown picks a subset via a leading ```scope ... ``` fence; the
// renderer narrows the pool to that subset before passing it to react-live.
export type DocScope = Record<string, unknown>;

export type DocSection = { id: string; heading: string; body: string };

export type Block =
  | { kind: "markdown"; text: string }
  | { kind: "fence"; lang: string; meta: string; code: string };

export type TocItem = { id: string; label: string; level: 2 | 3 };

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Pulls the first ```scope ... ``` fence out of the markdown. Lines inside are
// bare identifier names; blank lines and `// comments` are ignored. Returns
// null `names` if no block is present (renderer falls back to the full pool).
export function extractScopeBlock(md: string): { names: string[] | null; cleaned: string } {
  const re = /^```scope[^\n]*\n([\s\S]*?)^```[ \t]*\n?/m;
  const m = re.exec(md);
  if (!m) return { names: null, cleaned: md };
  const names = (m[1] ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("//"));
  const cleaned = md.slice(0, m.index) + md.slice(m.index + m[0].length);
  return { names, cleaned: cleaned.replace(/^\s+/, "") };
}

export function narrowScope(pool: DocScope, names: string[] | null): DocScope {
  if (!names) return pool;
  const out: DocScope = {};
  for (const name of names) {
    if (name in pool) {
      out[name] = pool[name];
    } else if (typeof console !== "undefined") {
      console.warn(`[ComponentDoc] scope identifier "${name}" not found in pool`);
    }
  }
  return out;
}

// Splits markdown text by code fences. Tracks a single-state "in fence" flag
// so headings inside fences don't trigger heading-based section splitting.
export function splitFences(text: string): Block[] {
  const lines = text.split("\n");
  const blocks: Block[] = [];
  let buffer: string[] = [];
  let fence: { lang: string; meta: string; lines: string[] } | null = null;

  const flushMarkdown = () => {
    if (buffer.length === 0) return;
    blocks.push({ kind: "markdown", text: buffer.join("\n") });
    buffer = [];
  };

  for (const line of lines) {
    if (fence) {
      if (line.trim().startsWith("```")) {
        blocks.push({
          kind: "fence",
          lang: fence.lang,
          meta: fence.meta,
          code: fence.lines.join("\n"),
        });
        fence = null;
      } else {
        fence.lines.push(line);
      }
    } else {
      const m = /^```(\w*)\s*(.*)$/.exec(line);
      if (m) {
        flushMarkdown();
        fence = { lang: m[1] ?? "", meta: (m[2] ?? "").trim(), lines: [] };
      } else {
        buffer.push(line);
      }
    }
  }
  flushMarkdown();
  return blocks;
}

// Splits markdown by ATX heading at the given level. Returns the intro
// (everything before the first matching heading) plus one entry per heading.
// Fence-aware so fenced "## ..." lines aren't treated as headings.
export function splitByHeading(text: string, level: 2 | 3) {
  const prefix = "#".repeat(level) + " ";
  const lines = text.split("\n");
  const items: DocSection[] = [];
  const introLines: string[] = [];
  let currentLines: string[] | null = null;
  let currentHeading = "";
  let inFence = false;

  for (const line of lines) {
    if (line.trim().startsWith("```")) inFence = !inFence;
    if (!inFence && line.startsWith(prefix)) {
      if (currentLines !== null) {
        items.push({
          id: slugify(currentHeading),
          heading: currentHeading,
          body: currentLines.join("\n").trim(),
        });
      }
      currentHeading = line.slice(prefix.length).trim();
      currentLines = [];
    } else if (currentLines === null) {
      introLines.push(line);
    } else {
      currentLines.push(line);
    }
  }
  if (currentLines !== null) {
    items.push({
      id: slugify(currentHeading),
      heading: currentHeading,
      body: currentLines.join("\n").trim(),
    });
  }
  return { intro: introLines.join("\n").trim(), items };
}

export function splitDocument(md: string) {
  const { intro, items } = splitByHeading(md, 2);
  return { header: intro, sections: items };
}

export function buildToc(md: string): TocItem[] {
  const items: TocItem[] = [];
  let inFence = false;
  for (const line of md.split("\n")) {
    if (line.trim().startsWith("```")) inFence = !inFence;
    if (inFence) continue;
    if (line.startsWith("## ")) {
      const heading = line.slice(3).trim();
      items.push({ id: slugify(heading), label: heading, level: 2 });
    } else if (line.startsWith("### ")) {
      const heading = line.slice(4).trim();
      items.push({ id: slugify(heading), label: heading, level: 3 });
    }
  }
  return items;
}

export function parseJson(code: string): unknown {
  try {
    return JSON.parse(code);
  } catch {
    return [];
  }
}
