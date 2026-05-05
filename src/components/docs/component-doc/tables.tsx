// Typed tables rendered from JSON-bodied fences in component docs:
//   ```json props```         → PropsTable
//   ```json keyboard```      → KeyboardTable
//   ```json data-attributes```→ DataAttributesTable

import type { ReactNode } from "react";
import { Code } from "@/components/primitives/code";
import { cn } from "@/lib/cn";

export type PropRow = { prop: string; type: string; default: string; description: string };
export type DataAttrRow = { attribute: string; description: string };
export type KeyRow = { keys: string[]; description: string };

export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <div className="overflow-x-auto rounded-sm border border-border">
      <table className="w-full border-collapse text-style-body text-fg">
        <thead>
          <tr className="border-b border-border bg-surface">
            <Th>Prop</Th>
            <Th>Type</Th>
            <Th>Default</Th>
            <Th>Description</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.prop} className="border-b border-border last:border-b-0 align-top">
              <td className="px-4 py-3">
                <Code>{r.prop}</Code>
              </td>
              <td className="px-4 py-3">
                <Code>{r.type}</Code>
              </td>
              <td className="px-4 py-3">
                {r.default && r.default !== "—" ? (
                  <Code>{r.default}</Code>
                ) : (
                  <span className="text-fg-muted">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-fg-muted">{r.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DataAttributesTable({ rows }: { rows: DataAttrRow[] }) {
  return (
    <div className="overflow-x-auto rounded-sm border border-border">
      <table className="w-full border-collapse text-style-body text-fg">
        <thead>
          <tr className="border-b border-border bg-surface">
            <Th className="w-60">Attribute</Th>
            <Th>Description</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.attribute} className="border-b border-border last:border-b-0 align-top">
              <td className="px-4 py-3">
                <Code>{r.attribute}</Code>
              </td>
              <td className="px-4 py-3 text-fg-muted">{r.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function KeyboardTable({ rows }: { rows: KeyRow[] }) {
  return (
    <div className="overflow-x-auto rounded-sm border border-border">
      <table className="w-full border-collapse text-style-body text-fg">
        <thead>
          <tr className="border-b border-border bg-surface">
            <Th className="w-40">Keys</Th>
            <Th>Description</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.keys.join("+")} className="border-b border-border last:border-b-0 align-top">
              <td className="px-4 py-3">
                <span className="flex flex-wrap gap-1">
                  {r.keys.map((k) => (
                    <kbd
                      key={k}
                      className="inline-flex items-center justify-center font-mono text-xs px-2 py-0.5 rounded-sm border border-border bg-surface text-fg"
                    >
                      {k}
                    </kbd>
                  ))}
                </span>
              </td>
              <td className="px-4 py-3 text-fg-muted">{r.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th
      className={cn("text-style-eyebrow text-fg-muted text-left px-4 py-2 font-normal", className)}
    >
      {children}
    </th>
  );
}
