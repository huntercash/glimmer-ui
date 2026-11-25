import type { Metadata } from "next";
import Link from "next/link";
import { CodeBox } from "@/components/CodeBox";
import { PromptBox } from "@/components/PromptBox";
import { tab } from "@/lib/highlight";

export const metadata: Metadata = { title: "Install", description: "Add Glimmer to a web project in two steps, with or without Tailwind." };

export default function InstallPage() {
  return (
    <div className="prose">
      <span className="meta">Docs</span>
      <h1>Install</h1>
      <p>
        Glimmer is plain CSS with no build step. It works on its own or alongside Tailwind CSS v4. Three small scripts are optional, for the few
        things CSS cannot do.
      </p>

      <div className="alert alert-warning">
        The package is <code>@glimmer-ui-core/glimmer</code>. The unscoped <code>glimmer-ui</code> on npm is an unrelated package.
      </div>

      <h2>1. Install the package</h2>
      <CodeBox
        tabs={[
          tab("npm", "bash", "npm i @glimmer-ui-core/glimmer"),
          tab("pnpm", "bash", "pnpm add @glimmer-ui-core/glimmer"),
          tab("yarn", "bash", "yarn add @glimmer-ui-core/glimmer"),
          tab("bun", "bash", "bun add @glimmer-ui-core/glimmer"),
        ]}
      />

      <h2>Or let an AI agent do it</h2>
      <p>
        Paste this into your coding agent. It covers every step on this page and carries the frost level and colours you have picked in the navbar.
      </p>
      <PromptBox />

      <h2>2. Add it to your CSS</h2>
      <p>
        With Tailwind, import Glimmer after it. Any utility on the same element then overrides the component, and the kit's colours and fonts
        become Tailwind's own: <code>bg-primary</code>, <code>text-muted</code>, <code>font-mono</code>.
      </p>
      <CodeBox
        tabs={[
          tab("Tailwind v4", "css", '@import "tailwindcss";\n@import "@glimmer-ui-core/glimmer";\n@import "@glimmer-ui-core/glimmer/css/tailwind.css"; /* optional: variants such as md:btn-lg */'),
          tab("Plain CSS", "css", '@import "@glimmer-ui-core/glimmer/css/index.css";'),
          tab("HTML", "html", '<link rel="stylesheet" href="node_modules/@glimmer-ui-core/glimmer/css/index.css">'),
        ]}
      />

      <h2>3. Use a component</h2>
      <CodeBox tabs={[tab("HTML", "html", '<button class="btn btn-primary">Hello, glass</button>')]} />
      <p>
        That is the whole setup. Browse the <Link className="link" href="/components">components</Link> for everything else.
      </p>

      <h2>Optional: the scripts</h2>
      <p>Each is loaded once, anywhere in your app, and does nothing on a server.</p>
      <div className="glass overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>File</th>
              <th>What it adds</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code className="inline-code">glow.js</code></td>
              <td>Surfaces with the <code>glow</code> class move their inner light to the pointer.</td>
            </tr>
            <tr>
              <td><code className="inline-code">behaviors.js</code></td>
              <td>
                Tabs that switch panels, <code>toast()</code>, carousel buttons, filtering a list as you type, and tooltips that screen readers can
                read.
              </td>
            </tr>
            <tr>
              <td><code className="inline-code">charts.js</code></td>
              <td>The chart functions and the <code>&lt;gl-chart&gt;</code> tag.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <CodeBox
        tabs={[
          tab("Bundler", "js", 'import "@glimmer-ui-core/glimmer/glow.js";\nimport "@glimmer-ui-core/glimmer/behaviors.js";\nimport "@glimmer-ui-core/glimmer/charts.js";'),
          tab(
            "HTML",
            "html",
            '<script src="node_modules/@glimmer-ui-core/glimmer/glow.js" defer></script>\n<script type="module" src="node_modules/@glimmer-ui-core/glimmer/behaviors.js"></script>\n<script type="module" src="node_modules/@glimmer-ui-core/glimmer/charts.js"></script>',
          ),
        ]}
      />

      <h2>Optional: React</h2>
      <p>
        Most of Glimmer needs no components: put the classes on plain elements. The parts with behaviour have small ones, with TypeScript types.
        Importing them loads the behaviours and charts for you.
      </p>
      <CodeBox
        tabs={[
          tab(
            "React",
            "js",
            'import { Chart, Tabs, Modal, Drawer, toast } from "@glimmer-ui-core/glimmer/react";\n\n<button className="btn btn-primary" onClick={() => toast("Saved.", { type: "success" })}>Save</button>\n<Chart type="line" data={{ labels, series }} options={{ smooth: true }} />',
          ),
        ]}
      />

      <h2>Optional: fonts</h2>
      <p>
        Out of the box, text uses your system font. The kit also ships SUIT for text and Fragment Mono for labels (about 700 KB together), which
        this site uses. Add them with one more import:
      </p>
      <CodeBox
        tabs={[
          tab("CSS", "css", '@import "@glimmer-ui-core/glimmer/css/fonts.css";'),
          tab("HTML", "html", '<link rel="stylesheet" href="node_modules/@glimmer-ui-core/glimmer/css/fonts.css">'),
        ]}
      />
      <p>
        Bundlers that resolve package asset URLs need nothing else. The Tailwind CLI inlines the stylesheet but does not copy the font files, so
        link <code>fonts.css</code> from HTML instead, or copy the <code>css</code> and <code>fonts</code> folders next to each other in your
        public directory.
      </p>

      <h2>If Glimmer's names clash with yours</h2>
      <p>
        The default import styles the page itself (background, text colour, font, focus ring) and uses short class names such as{" "}
        <code>btn</code> and <code>card</code>. Both are optional.
      </p>
      <CodeBox
        tabs={[
          tab("Components only", "css", '/* Leaves your page background, fonts and focus styles alone. */\n@import "@glimmer-ui-core/glimmer/css/components.css";'),
          tab("Prefixed", "css", '/* Every class gets a gl- prefix: gl-btn, gl-card, gl-glass. Also leaves the page alone. */\n@import "@glimmer-ui-core/glimmer/css/prefixed.css";'),
        ]}
      />
      <p>
        With the prefixed build, tell the script that builds toasts: <code>config.prefix = "gl-"</code>, imported from{" "}
        <code>behaviors.js</code>. Chart classes and attributes such as <code>data-tip</code> keep their names.
      </p>

      <h2>Apple platforms</h2>
      <p>
        The same components exist as a SwiftUI package. See <Link className="link" href="/docs/swiftui">SwiftUI</Link>.
      </p>
    </div>
  );
}
