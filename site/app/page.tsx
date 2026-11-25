import Link from "next/link";
import { CodeBox } from "@/components/CodeBox";
import { PromptBox } from "@/components/PromptBox";
import { tab } from "@/lib/highlight";
import { entries, findEntry } from "@/lib/registry";
import { interactive, sample } from "@/lib/registry/charts";

const features = [
  ["Plain CSS", "No build step and no JavaScript to wire up. One stylesheet, class names you can read."],
  ["Tailwind-ready", "Import it after Tailwind v4. Utilities override it, and its colours become Tailwind's."],
  ["A SwiftUI twin", "The same surfaces, colours and fonts as a Swift package for iOS and macOS."],
  ["Five levels of frost", "From clear glass with edge reflections to milky. Set it for the app or one panel."],
  ["Native where it counts", "Dialogs, popovers and form controls are the browser's own, so they stay accessible."],
  ["One token file", "Colours, corners and fonts live in one place and generate both kits."],
];

/** Live markup from the registry, so the home page can never show something the docs don't. */
const example = (slug: string, index = 0) => findEntry(slug)!.examples[index].html;

export default function Home() {
  return (
    <main>
      <section className="hero">
        <span className="badge badge-primary">{entries.length} components</span>
        <h1 className="hero-title">
          Glass that <span className="shimmer">glows</span>.
        </h1>
        <p className="hero-text">
          Glimmer is a set of glass-and-glow components in plain CSS, with a matching SwiftUI package. Build the web app and the Apple app from the
          same parts.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link className="btn btn-primary btn-lg aura" href="/docs/install">
            Get started
          </Link>
          <Link className="btn btn-lg" href="/components">
            Browse components
          </Link>
        </div>
        <div className="mt-4 grid w-full max-w-2xl gap-3 text-left">
          <CodeBox tabs={[tab("Terminal", "bash", "npm i github:huntercash/glimmer-ui")]} />
          <p className="text-center text-sm text-muted">
            Or hand the setup to an AI agent. Change the frost and colours in the navbar and this prompt follows.
          </p>
          <PromptBox />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2">
        <div className="prose">
          <span className="meta">The look</span>
          <h2 className="!mt-0 !text-3xl">Light inside the glass.</h2>
          <p>
            Every surface is frosted, rimmed with a hairline of light, and lit from within. Move your pointer over the panel and the light follows
            it.
          </p>
          <p>
            <Link className="link" href="/components/glass">
              See how glass works →
            </Link>
          </p>
        </div>
        <div className="grid justify-items-center" dangerouslySetInnerHTML={{ __html: example("search") }} />
      </section>

      <div className="mx-auto max-w-6xl px-4">
        <hr className="flare" />
      </div>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-16 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(([title, text]) => (
          <article key={title} className="card glow">
            <h3 className="card-title">{title}</h3>
            <p className="text-sm text-muted">{text}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-[1fr_auto]">
        <div className="mockup-window">
          <div className="mockup-url">your-app.example</div>
          <div className="grid gap-4 border-t border-border p-5">
            <div className="grid gap-4 sm:grid-cols-2" dangerouslySetInnerHTML={{ __html: example("stat") }} />
            <div dangerouslySetInnerHTML={{ __html: example("table") }} />
            <div dangerouslySetInnerHTML={{ __html: example("steps") }} />
          </div>
        </div>
        <div className="grid justify-items-center" dangerouslySetInnerHTML={{ __html: example("mockup-phone") }} />
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2">
        <div className="card glow" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: interactive("chord", sample.chord, { label: "Messages sent between six teams" }) }} />
        <div className="stack-y gap-6">
          <div className="prose">
            <span className="meta">Charts</span>
            <h2 className="!mt-0 !text-3xl">Data that glows too.</h2>
            <p>
              Line, area, bar, scatter, histogram, box plot, heatmap, pie and sparkline, plus a chord diagram for showing how groups interact. They are
              drawn as SVG with no dependencies and take their colours from the kit. Hover a group on the ring.
            </p>
            <p>
              <Link className="link" href="/components/charts">
                See the charts →
              </Link>
            </p>
          </div>
          <div className="card" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: interactive("area", sample.line, { height: 240 }) }} />
        </div>
      </section>

      <section className="hero">
        <h2 className="hero-title !text-4xl md:!text-5xl">Two imports and a class name.</h2>
        <div className="w-full max-w-md text-left">
          <CodeBox tabs={[tab("CSS", "css", '@import "tailwindcss";\n@import "glimmer-ui";')]} />
        </div>
        <Link className="btn btn-primary" href="/docs/install">
          Read the setup guide
        </Link>
      </section>
    </main>
  );
}
