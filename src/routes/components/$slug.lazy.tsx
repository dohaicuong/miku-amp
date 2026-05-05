import { createLazyFileRoute, useParams } from "@tanstack/react-router";
import { ComponentDoc } from "@/components/docs/component-doc";
import { docPool } from "./-doc-registry";

export const Route = createLazyFileRoute("/components/$slug")({
  component: ComponentDocPage,
});

function ComponentDocPage() {
  const { slug } = useParams({ from: "/components/$slug" });
  return <ComponentDoc path={`design-system/components/${slug}.md`} scope={docPool} />;
}
