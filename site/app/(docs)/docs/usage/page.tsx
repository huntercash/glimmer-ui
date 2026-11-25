import type { Metadata } from "next";
import Link from "next/link";
import { CodeBox } from "@/components/CodeBox";
import { tab } from "@/lib/highlight";

export const metadata: Metadata = { title: "Usage", description: "How Glimmer's class names fit together." };

export default function UsagePage() {
  return (
    <div className="prose">
      <span className="meta">Docs</span>
      <h1>Usage</h1>
      <p>Every component follows the same four rules. Learn them once and the rest is a class list.</p>

      <h2>1. One class makes the component</h2>
      <p>
        <code>btn</code>, <code>card</code>, <code>badge</code>, <code>modal</code>. Put it on the natural HTML element: a button, an article, a
        dialog.
      </p>
      <CodeBox tabs={[tab("HTML", "html", '<article class="card">\n  <p class="card-title">Night walk</p>\n  <p>Shibuya after the rain.</p>\n</article>')]} />

      <h2>2. Modifiers change shape and size</h2>
      <p>
        They are named after the component: <code>btn-outline</code>, <code>btn-sm</code>, <code>avatar-lg</code>, <code>toast-top</code>.
      </p>
      <CodeBox tabs={[tab("HTML", "html", '<button class="btn btn-outline btn-sm">Small outline</button>')]} />

      <h2>3. A suffix sets the colour</h2>
      <p>
        Add <code>-primary</code>, <code>-secondary</code>, <code>-success</code>, <code>-warning</code> or <code>-danger</code> to any component
        that has a colour. It works the same everywhere.
      </p>
      <CodeBox
        tabs={[
          tab(
            "HTML",
            "html",
            '<button class="btn btn-primary">Save</button>\n<span class="badge badge-success">Live</span>\n<div class="alert alert-danger" role="alert">Payment failed.</div>\n<progress class="progress progress-secondary" value="70" max="100"></progress>',
          ),
        ]}
      />

      <h2>4. State comes from HTML, not classes</h2>
      <p>
        Use the attributes the platform already has: <code>disabled</code>, <code>open</code>, <code>aria-busy</code>, <code>aria-invalid</code>,{" "}
        <code>aria-selected</code>, <code>aria-current</code>. Your markup stays accessible and there is nothing to keep in sync. Where HTML has
        no attribute for a state, Glimmer uses a data attribute: <code>data-done</code> on a finished step or timeline entry.
      </p>
      <CodeBox
        tabs={[
          tab(
            "HTML",
            "html",
            '<button class="btn btn-primary" aria-busy="true">Saving</button>\n<input class="input" aria-invalid="true" value="not-an-email">\n<button class="tab" role="tab" aria-selected="true">Overview</button>',
          ),
        ]}
      />

      <h2>With Tailwind</h2>
      <p>
        Glimmer sits in Tailwind's <code>components</code> layer, so a utility on the same element always wins. Use utilities for layout and for
        one-off tweaks.
      </p>
      <CodeBox tabs={[tab("HTML", "html", '<button class="btn btn-primary rounded-full px-8 md:h-12">Wider and rounder</button>')]} />
      <p>
        To put Tailwind variants on Glimmer's own modifiers, such as <code>md:btn-lg</code> or <code>hover:btn-primary</code>, add one more
        import. It covers sizes, colours and frost levels.
      </p>
      <CodeBox
        tabs={[
          tab("CSS", "css", '@import "tailwindcss";\n@import "@glimmer-ui-core/glimmer";\n@import "@glimmer-ui-core/glimmer/css/tailwind.css";'),
          tab("HTML", "html", '<button class="btn md:btn-lg hover:btn-primary">Grows on wide screens</button>'),
        ]}
      />

      <h2>Overlays use the browser</h2>
      <p>
        <Link className="link" href="/components/modal">Modal</Link> and <Link className="link" href="/components/drawer">drawer</Link> are native
        dialogs, and <Link className="link" href="/components/popover">popover</Link> is the native popover attribute. Opening, closing, focus
        handling and Esc are the browser's job, so none of them need a script from the kit.
      </p>

      <h2>The few things that need a script</h2>
      <p>
        Load <code>behaviors.js</code> once and these work from markup alone, including markup added later:{" "}
        <Link className="link" href="/components/tabs">tabs</Link> that switch panels and answer to the arrow keys,{" "}
        <Link className="link" href="/components/toast">toasts</Link> from a function call,{" "}
        <Link className="link" href="/components/carousel">carousel</Link> buttons, a{" "}
        <Link className="link" href="/components/search">search</Link> field that filters a list, and{" "}
        <Link className="link" href="/components/tooltip">tooltips</Link> that screen readers can read.
      </p>
      <CodeBox
        tabs={[
          tab("JavaScript", "js", 'import { toast } from "@glimmer-ui-core/glimmer/behaviors.js";\n\ntoast("Saved.", { type: "success" });'),
          tab("React", "js", 'import { Tabs, Modal, toast } from "@glimmer-ui-core/glimmer/react";\n\n<Modal open={open} onClose={() => setOpen(false)}>\n  <p className="card-title">Delete album?</p>\n</Modal>'),
        ]}
      />

      <h2>Reading direction, print and contrast</h2>
      <p>
        Components follow the page's direction, so <code>dir="rtl"</code> mirrors them. Pages print in the light theme without glows or
        shadows. People who ask their system for more contrast or less transparency get more solid panels, and Windows high-contrast mode keeps
        every state visible.
      </p>

      <h2>Motion</h2>
      <p>Glimmer's animations play once and stop for people who have asked their system to reduce motion. Your own animations are left alone.</p>
    </div>
  );
}
