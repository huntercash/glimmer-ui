import { type Entry, html } from "./types.ts";

export const display: Entry[] = [
  {
    slug: "card",
    name: "Card",
    category: "Data display",
    blurb: "A glass panel for grouping related content.",
    colors: "card",
    classes: [
      ["card", "component", "The panel. An <img> placed first bleeds to the edges"],
      ["card-title", "part", "Heading text"],
      ["card-actions", "part", "A row of buttons pushed to the bottom right"],
      ["glow", "modifier", "Makes the inner light follow the pointer"],
    ],
    examples: [
      {
        title: "Card",
        html: html`
          <article class="card glow" style="max-width: 20rem">
            <p class="card-title">Night walk</p>
            <p>Shibuya after the rain, shot on a 35mm.</p>
            <div class="card-actions">
              <button class="btn btn-ghost btn-sm">Skip</button>
              <button class="btn btn-primary btn-sm">Open</button>
            </div>
          </article>`,
        swift: `GroupBox("Night walk") {
    Text("Shibuya after the rain, shot on a 35mm.")
}
.groupBoxStyle(.glimmer)`,
      },
      {
        title: "Tinted cards",
        html: html`
          <article class="card card-primary" style="max-width: 14rem"><p class="card-title">Warm</p><p>card-primary</p></article>
          <article class="card card-success" style="max-width: 14rem"><p class="card-title">Fresh</p><p>card-success</p></article>`,
        swift: `GroupBox("Warm") { Text("Tinted") }
    .groupBoxStyle(.glimmer(tint: Tokens.primary))`,
      },
    ],
  },
  {
    slug: "badge",
    name: "Badge",
    category: "Data display",
    blurb: "A small label for the status of something.",
    colors: "badge",
    classes: [["badge", "component", "A small mono caps label"]],
    examples: [
      {
        title: "Badges",
        html: html`
          <span class="badge">Draft</span>
          <span class="badge badge-primary">New</span>
          <span class="badge badge-success"><span class="status"></span>Live</span>
          <span class="badge badge-warning">Pending</span>
          <span class="badge badge-danger">Failed</span>`,
        swift: `Badge("Draft")
Badge("New", color: Tokens.primary)
Badge("Failed", color: Tokens.danger)`,
      },
    ],
  },
  {
    slug: "status",
    name: "Status",
    category: "Data display",
    blurb: "A tiny lit dot that shows a state: online, pending, failing.",
    colors: "status",
    classes: [["status", "component", "A glowing dot. Green by default"]],
    examples: [
      {
        title: "Status dots",
        html: html`
          <span class="status" aria-label="Online"></span>
          <span class="status status-warning" aria-label="Degraded"></span>
          <span class="status status-danger" aria-label="Down"></span>
          <span class="status status-secondary" aria-label="Info"></span>`,
        swift: `StatusDot()
StatusDot(Tokens.warning)`,
      },
    ],
  },
  {
    slug: "avatar",
    name: "Avatar",
    category: "Data display",
    blurb: "A thumbnail for a person or a team. Works on an image or on initials.",
    classes: [
      ["avatar", "component", "On an <img>, or on a <span> holding initials"],
      ["avatar-sm", "size", "Small"],
      ["avatar-lg", "size", "Large"],
      ["avatar-group", "component", "Overlaps the avatars inside it"],
    ],
    examples: [
      {
        title: "Sizes",
        html: html`
          <span class="avatar avatar-sm">AK</span>
          <span class="avatar">HM</span>
          <span class="avatar avatar-lg">JS</span>`,
        swift: `Avatar("HM")
Avatar("JS", size: 56)`,
      },
      {
        title: "Group",
        html: html`
          <div class="avatar-group">
            <span class="avatar">AK</span>
            <span class="avatar">JS</span>
            <span class="avatar">MT</span>
            <span class="avatar">+4</span>
          </div>`,
      },
    ],
  },
  {
    slug: "stat",
    name: "Stat",
    category: "Data display",
    blurb: "A number with a title and a note, on glass.",
    colors: "stat",
    classes: [
      ["stat", "component", "The panel"],
      ["stat-value", "part", "The big number"],
      ["stat-desc", "part", "The note under it"],
    ],
    examples: [
      {
        title: "Stats",
        html: html`
          <div class="stat glow" style="min-width: 13rem">
            <span class="meta">Revenue</span>
            <span class="stat-value">$48,210</span>
            <span class="stat-desc">↑ 12% vs last month</span>
          </div>
          <div class="stat stat-success glow" style="min-width: 13rem">
            <span class="meta">Uptime</span>
            <span class="stat-value">99.98%</span>
            <span class="stat-desc">30 day rolling</span>
          </div>`,
        swift: `Stat("Revenue", value: "$48,210", caption: "↑ 12% vs last month")
Stat("Uptime", value: "99.98%", tint: Tokens.success)`,
      },
    ],
  },
  {
    slug: "table",
    name: "Table",
    category: "Data display",
    blurb: "Rows of data with mono column heads. Wrap it in glass for a panel.",
    classes: [["table", "component", "On a <table>"]],
    examples: [
      {
        title: "Table on glass",
        layout: "block",
        html: html`
          <div class="glass">
            <table class="table">
              <thead><tr><th>Name</th><th>Status</th><th>Count</th></tr></thead>
              <tbody>
                <tr><td>Photos</td><td><span class="badge badge-success">Synced</span></td><td>2,418</td></tr>
                <tr><td>Places</td><td><span class="badge badge-warning">Pending</span></td><td>36</td></tr>
                <tr><td>Stories</td><td><span class="badge">Idle</span></td><td>112</td></tr>
              </tbody>
            </table>
          </div>`,
      },
    ],
  },
  {
    slug: "list",
    name: "List",
    category: "Data display",
    blurb: "Rows of information with hairlines between them.",
    classes: [["list", "component", "On a <ul> or <ol>. A .meta placed last in a row is pushed to the end"]],
    examples: [
      {
        title: "List on glass",
        html: html`
          <ul class="list glass" style="width: min(22rem, 100%)">
            <li><span class="avatar avatar-sm">AK</span> Aiko Kimura <span class="meta">Owner</span></li>
            <li><span class="avatar avatar-sm">JS</span> Jonas Stein <span class="meta">Editor</span></li>
            <li><span class="avatar avatar-sm">MT</span> Mira Tan <span class="meta">Viewer</span></li>
          </ul>`,
      },
    ],
  },
  {
    slug: "timeline",
    name: "Timeline",
    category: "Data display",
    blurb: "Events in order, joined by a line. Finished ones light up.",
    colors: "timeline",
    classes: [
      ["timeline", "component", "On an <ol>"],
      ["data-done", "state", "Attribute on an <li>: lights its dot and the line after it"],
    ],
    examples: [
      {
        title: "Timeline",
        html: html`
          <ol class="timeline">
            <li data-done><span class="meta">09:40</span>Build passed</li>
            <li data-done><span class="meta">09:42</span>Deployed to preview</li>
            <li><span class="meta">Next</span>Promote to production</li>
          </ol>`,
      },
    ],
  },
  {
    slug: "accordion",
    name: "Accordion",
    category: "Data display",
    blurb: "Shows and hides content, built on the native details element.",
    classes: [
      ["accordion", "component", "On a <details> with a <summary>"],
      ["open", "state", "HTML attribute: starts expanded"],
    ],
    examples: [
      {
        title: "Accordion",
        layout: "block",
        html: html`
          <details class="accordion" open>
            <summary>Does it need Tailwind?</summary>
            <p>No. It is plain CSS; Tailwind utilities override it when present.</p>
          </details>
          <details class="accordion">
            <summary>Does it need JavaScript?</summary>
            <p>Only the optional pointer glow.</p>
          </details>`,
        swift: `DisclosureGroup("Does it need Tailwind?") {
    Text("No.")
}`,
      },
    ],
  },
  {
    slug: "chat",
    name: "Chat bubble",
    category: "Data display",
    blurb: "One line of a conversation. Yours sit on the right in the accent colour.",
    classes: [
      ["chat", "component", "Container that stacks the bubbles"],
      ["bubble", "component", "A message"],
      ["bubble-end", "modifier", "Puts it on the right, filled"],
    ],
    examples: [
      {
        title: "Conversation",
        html: html`
          <div class="chat" style="width: min(22rem, 100%)">
            <p class="bubble">Did the deploy go out?</p>
            <p class="bubble bubble-end">Shipped ten minutes ago.</p>
            <p class="bubble">Perfect.</p>
          </div>`,
        swift: `Bubble("Did the deploy go out?")
Bubble("Shipped ten minutes ago.", mine: true)`,
      },
    ],
  },
  {
    slug: "divider",
    name: "Divider",
    category: "Data display",
    blurb: "Separates content with a rule, optionally with a word in the middle.",
    classes: [["divider", "component", "Leave it empty for a plain rule, or put text inside"]],
    examples: [
      {
        title: "Dividers",
        layout: "block",
        html: html`
          <div class="divider">or</div>
          <div class="divider"></div>`,
        swift: `Divider()`,
      },
    ],
  },
  {
    slug: "indicator",
    name: "Indicator",
    category: "Data display",
    blurb: "Pins something, usually a badge or a status dot, to the corner of another element.",
    classes: [
      ["indicator", "component", "Wraps the element and the thing to pin"],
      ["indicator-item", "part", "The pinned element. Top right by default"],
      ["indicator-start", "modifier", "Left side"],
      ["indicator-bottom", "modifier", "Bottom edge"],
    ],
    examples: [
      {
        title: "Indicators",
        html: html`
          <div class="indicator">
            <span class="indicator-item badge badge-primary">3</span>
            <button class="btn">Inbox</button>
          </div>
          <div class="indicator">
            <span class="indicator-item indicator-bottom status"></span>
            <span class="avatar">HM</span>
          </div>`,
      },
    ],
  },
  {
    slug: "stack",
    name: "Stack",
    category: "Data display",
    blurb: "Piles elements on top of each other, the first one in front.",
    classes: [["stack", "component", "Container. Later children peek out underneath, smaller and dimmer"]],
    examples: [
      {
        title: "Stacked cards",
        tall: true,
        html: html`
          <div class="stack" style="width: 16rem">
            <div class="card card-primary"><p class="card-title">Tonight</p><p>3 new photos</p></div>
            <div class="card"><p class="card-title">Yesterday</p><p>12 photos</p></div>
            <div class="card"><p class="card-title">Last week</p><p>48 photos</p></div>
          </div>`,
      },
    ],
  },
  {
    slug: "carousel",
    name: "Carousel",
    category: "Data display",
    blurb: "A row you swipe or scroll through, snapping to each item.",
    classes: [
      ["carousel", "component", "Container. Its children scroll horizontally and snap into place"],
      ["data-carousel=\"prev\" · \"next\"", "part", "With behaviors.js loaded: on a button outside the carousel, with aria-controls naming it. Scrolls it by a page"],
    ],
    note: "Swiping, scrolling and arrow keys (once it has focus) work with no script. The buttons need behaviors.js.",
    examples: [
      {
        title: "Carousel of cards",
        layout: "block",
        js: `import "glimmer-ui/behaviors.js"; // once, anywhere in your app`,
        html: html`
          <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-bottom: 0.75rem">
            <button class="btn btn-circle btn-sm" data-carousel="prev" aria-controls="albums" aria-label="Previous albums">‹</button>
            <button class="btn btn-circle btn-sm" data-carousel="next" aria-controls="albums" aria-label="Next albums">›</button>
          </div>
          <div class="carousel" id="albums" tabindex="0" aria-label="Albums">
            <div class="card card-primary" style="width: 14rem"><p class="card-title">Tokyo</p><p>2,418 photos</p></div>
            <div class="card" style="width: 14rem"><p class="card-title">Osaka</p><p>640 photos</p></div>
            <div class="card card-success" style="width: 14rem"><p class="card-title">Kyoto</p><p>1,102 photos</p></div>
            <div class="card" style="width: 14rem"><p class="card-title">Nara</p><p>88 photos</p></div>
            <div class="card card-danger" style="width: 14rem"><p class="card-title">Sapporo</p><p>301 photos</p></div>
          </div>`,
      },
    ],
  },
];
