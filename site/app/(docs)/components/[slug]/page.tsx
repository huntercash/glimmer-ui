import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CodeBox } from "@/components/CodeBox";
import { Preview } from "@/components/Preview";
import { tab } from "@/lib/highlight";
import { colorNames, entries, findEntry } from "@/lib/registry";

export function generateStaticParams() {
  return entries.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: PageProps<"/components/[slug]">): Promise<Metadata> {
  const entry = findEntry((await params).slug);
  return entry ? { title: entry.name, description: entry.blurb } : {};
}

const kindBadge: Record<string, string> = {
  component: "badge badge-primary",
  part: "badge badge-secondary",
  colour: "badge badge-success",
  state: "badge badge-warning",
};

/** The route's shell is shared by every component page, so the part that depends on the URL streams in behind a placeholder. */
export default function ComponentPage({ params }: PageProps<"/components/[slug]">) {
  return (
    <Suspense fallback={<Placeholder />}>
      <ComponentDoc params={params} />
    </Suspense>
  );
}

function Placeholder() {
  return (
    <div className="stack-y gap-6" role="status" aria-label="Loading">
      <div className="skeleton h-10 w-48" />
      <div className="skeleton h-5 w-2/3" />
      <div className="skeleton h-64" />
    </div>
  );
}

async function ComponentDoc({ params }: Pick<PageProps<"/components/[slug]">, "params">) {
  const { slug } = await params;
  const entry = findEntry(slug);
  if (!entry) notFound();

  const index = entries.indexOf(entry);
  const prev = entries[index - 1];
  const next = entries[index + 1];
  const rows: [string, string, string][] = [
    ...entry.classes,
    ...(entry.colors ? colorNames.map((c): [string, string, string] => [`${entry.colors}-${c}`, "colour", `Tints it with the ${c} colour`]) : []),
  ];

  return (
    <article className="stack-y gap-10">
      <header className="prose">
        <span className="meta">{entry.category}</span>
        <h1>{entry.name}</h1>
        <p className="text-lg">{entry.blurb}</p>
      </header>

      <section className="stack-y gap-3" aria-label="Classes">
        <div className="glass overflow-x-auto">
          <table className="table min-w-[36rem]">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>What it does</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([name, kind, note]) => (
                <tr key={name}>
                  <td>
                    <code className="inline-code whitespace-nowrap">{name}</code>
                  </td>
                  <td>
                    <span className={kindBadge[kind] ?? "badge"}>{kind}</span>
                  </td>
                  <td className="text-muted">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {entry.note && <p className="text-sm text-muted">{entry.note}</p>}
      </section>

      {entry.examples.map((example) => (
        <section key={example.title} className="stack-y gap-3">
          <h2 className="text-lg font-semibold">{example.title}</h2>
          <div>
            <Preview example={example} />
            <CodeBox
              tabs={[
                tab("HTML", "html", example.html),
                ...(example.js ? [tab("JavaScript", "js", example.js)] : []),
                ...(example.react ? [tab("React", "js", example.react)] : []),
                ...(example.swift ? [tab("SwiftUI", "swift", example.swift)] : []),
              ]}
            />
          </div>
        </section>
      ))}

      <nav className="flex justify-between gap-4" aria-label="More components">
        {prev ? (
          <Link className="btn" href={`/components/${prev.slug}`}>
            ← {prev.name}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link className="btn" href={`/components/${next.slug}`}>
            {next.name} →
          </Link>
        )}
      </nav>
    </article>
  );
}
