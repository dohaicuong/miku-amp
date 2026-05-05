import { createFileRoute } from "@tanstack/react-router";
import { ComponentDoc } from "@/components/docs/component-doc";
import { docPool } from "./-doc-registry";

export const Route = createFileRoute("/components/")({
  component: ComponentsOverview,
});

function ComponentsOverview() {
  return <ComponentDoc path="design-system/overview.md" scope={docPool} />;
}
