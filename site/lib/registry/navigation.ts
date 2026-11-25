import { type Entry, html, icon } from "./types.ts";

export const navigation: Entry[] = [
  {
    slug: "navbar",
    name: "Navbar",
    category: "Navigation",
    blurb: "A glass bar for the top of a page.",
    classes: [
      ["navbar", "component", "The bar"],
      ["navbar-end", "part", "A group pushed to the right"],
    ],
    examples: [
      {
        title: "Navbar",
        layout: "block",
        html: html`
          <nav class="navbar">
            <strong style="padding-inline: 0.5rem">Glimmer</strong>
            <a class="btn btn-ghost btn-sm" href="#">Docs</a>
            <a class="btn btn-ghost btn-sm" href="#">Components</a>
            <div class="navbar-end">
              <button class="btn btn-primary btn-sm">Upgrade</button>
            </div>
          </nav>`,
      },
    ],
  },
  {
    slug: "tabs",
    name: "Tabs",
    category: "Navigation",
    blurb: "A segmented control for switching between views.",
    classes: [
      ["tabs", "component", "The track"],
      ["tab", "part", "One segment, on a <button> or <a>"],
      ["aria-selected=\"true\"", "state", "Marks the current tab (aria-current on links)"],
      ["aria-controls=\"panel-id\"", "part", "With behaviors.js loaded: the id of the panel this tab shows. Give every panel but the first the hidden attribute"],
    ],
    note: "Switching panels needs behaviors.js (or the React component). It also adds the keyboard support people expect: one tab stop for the set, arrow keys to move, Home and End to jump.",
    examples: [
      {
        title: "Tabs that switch panels",
        html: html`
          <div style="display: grid; gap: 1rem; justify-items: start">
            <div class="tabs" role="tablist" aria-label="Project">
              <button class="tab" role="tab" aria-selected="true" aria-controls="panel-overview">Overview</button>
              <button class="tab" role="tab" aria-controls="panel-activity">Activity</button>
              <button class="tab" role="tab" aria-controls="panel-settings">Settings</button>
            </div>
            <p id="panel-overview" role="tabpanel">Twelve albums, 4,580 photos.</p>
            <p id="panel-activity" role="tabpanel" hidden>Mika added 36 photos to Tokyo.</p>
            <p id="panel-settings" role="tabpanel" hidden>Sharing is on for this project.</p>
          </div>`,
        js: `import "@glimmer-ui-core/glimmer/behaviors.js"; // once, anywhere in your app`,
        react: `import { Tabs } from "@glimmer-ui-core/glimmer/react";

<Tabs
  aria-label="Project"
  tabs={[
    { label: "Overview", content: <p>Twelve albums, 4,580 photos.</p> },
    { label: "Activity", content: <p>Mika added 36 photos to Tokyo.</p> },
    { label: "Settings", content: <p>Sharing is on for this project.</p> },
  ]}
/>`,
        swift: `Picker("View", selection: $tab) {
    Text("Overview").tag(0)
    Text("Activity").tag(1)
}
.pickerStyle(.segmented)`,
      },
    ],
  },
  {
    slug: "breadcrumbs",
    name: "Breadcrumbs",
    category: "Navigation",
    blurb: "Shows where the current page sits and lets people step back up.",
    classes: [
      ["breadcrumbs", "component", "On an <ol> of links"],
      ["aria-current=\"page\"", "state", "On the last <li>"],
    ],
    examples: [
      {
        title: "Breadcrumbs",
        html: html`
          <ol class="breadcrumbs">
            <li><a href="#">Home</a></li>
            <li><a href="#">Library</a></li>
            <li aria-current="page">Tokyo</li>
          </ol>`,
      },
    ],
  },
  {
    slug: "menu",
    name: "Menu",
    category: "Navigation",
    blurb: "A vertical list of links or actions. Plain by default; add glass, or make it a popover for a dropdown.",
    classes: [
      ["menu", "component", "On a <ul> whose items hold an <a> or <button>"],
      ["menu-title", "part", "A heading row"],
      ["aria-current", "state", "On the link for the current page"],
    ],
    examples: [
      {
        title: "Menu on glass",
        html: html`
          <ul class="menu glass" style="width: 16rem">
            <li class="menu-title meta"><span>Library</span></li>
            <li><a href="#" aria-current="page">${icon.photo} Photos <span class="meta">2,418</span></a></li>
            <li><a href="#">${icon.pin} Places <span class="meta">36</span></a></li>
            <li><a href="#">${icon.doc} Stories <span class="meta">112</span></a></li>
          </ul>`,
        swift: `VStack(spacing: 0) {
    MenuRow("Photos", systemImage: "photo", meta: "2,418")
    MenuRow("Places", systemImage: "mappin.and.ellipse", meta: "36")
}
.padding(6)
.glass()`,
      },
    ],
  },
  {
    slug: "steps",
    name: "Steps",
    category: "Navigation",
    blurb: "Shows progress through a numbered sequence.",
    colors: "step",
    classes: [
      ["steps", "component", "On an <ol>"],
      ["step", "part", "One step. Numbered automatically"],
      ["data-done", "state", "Attribute on a step: lights it and the line leading to it"],
      ['aria-current="step"', "state", "The step the user is on: lit, with a ring"],
    ],
    examples: [
      {
        title: "Steps",
        layout: "block",
        html: html`
          <ol class="steps">
            <li class="step" data-done>Cart</li>
            <li class="step" data-done>Shipping</li>
            <li class="step" aria-current="step">Payment</li>
            <li class="step">Done</li>
          </ol>`,
      },
    ],
  },
  {
    slug: "dock",
    name: "Dock",
    category: "Navigation",
    blurb: "A floating bar of icon buttons pinned to the bottom of the screen.",
    classes: [
      ["dock", "component", "The bar. Fixed to the bottom centre"],
      ["aria-current", "state", "On the active item"],
    ],
    examples: [
      {
        title: "Dock",
        tall: true,
        html: html`
          <nav class="dock" aria-label="Primary">
            <a href="#" aria-current="page" aria-label="Home">${icon.home}</a>
            <a href="#" aria-label="Search">${icon.search}</a>
            <a href="#" aria-label="Photos">${icon.photo}</a>
            <a href="#" aria-label="Account">${icon.user}</a>
          </nav>`,
        swift: `TabView {
    HomeView().tabItem { Label("Home", systemImage: "house") }
    SearchView().tabItem { Label("Search", systemImage: "magnifyingglass") }
}`,
      },
    ],
  },
  {
    slug: "pagination",
    name: "Pagination",
    category: "Navigation",
    blurb: "Moves between pages of results. It is a join of buttons, so there is no extra class to learn.",
    classes: [
      ["join", "component", "Fuses the page buttons together"],
      ["aria-current=\"page\"", "state", "On the current page's button"],
    ],
    examples: [
      {
        title: "Pagination",
        html: html`
          <nav class="join" aria-label="Pages">
            <button class="btn" aria-label="Previous">‹</button>
            <button class="btn btn-primary" aria-current="page">1</button>
            <button class="btn">2</button>
            <button class="btn">3</button>
            <button class="btn" aria-label="Next">›</button>
          </nav>`,
      },
    ],
  },
];
