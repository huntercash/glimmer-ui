import { type Entry, html } from "./types.ts";

export const overlay: Entry[] = [
  {
    slug: "modal",
    name: "Modal",
    category: "Overlay",
    blurb: "A dialog over the page, built on the native dialog element. The browser handles focus, Esc and the backdrop.",
    classes: [["modal", "component", "On a <dialog>. Open it with .showModal(); a <form method=\"dialog\"> closes it"]],
    examples: [
      {
        title: "Modal",
        html: html`
          <button class="btn" onclick="document.getElementById('demo-modal').showModal()">Open modal</button>

          <dialog class="modal glow" id="demo-modal">
            <p class="card-title">Delete this album?</p>
            <p>This removes 2,418 photos. It can't be undone.</p>
            <form method="dialog" class="card-actions">
              <button class="btn btn-ghost">Cancel</button>
              <button class="btn btn-danger">Delete</button>
            </form>
          </dialog>`,
        swift: `Button("Open") { showing = true }
    .sheet(isPresented: $showing) { DeleteAlbum() }`,
      },
    ],
  },
  {
    slug: "drawer",
    name: "Drawer",
    category: "Overlay",
    blurb: "A panel that slides in from the right edge, also on the native dialog element.",
    classes: [["drawer", "component", "On a <dialog>. Same API as modal"]],
    examples: [
      {
        title: "Drawer",
        html: html`
          <button class="btn" onclick="document.getElementById('demo-drawer').showModal()">Open drawer</button>

          <dialog class="drawer" id="demo-drawer">
            <div style="display: grid; gap: 1rem">
              <p class="card-title">Filters</p>
              <label style="display: flex; align-items: center; gap: 0.5rem"><input class="toggle" type="checkbox" checked> Night only</label>
              <form method="dialog"><button class="btn btn-primary btn-block">Apply</button></form>
            </div>
          </dialog>`,
        swift: `Button("Filters") { showing = true }
    .sheet(isPresented: $showing) { Filters() }`,
      },
    ],
  },
  {
    slug: "popover",
    name: "Popover",
    category: "Overlay",
    blurb: "A floating panel anchored under its button: dropdown menus and small pop-ups. Built on the native popover attribute, so clicking away closes it.",
    classes: [["popover", "component", "On any element with the popover attribute, opened by a button with popovertarget"]],
    examples: [
      {
        title: "Dropdown menu",
        html: html`
          <button class="btn" popovertarget="demo-menu">Account ▾</button>

          <ul popover id="demo-menu" class="popover menu">
            <li><a href="#">Profile</a></li>
            <li><a href="#">Billing <span class="meta">Pro</span></a></li>
            <li><button>Sign out</button></li>
          </ul>`,
        swift: `Menu("Account") {
    Button("Profile") {}
    Button("Sign out") {}
}`,
      },
      {
        title: "Popover with content",
        html: html`
          <button class="btn" popovertarget="demo-pop">What's this?</button>

          <div popover id="demo-pop" class="popover" style="max-width: 16rem; padding: 1rem">
            <p class="card-title">Popover</p>
            <p>Anchored under its button. Click away to close.</p>
          </div>`,
        swift: `Button("What's this?") { showing = true }
    .popover(isPresented: $showing) { Text("Popover") }`,
      },
    ],
  },
];

export const layout: Entry[] = [
  {
    slug: "hero",
    name: "Hero",
    category: "Layout",
    blurb: "A large centred opening section with a headline, a line of text and a call to action.",
    classes: [
      ["hero", "component", "The section"],
      ["hero-title", "part", "The headline. Scales with the viewport"],
      ["hero-text", "part", "The supporting line"],
    ],
    examples: [
      {
        title: "Hero",
        layout: "block",
        html: html`
          <section class="hero dotgrid" style="padding-block: 3rem">
            <h1 class="hero-title">Glass that glows.</h1>
            <p class="hero-text">One set of components for the web and for Apple platforms.</p>
            <a class="btn btn-primary" href="#">Get started</a>
          </section>`,
      },
    ],
  },
  {
    slug: "footer",
    name: "Footer",
    category: "Layout",
    blurb: "Columns of links for the bottom of a page.",
    classes: [
      ["footer", "component", "The grid. Each direct child is a column"],
      ["footer-title", "part", "A column heading"],
    ],
    examples: [
      {
        title: "Footer",
        layout: "block",
        html: html`
          <footer class="footer">
            <nav><span class="footer-title">Docs</span><a href="#">Install</a><a href="#">Usage</a></nav>
            <nav><span class="footer-title">Components</span><a href="#">Button</a><a href="#">Card</a></nav>
            <nav><span class="footer-title">Project</span><a href="#">GitHub</a><a href="#">License</a></nav>
          </footer>`,
      },
    ],
  },
];

export const mockup: Entry[] = [
  {
    slug: "mockup-code",
    name: "Code mockup",
    category: "Mockup",
    blurb: "A frame for showing code or terminal commands. Every code box on this site is one.",
    classes: [
      ["mockup-code", "component", "The frame, with the three window dots"],
      ["data-prefix=\"…\"", "modifier", "On a <pre>: a prompt or line number shown before the line"],
    ],
    examples: [
      {
        title: "Terminal",
        html: html`
          <div class="mockup-code" style="width: min(26rem, 100%)">
            <pre data-prefix="$"><code>npm i github:huntercash/glimmer-ui</code></pre>
            <pre data-prefix=">"><code>added 1 package</code></pre>
          </div>`,
      },
    ],
  },
  {
    slug: "mockup-window",
    name: "Window mockup",
    category: "Mockup",
    blurb: "A glass frame that looks like an app or browser window.",
    classes: [
      ["mockup-window", "component", "The frame, with the three window dots"],
      ["mockup-url", "part", "Optional address bar, turning it into a browser"],
    ],
    examples: [
      {
        title: "Browser window",
        layout: "block",
        html: html`
          <div class="mockup-window">
            <div class="mockup-url">glimmer.example</div>
            <div style="display: grid; place-items: center; min-height: 10rem; border-top: 1px solid var(--gl-border)">
              Your page here
            </div>
          </div>`,
      },
    ],
  },
  {
    slug: "mockup-phone",
    name: "Phone mockup",
    category: "Mockup",
    blurb: "A phone frame for showing mobile screens.",
    classes: [
      ["mockup-phone", "component", "The device body"],
      ["mockup-phone-display", "part", "The screen. Put your content inside"],
    ],
    examples: [
      {
        title: "Phone",
        tall: true,
        html: html`
          <div class="mockup-phone">
            <div class="mockup-phone-display dotgrid" style="display: grid; place-items: center">
              <div class="orb" role="status" style="--s: 7rem"><span class="shimmer">Loading</span></div>
            </div>
          </div>`,
      },
    ],
  },
];
