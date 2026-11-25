import { type Entry, html } from "./types.ts";

export const feedback: Entry[] = [
  {
    slug: "alert",
    name: "Alert",
    category: "Feedback",
    blurb: "Tells people about something that happened or needs attention.",
    colors: "alert",
    classes: [["alert", "component", "A glass banner. Give it role=\"alert\" for urgent messages, role=\"status\" otherwise"]],
    examples: [
      {
        title: "Alerts",
        layout: "block",
        html: html`
          <div style="display: grid; gap: 0.75rem">
            <div class="alert" role="status">Heads up — a new version is available.</div>
            <div class="alert alert-success" role="status">Saved. Your changes are live.</div>
            <div class="alert alert-warning" role="alert">Your trial ends in 3 days.</div>
            <div class="alert alert-danger" role="alert">Payment failed. Update your card.</div>
          </div>`,
        swift: `Banner("Heads up — a new version is available.")
Banner("Payment failed. Update your card.", color: Tokens.danger)`,
      },
    ],
  },
  {
    slug: "toast",
    name: "Toast",
    category: "Feedback",
    blurb: "A stack of alerts pinned to a corner of the screen.",
    classes: [
      ["toast", "component", "Fixed container, bottom right by default. Its children animate in"],
      ["toast-top", "modifier", "Top edge"],
      ["toast-start", "modifier", "The start edge: left, or right in right-to-left pages"],
      ["toast(message, options)", "component", "From behaviors.js: adds a message to the stack and removes it after a while. Options: type, duration, top, start"],
    ],
    note: "The function builds the stack for you and announces messages to screen readers. The message is inserted as text, never as HTML.",
    examples: [
      {
        title: "Toast",
        tall: true,
        html: html`
          <div class="toast">
            <div class="alert alert-success" role="status">Copied to clipboard.</div>
            <div class="alert" role="status">2 files uploaded.</div>
          </div>`,
      },
      {
        title: "From script",
        preview: `<button class="btn" onclick="glimmerToast('Saved.', { type: 'success' })">Save</button>`,
        html: html`
          <button class="btn" id="save">Save</button>

          <script type="module">
            import { toast } from "@glimmer-ui-core/glimmer/behaviors.js";
            document.getElementById("save").onclick = () => toast("Saved.", { type: "success" });
          </script>`,
        js: `import { toast } from "@glimmer-ui-core/glimmer/behaviors.js";

toast("Saved.", { type: "success" });                  // gone after four seconds
toast("Could not save.", { type: "danger" });          // errors interrupt screen readers
const note = toast("Uploading…", { duration: 0 });     // stays until you call note.remove()
toast("Copied.", { top: true, start: true });          // top, at the start edge`,
        react: `import { toast } from "@glimmer-ui-core/glimmer/react";

<button className="btn" onClick={() => toast("Saved.", { type: "success" })}>Save</button>`,
      },
    ],
  },
  {
    slug: "tooltip",
    name: "Tooltip",
    category: "Feedback",
    blurb: "A short label that appears on hover or focus. One attribute, no JavaScript.",
    classes: [["data-tip=\"…\"", "component", "Attribute: the text to show above the element"]],
    note: "Put it on something that can take focus, so keyboard and touch users can reach it. Screen readers do not reliably read text drawn by CSS: load behaviors.js and it copies the tip into the element's accessible name or description, and lets Escape dismiss it. Without the script, add aria-label yourself.",
    examples: [
      {
        title: "Tooltip",
        html: html`
          <button class="btn" data-tip="Copies the share link">Hover or focus me</button>`,
        swift: `Button("Share") {}
    .help("Copies the share link")`,
      },
    ],
  },
  {
    slug: "progress",
    name: "Progress",
    category: "Feedback",
    blurb: "A bar showing how far along something is, using the native element.",
    colors: "progress",
    classes: [["progress", "component", "On a <progress value max>"]],
    examples: [
      {
        title: "Progress bars",
        html: html`
          <div style="display: grid; gap: 0.75rem; width: min(20rem, 100%)">
            <progress class="progress" value="35" max="100" aria-label="Upload"></progress>
            <progress class="progress progress-secondary" value="70" max="100" aria-label="Sync"></progress>
            <progress class="progress progress-success" value="100" max="100" aria-label="Done"></progress>
          </div>`,
        swift: `ProgressView(value: 0.35) // tinted by .glimmerTheme()`,
      },
    ],
  },
  {
    slug: "radial",
    name: "Radial progress",
    category: "Feedback",
    blurb: "Progress drawn as a ring.",
    colors: "radial",
    classes: [
      ["radial", "component", "The ring. Put the label inside"],
      ["--value", "modifier", "CSS variable: 0 to 100"],
    ],
    examples: [
      {
        title: "Radial progress",
        html: html`
          <div class="radial" style="--value: 72" role="progressbar" aria-valuenow="72">72%</div>
          <div class="radial radial-success" style="--value: 100" role="progressbar" aria-valuenow="100">100</div>`,
        swift: `Gauge(value: 0.72) { Text("72") }
    .gaugeStyle(.accessoryCircularCapacity)`,
      },
    ],
  },
  {
    slug: "spinner",
    name: "Spinner",
    category: "Feedback",
    blurb: "A small spinning ring for short waits. It takes the size and colour of the text around it.",
    classes: [["spinner", "component", "The ring"]],
    examples: [
      {
        title: "Spinner",
        html: html`
          <span class="spinner" role="status" aria-label="Loading"></span>
          <span class="spinner" role="status" aria-label="Loading" style="font-size: 1.5rem; color: var(--gl-primary)"></span>`,
        swift: `ProgressView()`,
      },
    ],
  },
  {
    slug: "orb",
    name: "Orb",
    category: "Feedback",
    blurb: "The loading state: a dark sphere with a light travelling around its edge.",
    colors: "orb",
    classes: [
      ["orb", "component", "The sphere. Put a label inside, or leave it empty"],
      ["orb-sm", "size", "Icon-sized"],
      ["--s", "modifier", "CSS variable: the diameter"],
    ],
    examples: [
      {
        title: "Orb with a label",
        tall: true,
        html: html`
          <div class="orb" role="status"><span class="shimmer">Generating</span></div>`,
        swift: `Orb("Generating")`,
      },
      {
        title: "Sizes and colours",
        html: html`
          <div class="orb orb-secondary" role="status" aria-label="Loading" style="--s: 5rem"></div>
          <span class="orb orb-sm" role="status" aria-label="Loading"></span>`,
        swift: `Orb(size: 80, tint: Tokens.secondary)
Orb(size: 20)`,
      },
    ],
  },
  {
    slug: "shimmer",
    name: "Shimmer",
    category: "Feedback",
    blurb: "Text with a highlight sweeping through it, for work in progress.",
    classes: [["shimmer", "component", "On any text element"]],
    examples: [
      {
        title: "Shimmering text",
        html: html`
          <span class="shimmer">Thinking…</span>`,
      },
    ],
  },
  {
    slug: "skeleton",
    name: "Skeleton",
    category: "Feedback",
    blurb: "A placeholder shape that stands in for content while it loads.",
    classes: [["skeleton", "component", "A shimmering block. Size it with width and height"]],
    examples: [
      {
        title: "Skeleton",
        html: html`
          <div style="display: flex; gap: 0.75rem; align-items: center; width: min(20rem, 100%)">
            <div class="skeleton" style="width: 2.5rem; height: 2.5rem; border-radius: 32%"></div>
            <div style="display: grid; gap: 0.5rem; flex: 1">
              <div class="skeleton"></div>
              <div class="skeleton" style="width: 60%"></div>
            </div>
          </div>`,
        swift: `content
    .redacted(reason: .placeholder)`,
      },
    ],
  },
];
