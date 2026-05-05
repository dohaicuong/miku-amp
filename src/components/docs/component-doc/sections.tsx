// Special-cased H2 sections: an `## Examples` section becomes an accordion of
// its `### sub-headings`; a `## Props` section renders each `### sub-heading`
// as its own block (e.g. one sub-component per `Compound.Sub`).

import { useMemo } from "react";
import { Accordion } from "@/components/primitives/accordion";
import { RenderBody } from "./render";
import { splitByHeading, type DocScope, type DocSection } from "./parse";

export function ExamplesSection({ section, scope }: { section: DocSection; scope: DocScope }) {
  const { intro, items } = useMemo(() => splitByHeading(section.body, 3), [section.body]);
  const firstId = items[0]?.id;

  return (
    <section id={section.id} className="flex flex-col gap-4 scroll-mt-12">
      <h2 className="text-style-heading-2 text-fg">{section.heading}</h2>
      {intro ? <RenderBody body={intro} scope={scope} /> : null}
      <Accordion defaultValue={firstId ? [firstId] : []}>
        {items.map((item) => (
          <Accordion.Item key={item.id} value={item.id} id={item.id} className="scroll-mt-12">
            <Accordion.Header>
              <Accordion.Trigger>{item.heading}</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel>
              <RenderBody body={item.body} scope={scope} />
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </section>
  );
}

export function PropsSection({ section, scope }: { section: DocSection; scope: DocScope }) {
  const { intro, items } = useMemo(() => splitByHeading(section.body, 3), [section.body]);

  return (
    <section id={section.id} className="flex flex-col gap-8 scroll-mt-12">
      <h2 className="text-style-heading-2 text-fg">{section.heading}</h2>
      {intro ? <RenderBody body={intro} scope={scope} /> : null}
      {items.map((item) => (
        <div key={item.id} id={item.id} className="flex flex-col gap-3 scroll-mt-12">
          <h3 className="text-style-heading-3 text-fg">{item.heading}</h3>
          <RenderBody body={item.body} scope={scope} />
        </div>
      ))}
    </section>
  );
}
