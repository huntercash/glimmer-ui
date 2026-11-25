import type { Metadata } from "next";
import Link from "next/link";
import { Preview } from "@/components/Preview";
import { byCategory, entries } from "@/lib/registry";

export const metadata: Metadata = { title: "Components", description: "Every Glimmer component, shown live and grouped by what it is for." };

/** One row per component: its name, what it is for, and its first example running live. */
export default function ComponentsPage() {
  return (
    <div className="stack-y gap-14">
      <div className="prose">
        <h1>Components</h1>
        <p>
          {entries.length} components, each shown live. Open one for its classes, more examples and the code. Want every example at once?{" "}
          <Link className="link" href="/components/all">
            See them all on one page →
          </Link>
        </p>
      </div>
      {byCategory.map(({ category, entries }) => (
        <section key={category} className="stack-y gap-10" aria-labelledby={`cat-${category}`}>
          <h2 id={`cat-${category}`} className="meta border-b border-[var(--gl-border)] pb-2">
            {category}
          </h2>
          {entries.map((entry) => {
            const [example] = entry.examples;
            const more = entry.examples.length - 1;
            return (
              <div key={entry.slug} id={entry.slug} className="stack-y gap-3 scroll-mt-24">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="text-xl font-semibold">
                    <Link className="no-underline hover:underline" href={`/components/${entry.slug}`}>
                      {entry.name}
                    </Link>
                  </h3>
                  <Link className="link text-sm" href={`/components/${entry.slug}`}>
                    {more > 0 ? `Code and ${more} more example${more > 1 ? "s" : ""} →` : "Code →"}
                  </Link>
                </div>
                <p className="text-muted">{entry.blurb}</p>
                {example && (
                  <div className="[&>.preview]:rounded-[var(--gl-radius-lg)] [&>.preview]:border-b">
                    <Preview example={example} />
                  </div>
                )}
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
