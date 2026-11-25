import type { Metadata } from "next";
import Link from "next/link";
import { Preview } from "@/components/Preview";
import { byCategory } from "@/lib/registry";

export const metadata: Metadata = { title: "Every example", description: "All Glimmer examples on one page, for a quick visual check." };

/** Every example on one page. Handy for eyeballing the whole kit after a change. */
export default function AllExamplesPage() {
  return (
    <div className="stack-y gap-12">
      <div className="prose">
        <h1>Every example</h1>
        <p>All of the kit on one page. Click a name for its code.</p>
      </div>
      {byCategory.map(({ category, entries }) => (
        <section key={category} className="stack-y gap-6">
          <h2 className="meta">{category}</h2>
          {entries.map((entry) => (
            <div key={entry.slug} className="stack-y gap-2" id={entry.slug}>
              <Link className="link w-fit" href={`/components/${entry.slug}`}>
                {entry.name}
              </Link>
              {entry.examples.map((example) => (
                <div key={example.title} className="[&>.preview]:rounded-[var(--gl-radius-lg)] [&>.preview]:border-b">
                  <Preview example={example} />
                </div>
              ))}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
