// Run with `npm test`. Checks the generated CSS builds are current and do what they claim.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { build, prefix, utilities } from "./build-css.mjs";

test("generated CSS matches its sources (run `npm run build` if this fails)", () => {
  for (const [path, text] of Object.entries(build())) assert.equal(readFileSync(new URL(path, import.meta.url), "utf8"), text, path);
});

test("prefixing renames classes and nothing else", () => {
  const css = `.btn:hover > .btn-lg { margin: 0.5rem .25em; background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E") } [data-tip=".x"] { top: 1.5px }`;
  assert.equal(prefix(css), css.replace(".btn:hover", ".gl-btn:hover").replace(".btn-lg", ".gl-btn-lg"));
  const out = build()["css/prefixed.css"];
  assert.ok(out.includes(".gl-glass") && out.includes(".gl-frost-1") && out.includes(".chart-line"));
  assert.doesNotMatch(out, /[\s,(>]\.(btn|card|glass|modal)\b/); // no unprefixed component left behind
});

test("only plain single-class modifiers become Tailwind utilities", () => {
  const out = utilities(`.btn { a: b } .btn-lg { height: 3rem } .btn-lg:hover { c: d } .x-a, .x-b { e: f } .x-a { g: h } @media print { .x-b { i: j } }`);
  assert.equal(out, "@utility btn-lg { height: 3rem }\n@utility x-a { e: f g: h }\n@utility x-b { e: f }");
});
