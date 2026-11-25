import { type Entry, html } from "./types.ts";

export const surface: Entry[] = [
  {
    slug: "glass",
    name: "Glass",
    category: "Surface",
    blurb: "The signature surface: a frosted panel with a lit rim and a tinted light inside. Every Glimmer panel is built on it.",
    colors: "glass",
    classes: [
      ["glass", "component", "Turns any element into a glass surface"],
      ["glow", "modifier", "Makes the inner light follow the pointer. Needs the optional glow.js"],
    ],
    note: "Cards, the navbar, alerts, stats, modals, drawers and popovers are already glass. Use this class for your own panels.",
    examples: [
      {
        title: "Glass panel",
        html: html`
          <div class="glass" style="max-width: 20rem; padding: 1.25rem">
            Any element can be a glass surface.
          </div>`,
        swift: `Text("Any view can be a glass surface.")
    .padding(20)
    .glass()`,
      },
      {
        title: "Light that follows the pointer",
        html: html`
          <div class="glass glow" style="max-width: 20rem; padding: 1.25rem">
            Move the pointer across this panel.
          </div>`,
      },
      {
        title: "Tinted light",
        html: html`
          <div class="glass glass-primary" style="padding: 1.25rem">Primary</div>
          <div class="glass glass-success" style="padding: 1.25rem">Success</div>
          <div class="glass glass-danger" style="padding: 1.25rem">Danger</div>`,
        swift: `Text("Primary")
    .padding(20)
    .glass(tint: Tokens.primary)`,
      },
    ],
  },
  {
    slug: "frost",
    name: "Frost",
    category: "Surface",
    blurb: "How frosted the glass is, from 1 (clear, only the rim and reflections) to 5 (milky). The kit's default is 3; this site runs at 1. Try the slider in the navbar.",
    classes: [
      ["frost-1", "modifier", "Clear glass: no blur, no fill, edge reflections"],
      ["frost-2", "modifier", "Barely frosted"],
      ["frost-3", "modifier", "The default"],
      ["frost-4", "modifier", "Heavy: what is behind disappears"],
      ["frost-5", "modifier", "Milky and nearly opaque"],
      ["--frost-min", "modifier", "CSS variable: a floor for everything inside. Popovers and toasts set it to 3 so floating text stays readable"],
    ],
    note: "The level inherits. Put it on <html> for the whole app or on one surface. Any number works too: style=\"--frost: 2.5\".",
    examples: [
      {
        title: "The five levels",
        html: html`
          <div class="card frost-1"><span class="meta">frost-1</span>Clear</div>
          <div class="card frost-2"><span class="meta">frost-2</span>Light</div>
          <div class="card frost-3"><span class="meta">frost-3</span>Default</div>
          <div class="card frost-4"><span class="meta">frost-4</span>Heavy</div>
          <div class="card frost-5"><span class="meta">frost-5</span>Milky</div>`,
        swift: `ContentView()
    .glimmerFrost(1) // 1...5, for every surface inside`,
      },
    ],
  },
  {
    slug: "aura",
    name: "Aura",
    category: "Surface",
    blurb: "A light that travels around the edge of any element. Use it on the one thing you want noticed.",
    colors: "aura",
    classes: [["aura", "modifier", "Adds the travelling border light to any element"]],
    examples: [
      {
        title: "Aura on a button",
        html: html`
          <button class="btn aura">Upgrade</button>
          <button class="btn aura aura-secondary">Secondary</button>`,
      },
      {
        title: "Aura on a card",
        html: html`
          <div class="card aura" style="max-width: 18rem">
            <p class="card-title">Pro plan</p>
            <p>Everything, with the light on.</p>
          </div>`,
      },
    ],
  },
  {
    slug: "dotgrid",
    name: "Dot grid",
    category: "Surface",
    blurb: "A dotted backdrop with a warm and a cool wash that fades out toward the edges.",
    classes: [["dotgrid", "component", "Adds the dotted backdrop behind an element's content"]],
    examples: [
      {
        title: "Dot grid backdrop",
        layout: "block",
        html: html`
          <div class="dotgrid" style="display: grid; place-items: center; min-height: 14rem">
            <span class="badge badge-primary">Content sits on top</span>
          </div>`,
        swift: `content
    .background(DotGrid())`,
      },
    ],
  },
  {
    slug: "streaks",
    name: "Streaks",
    category: "Surface",
    blurb: "A backdrop of flowing strands of light, warm at the top and cool at the bottom, fading out to the right.",
    classes: [["streaks", "component", "Adds the flowing strands behind an element's content"]],
    note: "Streaks and dot grid use different layers, so one element can carry both.",
    examples: [
      {
        title: "Streak backdrop",
        layout: "block",
        html: html`
          <div class="streaks" style="display: grid; place-items: center; min-height: 16rem">
            <span class="badge badge-secondary">Content sits on top</span>
          </div>`,
        swift: `content
    .background(Streaks())`,
      },
    ],
  },
  {
    slug: "flare",
    name: "Flare",
    category: "Surface",
    blurb: "A horizontal streak of light with a bright core, like a lens flare. Use it as an accent or a divider.",
    colors: "flare",
    classes: [
      ["flare", "component", "The streak of light. Its height scales the whole thing"],
      ["--x", "modifier", "CSS variable: where the core sits along the streak (default 50%)"],
    ],
    examples: [
      {
        title: "Flare",
        layout: "block",
        html: html`
          <div class="flare"></div>`,
        swift: `Flare()`,
      },
      {
        title: "As a divider, core off-centre",
        layout: "block",
        html: html`
          <hr class="flare flare-secondary" style="height: 1.5rem; --x: 25%">`,
        swift: `Flare(tint: Tokens.secondary, x: 0.25)
    .frame(height: 24)`,
      },
    ],
  },
  {
    slug: "meta",
    name: "Meta",
    category: "Surface",
    blurb: "The small mono caps label used for section heads, stat titles and counts.",
    classes: [["meta", "component", "Small uppercase mono text in the muted colour"]],
    examples: [
      {
        title: "Meta label",
        html: html`
          <span class="meta">Top results</span>
          <span class="meta">0.21 s</span>`,
        swift: `Text("Top results")
    .metaStyle()`,
      },
    ],
  },
];
