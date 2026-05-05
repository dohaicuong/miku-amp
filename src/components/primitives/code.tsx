import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type CodeProps = ComponentProps<"code"> & {
  // Render as a multi-line block (wrapped in <pre>) instead of inline.
  block?: boolean;
};

const inlineCls = [
  "font-mono text-[0.875em] leading-tight",
  "rounded-sm border border-border bg-surface",
  "px-1.5 py-0.5",
  "text-fg",
].join(" ");

const blockShellCls = "rounded-sm border border-border bg-surface overflow-x-auto scroll-style";
const blockPreCls = "font-mono text-sm leading-relaxed px-4 py-4 text-fg";

export function Code({ block, className, children, ...props }: CodeProps) {
  if (block) {
    return (
      <div className={cn(blockShellCls, className)}>
        <pre className={blockPreCls}>
          <code {...props}>{children}</code>
        </pre>
      </div>
    );
  }
  return (
    <code className={cn(inlineCls, className)} {...props}>
      {children}
    </code>
  );
}
