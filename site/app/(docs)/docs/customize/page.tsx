import type { Metadata } from "next";
import Link from "next/link";
import { CodeBox } from "@/components/CodeBox";
import { tab } from "@/lib/highlight";
import tokens from "../../../../../tokens.json";

export const metadata: Metadata = { title: "Customize", description: "Change Glimmer's colours, corners, frost and fonts." };

export default function CustomizePage() {
  return (
    <div className="prose">
      <span className="meta">Docs</span>
      <h1>Customize</h1>
      <p>Everything visual is a CSS variable, so most changes are one line.</p>

      <h2>Colours</h2>
      <p>Override any of these on <code>:root</code>, or on a single element to recolour just that part of the page.</p>
      <div className="glass overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Variable</th>
              <th>Default</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(tokens.color).map(([name, value]) => (
              <tr key={name}>
                <td>
                  <code className="inline-code">--gl-{name}</code>
                </td>
                <td>
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block size-4 rounded border border-border" style={{ background: value }} />
                    <span className="meta">{value}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CodeBox tabs={[tab("CSS", "css", ":root {\n  --gl-primary: #e8b45a;   /* gold */\n  --gl-secondary: #2f9aa0; /* teal */\n}")]} />

      <h2>Light and dark</h2>
      <p>
        Glimmer is dark by default. Add <code>data-theme="light"</code> for glass over a light page, or <code>data-theme="auto"</code> to follow
        the visitor's system setting. It works on <code>&lt;html&gt;</code> or on any element, so one section can differ from the rest. Try the
        Light switch in the navbar.
      </p>
      <CodeBox tabs={[tab("HTML", "html", '<html data-theme="auto">')]} />
      <div className="glass overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Variable</th>
              <th>Light value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(tokens.light).map(([name, value]) => (
              <tr key={name}>
                <td>
                  <code className="inline-code">--gl-{name}</code>
                </td>
                <td>
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block size-4 rounded border border-border" style={{ background: value }} />
                    <span className="meta">{value}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>One component, one colour</h2>
      <p>
        Each coloured component reads its colour from <code>--c</code>. Set it inline for a one-off that the five suffixes don't cover.
      </p>
      <CodeBox tabs={[tab("HTML", "html", '<span class="badge" style="--c: #c58cff">Beta</span>')]} />

      <h2>Corners</h2>
      <p>
        Three sizes: <code>--gl-radius-sm</code> ({tokens.radius.sm}px), <code>--gl-radius-md</code> ({tokens.radius.md}px) and{" "}
        <code>--gl-radius-lg</code> ({tokens.radius.lg}px).
      </p>

      <h2>Frost</h2>
      <p>
        Set how frosted the glass is with <code>frost-1</code> to <code>frost-5</code>, on <code>&lt;html&gt;</code> for everything or on one
        surface. Try the slider in the navbar, or see <Link className="link" href="/components/frost">Frost</Link>.
      </p>
      <CodeBox tabs={[tab("HTML", "html", '<html class="frost-2">')]} />

      <h2>Fonts</h2>
      <p>
        Text uses <code>--gl-font</code> and labels use <code>--gl-mono</code>. Point them at any font you have loaded. The kit's own fonts are
        an optional import; see <Link className="link" href="/docs/install">Install</Link>.
      </p>
      <CodeBox tabs={[tab("CSS", "css", ':root {\n  --gl-font: "Inter", system-ui, sans-serif;\n  --gl-mono: "JetBrains Mono", ui-monospace, monospace;\n}')]} />

      <h2>Changing the source</h2>
      <p>
        If you work on Glimmer itself, the defaults live in <code>tokens.json</code>. The build regenerates the CSS variables and the Swift
        constants together, so the web and Apple kits never drift apart, and then the prefixed and Tailwind builds of the CSS.
      </p>
      <CodeBox tabs={[tab("Terminal", "bash", "npm run build")]} />
    </div>
  );
}
