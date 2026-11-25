import type { Metadata } from "next";
import { releases } from "@/lib/changelog";

export const metadata: Metadata = { title: "Changelog", description: "What changed in each version of Glimmer, the docs and the SwiftUI package." };

/** Turns `backticked` words into <code>. */
const inline = (text: string) => text.split("`").map((part, index) => (index % 2 ? <code key={index}>{part}</code> : part));

export default function ChangelogPage() {
  return (
    <div className="prose">
      <span className="meta">Docs</span>
      <h1>Changelog</h1>
      <p>What changed in each version: the web kit, the SwiftUI package, and these docs.</p>
      {releases.map((release) => (
        <section key={release.version} id={`v${release.version}`}>
          <h2>
            v{release.version} <span className="meta">{release.date}</span>
          </h2>
          <ul>
            {release.changes.map((change) => (
              <li key={change}>{inline(change)}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
