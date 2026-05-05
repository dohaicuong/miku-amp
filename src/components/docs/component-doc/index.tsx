// Public entry point for the component-doc renderer. Fetches the markdown at
// the given path, narrows the doc-pool scope per the file's leading
// ```scope ...``` fence, then walks the document: header → sections, with
// the Examples and Props sections rendered with their own typed layouts.

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import {
  buildToc,
  extractScopeBlock,
  narrowScope,
  splitDocument,
  type DocScope,
  type TocItem,
} from "./parse";
import { RenderBody } from "./render";
import { ExamplesSection, PropsSection } from "./sections";

export type { DocScope } from "./parse";

type ComponentDocProps = {
  // Path under `public/` to the markdown source. e.g. "design-system/components/color.md"
  path: string;
  scope: DocScope;
};

export function ComponentDoc({ path, scope }: ComponentDocProps) {
  const markdown = useMarkdown(path);
  if (markdown === null) return null;
  return <ComponentDocBody markdown={markdown} scope={scope} />;
}

function ComponentDocBody({ markdown, scope }: { markdown: string; scope: DocScope }) {
  // Pull the ```scope ... ``` directive out of the markdown so it doesn't
  // render as a code block; what's left is what we parse and display.
  const { names, cleaned } = useMemo(() => extractScopeBlock(markdown), [markdown]);
  const liveScope = useMemo<DocScope>(() => narrowScope(scope, names), [scope, names]);

  const { header, sections } = useMemo(() => splitDocument(cleaned), [cleaned]);
  const tocItems = useMemo(() => buildToc(cleaned), [cleaned]);

  return (
    <div className="flex items-start gap-12">
      <article className="flex-1 min-w-0 flex flex-col gap-14">
        {header ? (
          <header className="flex flex-col gap-4">
            <RenderBody body={header} scope={liveScope} headerLead />
          </header>
        ) : null}
        {sections.map((section) => {
          const key = section.heading.toLowerCase();
          if (key === "examples") {
            return <ExamplesSection key={section.id} section={section} scope={liveScope} />;
          }
          if (key === "props") {
            return <PropsSection key={section.id} section={section} scope={liveScope} />;
          }
          return (
            <section key={section.id} id={section.id} className="flex flex-col gap-4 scroll-mt-12">
              <h2 className="text-style-heading-2 text-fg">{section.heading}</h2>
              <RenderBody body={section.body} scope={liveScope} />
            </section>
          );
        })}
      </article>
      <Toc items={tocItems} />
    </div>
  );
}

function useMarkdown(path: string) {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    const url = `${import.meta.env.BASE_URL}${path}`;
    fetch(url)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`${r.status} ${url}`))))
      .then((t) => {
        if (!cancelled) setText(t);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error("Failed to load component doc:", err);
        setText("# Failed to load\n\nThe documentation source could not be fetched.");
      });
    return () => {
      cancelled = true;
    };
  }, [path]);
  return text;
}

function Toc({ items }: { items: TocItem[] }) {
  return (
    <nav
      aria-label="On this page"
      className="hidden lg:flex w-48 shrink-0 sticky top-12 self-start flex-col gap-1"
    >
      <span className="text-style-eyebrow text-fg-muted mb-2">On this page</span>
      {items.map((it) => (
        <a
          key={it.id}
          href={`#${it.id}`}
          className={cn(
            "text-sm text-fg-muted hover:text-fg transition-colors py-0.5",
            "outline-accent outline-offset-2 focus-visible:outline-2 rounded-sm",
            it.level === 3 && "pl-3",
          )}
        >
          {it.label}
        </a>
      ))}
    </nav>
  );
}
