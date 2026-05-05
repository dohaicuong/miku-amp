// Wraps a `tsx preview` fence in react-live's compile-and-render pipeline.
// Two preview shapes are supported:
//   1. Plain JSX — `<Foo/>` or `<><Foo/><Bar/></>`. Wrapped in a fragment so
//      multiple sibling elements can share one fence.
//   2. Function-component — `() => { … return <Foo/>; }` or `function() {…}`.
//      Mounted as a component so the body can host hooks (useState, useToast).
// Doc-specific identifiers come via `scope`; common React hooks are merged in
// at this layer so previews don't have to list them in their scope fence.

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";
import { Code } from "@/components/primitives/code";
import type { DocScope } from "./parse";

const liveHooks = { useState, useEffect, useMemo, useRef, useCallback };

export function LiveExample({ code, scope }: { code: string; scope: DocScope }) {
  const liveScope = useMemo(() => ({ ...liveHooks, ...scope }), [scope]);
  return (
    <LiveProvider code={code} scope={liveScope} transformCode={wrapPreviewCode}>
      <div className="flex flex-col gap-3">
        <Preview>
          <LivePreview className="flex flex-wrap items-center gap-3" />
        </Preview>
        <Code block>{code}</Code>
        <LiveError className="text-sm font-mono text-highlight whitespace-pre-wrap" />
      </div>
    </LiveProvider>
  );
}

function wrapPreviewCode(code: string): string {
  const head = code.trimStart();
  // Arrow function (`(args) => …` or `name =>`) or `function …` — mount the
  // expression as a component so its body can host hooks. The IIFE keeps the
  // preview a single expression for react-live's inline mode.
  const isFunctionExpression =
    /^function\b/.test(head) || /^(?:\(.*?\)|[A-Za-z_$][\w$]*)\s*=>/.test(head);
  if (isFunctionExpression) {
    return `(() => { const __Preview = ${code}; return <__Preview />; })()`;
  }
  return `<>${code}</>`;
}

function Preview({ children }: { children: ReactNode }) {
  return <div className="border border-border rounded-sm p-6 bg-bg">{children}</div>;
}
