import { readFileSync } from "node:fs";
import path from "node:path";

export type Release = { version: string; date: string; changes: string[] };

/** Parses `## version · date` headings and the `- ` lines under each. */
export function parseChangelog(markdown: string): Release[] {
  return markdown
    .split(/^## /m)
    .slice(1)
    .map((section) => {
      const [heading, ...lines] = section.split("\n");
      const [version, date = ""] = heading.split("·").map((part) => part.trim());
      return { version, date, changes: lines.filter((line) => line.startsWith("- ")).map((line) => line.slice(2).trim()) };
    });
}

/** The one changelog, kept at the repository root so GitHub shows it too. */
export const releases = parseChangelog(readFileSync(path.join(process.cwd(), "..", "CHANGELOG.md"), "utf8"));
