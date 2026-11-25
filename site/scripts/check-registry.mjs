// Fails if the docs drift from the kit: every class an example uses, and every class a table documents,
// must exist in the kit's CSS. Run with `npm run check`.
import { readFileSync, readdirSync } from "node:fs";
import { colorNames, entries } from "../lib/registry/index.ts";

const cssDir = new URL("../../css/", import.meta.url);
const css = readdirSync(cssDir).map((f) => readFileSync(new URL(f, cssDir), "utf8")).join("\n");
const defined = new Set([...css.matchAll(/\.([a-z][a-z0-9-]*)/g)].map((m) => m[1]));
const isKnown = (name) => defined.has(name) || colorNames.some((c) => name.endsWith(`-${c}`) && defined.has(name.slice(0, -c.length - 1)));

const problems = [];
const slugs = new Set();
for (const entry of entries) {
  if (slugs.has(entry.slug)) problems.push(`${entry.slug}: duplicate slug`);
  slugs.add(entry.slug);
  if (!entry.examples.length) problems.push(`${entry.slug}: no examples`);
  if (entry.colors && !defined.has(entry.colors)) problems.push(`${entry.slug}: colour base ".${entry.colors}" is not in the CSS`);
  for (const [name] of entry.classes) {
    // Attributes, states and CSS variables are documented in the same table; only check real class names.
    if (/^[a-z][a-z0-9-]*$/.test(name) && !["disabled", "open", "aria-current"].includes(name) && !name.startsWith("data-") && !isKnown(name))
      problems.push(`${entry.slug}: documents ".${name}", which is not in the CSS`);
  }
  for (const example of entry.examples) {
    for (const [, list] of example.html.matchAll(/class="([^"]*)"/g))
      for (const name of list.split(/\s+/).filter(Boolean))
        if (!isKnown(name)) problems.push(`${entry.slug} / ${example.title}: uses ".${name}", which is not in the CSS`);
  }
}
const ids = entries.flatMap((e) => e.examples.flatMap((x) => [...x.html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1])));
for (const id of new Set(ids)) if (ids.filter((i) => i === id).length > 1) problems.push(`id "${id}" is used by more than one example`);

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`registry ok: ${entries.length} components, ${entries.reduce((n, e) => n + e.examples.length, 0)} examples`);
