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
    slug: "sidebar",
    name: "Sidebar",
    category: "Navigation",
    blurb: "A column of menus that folds down to a rail of icons. It has a search, rows you can drag, and a handle on its edge.",
    classes: [
      ["sidebar", "component", "The column, on a <nav>. Add glass for a glass panel. Set --sidebar-width to change its open width"],
      ["data-collapsed", "state", "Attribute on the sidebar: folds it to the rail. behaviors.js adds and removes it"],
      ["sidebar-brand", "part", "The row at the top: a logo, then a name"],
      ["sidebar-search", "part", "A <label> holding an icon, an <input> and a shortcut hint"],
      ["menu", "part", "Each list of rows. Give it an aria-label: it names the list in the toast when a row is dragged in"],
      ["menu-title", "part", "A heading above a list. On the rail it becomes a hairline"],
      ["sidebar-row", "part", "Any other row: avatars, a plan card, the signed-in user"],
      ["sidebar-end", "part", "A group pushed to the bottom"],
      ["sidebar-handle", "part", "A <button> on the trailing edge. Click or drag it to fold and unfold"],
      ["data-tip", "part", "On an <li>: the tooltip shown beside its icon on the rail"],
      ['draggable="true"', "part", "On an <li>: lets it be dragged to a new place, or moved with Alt+↑ and Alt+↓"],
      ["aria-current", "state", "On the link for the current page: lights a dot on the sidebar's edge"],
    ],
    note: "Folding, search and dragging need behaviors.js. In a row, put the icon first and the label second, in a <span>; whatever follows (a badge, a toggle) is pushed to the end. Rows clip themselves, so the rail is the same markup cut off after the icon. In SwiftUI it is the Sidebar view: the rows are data you bind, so dragging reorders your own array. A dragged row sends a cancelable gl-move event with detail { list, before } before it moves: when a framework renders the rows from state, call preventDefault() and update the state yourself.",
    examples: [
      {
        title: "Sidebar",
        tall: true,
        html: html`
          <nav class="sidebar glass" aria-label="Main" style="height: 36rem">
            <a class="sidebar-brand" href="#">
              <span class="avatar avatar-sm">G</span>
              <strong>Glimmer</strong>
              <span class="badge">Pro</span>
            </a>
            <label class="sidebar-search">
              ${icon.search}
              <input type="search" placeholder="Search" aria-label="Search the menu">
              <kbd class="kbd">⌘K</kbd>
            </label>

            <span class="menu-title meta">Pinned</span>
            <ul class="menu" aria-label="Pinned">
              <li data-tip="Home" draggable="true"><a href="#home" aria-current="page">${icon.home} <span>Home</span></a></li>
              <li data-tip="Inbox · 4 new" draggable="true">
                <a href="#inbox">
                  <span class="indicator">${icon.bell}<span class="indicator-item status status-primary"></span></span>
                  <span>Inbox</span>
                  <span class="badge badge-primary">4</span>
                </a>
              </li>
            </ul>

            <span class="menu-title meta">Library</span>
            <ul class="menu" aria-label="Library">
              <li data-tip="Photos" draggable="true"><a href="#photos">${icon.photo} <span>Photos</span></a></li>
              <li data-tip="Places" draggable="true"><a href="#places">${icon.pin} <span>Places</span></a></li>
              <li data-tip="Sync · 3 running" draggable="true">
                <label>${icon.bolt} <span>Sync</span> <input class="toggle" type="checkbox" checked></label>
              </li>
              <li data-tip="Analytics" draggable="true"><a href="#analytics">${icon.chart} <span>Analytics</span></a></li>
            </ul>

            <span class="menu-title meta">Team</span>
            <div class="sidebar-row">
              <span class="avatar-group">
                <span class="avatar avatar-sm" title="Mika Ross · Design">MR</span>
                <span class="avatar avatar-sm" title="Jon Sato · Engineering">JS</span>
                <span class="avatar avatar-sm" title="Tess Lind · Research">TL</span>
              </span>
              <span class="meta">+3 online</span>
            </div>

            <div class="sidebar-end">
              <div class="sidebar-row">
                <div class="radial" style="--value: 43; width: 1.5rem; margin: 0.25rem" role="progressbar" aria-valuenow="43" aria-label="Trial used"></div>
                <span>Pro trial <small class="meta">8 days left</small></span>
                <button class="btn btn-sm">Upgrade</button>
              </div>
              <a class="sidebar-row" href="#">
                <span class="avatar avatar-sm">AK</span>
                <span>Aiden Kerr <small class="meta">aiden@example.com</small></span>
              </a>
            </div>
            <button class="sidebar-handle" aria-label="Toggle sidebar" aria-expanded="true"></button>
          </nav>`,
        js: `import "@glimmer-ui-core/glimmer/behaviors.js"; // once, anywhere in your app

// Optional: keep your own state in step when a row is dragged.
document.addEventListener("gl-move", (e) => {
  console.log(e.target, "moved into", e.detail.list, "before", e.detail.before);
});`,
        swift: `@State private var page: String? = "Home"
@State private var folded = false
@State private var sync = true
@State private var menu = [
    SidebarSection("Pinned", items: [
        SidebarItem("Home", systemImage: "house"),
        SidebarItem("Inbox", systemImage: "bell", badge: "4", hint: "Inbox · 4 new"),
    ]),
    SidebarSection("Library", items: [
        SidebarItem("Photos", systemImage: "photo"),
        SidebarItem("Places", systemImage: "mappin.and.ellipse"),
    ]),
]

Sidebar(sections: $menu, selection: $page, collapsed: $folded) {
    HStack(spacing: 12) { Avatar("G", size: 32); Text("Glimmer") }
} footer: {
    HStack(spacing: 12) { Avatar("AK", size: 32); Text("Aiden Kerr") }
}

// A row that is a switch: SidebarItem("Sync", systemImage: "bolt", isOn: $sync)`,
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
