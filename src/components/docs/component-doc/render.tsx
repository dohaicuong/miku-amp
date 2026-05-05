// Markdown body rendering: walks each block emitted by `splitFences` and
// hands it to either `<MarkdownProse>` (for prose) or `<FenceBlock>` (for
// code fences and the typed JSON tables).

import ReactMarkdown, { type Components } from "react-markdown";
import { Code } from "@/components/primitives/code";
import { LiveExample } from "./live";
import {
  DataAttributesTable,
  KeyboardTable,
  PropsTable,
  type DataAttrRow,
  type KeyRow,
  type PropRow,
} from "./tables";
import { parseJson, slugify, splitFences, type Block, type DocScope } from "./parse";

function flattenText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as { value?: string; children?: unknown[] };
  if (typeof n.value === "string") return n.value;
  if (Array.isArray(n.children)) return n.children.map(flattenText).join("");
  return "";
}

const proseComponents: Components = {
  h1: ({ children }) => <h1 className="text-style-heading-1 text-fg">{children}</h1>,
  h3: ({ children, node }) => {
    const id = node ? slugify(flattenText(node)) : undefined;
    return (
      <h3 id={id} className="text-style-eyebrow text-fg-muted scroll-mt-12 mt-2">
        {children}
      </h3>
    );
  },
  h4: ({ children, node }) => {
    const id = node ? slugify(flattenText(node)) : undefined;
    return (
      <h4 id={id} className="text-style-heading-3 text-fg scroll-mt-12 mt-2">
        {children}
      </h4>
    );
  },
  p: ({ children }) => <p className="text-style-body text-fg-muted">{children}</p>,
  ul: ({ children }) => (
    <ul className="text-style-body text-fg-muted flex flex-col gap-2 list-disc pl-5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="text-style-body text-fg-muted flex flex-col gap-2 list-decimal pl-5">
      {children}
    </ol>
  ),
  li: ({ children }) => <li>{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="text-style-lead text-fg-muted">{children}</blockquote>
  ),
  strong: ({ children }) => <strong className="font-medium text-fg">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  code: ({ className, children }) => {
    // Fenced code blocks are pre-extracted by splitFences before react-markdown
    // sees the content, so this branch only runs for inline-code spans.
    if (className?.includes("language-")) {
      const text = typeof children === "string" ? children.replace(/\n$/, "") : "";
      return <Code block>{text}</Code>;
    }
    return <Code>{children}</Code>;
  },
};

const headerProseComponents: Components = {
  ...proseComponents,
  // The first paragraph in the header reads as the page lead.
  p: ({ children }) => <p className="text-style-lead text-fg-muted">{children}</p>,
};

function MarkdownProse({ children, headerLead }: { children: string; headerLead?: boolean }) {
  return (
    <ReactMarkdown components={headerLead ? headerProseComponents : proseComponents}>
      {children}
    </ReactMarkdown>
  );
}

export function RenderBody({
  body,
  scope,
  headerLead,
}: {
  body: string;
  scope: DocScope;
  headerLead?: boolean;
}) {
  const blocks = splitFences(body);
  return (
    <div className="flex flex-col gap-4">
      {blocks.map((block, i) => {
        if (block.kind === "markdown") {
          if (!block.text.trim()) return null;
          return (
            <MarkdownProse key={i} headerLead={headerLead}>
              {block.text}
            </MarkdownProse>
          );
        }
        return <FenceBlock key={i} block={block} scope={scope} />;
      })}
    </div>
  );
}

function FenceBlock({
  block,
  scope,
}: {
  block: Extract<Block, { kind: "fence" }>;
  scope: DocScope;
}) {
  const { lang, meta, code } = block;
  const metaTokens = meta.split(/\s+/).filter(Boolean);

  if (metaTokens.includes("preview")) {
    return <LiveExample code={code} scope={scope} />;
  }

  if (lang === "json" && meta === "props") {
    return <PropsTable rows={parseJson(code) as PropRow[]} />;
  }
  if (lang === "json" && meta === "keyboard") {
    return <KeyboardTable rows={parseJson(code) as KeyRow[]} />;
  }
  if (lang === "json" && meta === "data-attributes") {
    return <DataAttributesTable rows={parseJson(code) as DataAttrRow[]} />;
  }

  return <Code block>{code}</Code>;
}
