import type { Metadata } from "next";
import Link from "next/link";
import { byCategory, entries } from "@/lib/registry";

export const metadata: Metadata = { title: "Components", description: "Every Glimmer component, grouped by what it is for." };

export default function ComponentsPage() {
  return (
    <div className="stack-y gap-10">
      <div className="prose">
        <h1>Components</h1>
        <p>{entries.length} components. Each page has live examples, the code for them, and the SwiftUI equivalent where there is one.</p>
        <p>
          <Link className="link" href="/components/all">
            See every example on one page →
          </Link>
        </p>
      </div>
      {byCategory.map(({ category, entries }) => (
        <section key={category} className="grid gap-4">
          <h2 className="meta">{category}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
              <Link key={entry.slug} href={`/components/${entry.slug}`} className="card glow no-underline">
                <span className="card-title">{entry.name}</span>
                <span className="text-sm text-muted">{entry.blurb}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
