import { type Entry, html, icon } from "./types.ts";

export const actions: Entry[] = [
  {
    slug: "button",
    name: "Button",
    category: "Actions",
    blurb: "Buttons let people take an action or make a choice.",
    colors: "btn",
    classes: [
      ["btn", "component", "A glass button with an edge light; the colour class sets the light. Follows the frost level. Works on <button>, <a> and <input type=submit>"],
      ["btn-outline", "modifier", "Edge light only, no glass body"],
      ["btn-ghost", "modifier", "No ring or body; a faint tint of its colour on hover"],
      ["btn-sm", "size", "Small"],
      ["btn-lg", "size", "Large"],
      ["btn-circle", "modifier", "A round, square-proportioned button for a single icon"],
      ["btn-block", "modifier", "Full width"],
      ["disabled", "state", "HTML attribute (or aria-disabled=\"true\" on links)"],
      ["aria-busy=\"true\"", "state", "Shows a spinner and blocks clicks"],
    ],
    examples: [
      {
        title: "Colours",
        html: html`
          <button class="btn">Default</button>
          <button class="btn btn-primary">Primary</button>
          <button class="btn btn-secondary">Secondary</button>
          <button class="btn btn-success">Success</button>
          <button class="btn btn-warning">Warning</button>
          <button class="btn btn-danger">Danger</button>`,
        swift: `Button("Default") {}.buttonStyle(.glimmer)
Button("Primary") {}.buttonStyle(.glimmer(.primary))
Button("Danger") {}.buttonStyle(.glimmer(.danger))`,
      },
      {
        title: "Outline and ghost",
        html: html`
          <button class="btn btn-outline">Outline</button>
          <button class="btn btn-outline btn-primary">Outline primary</button>
          <button class="btn btn-ghost">Ghost</button>
          <button class="btn btn-ghost btn-secondary">Ghost secondary</button>`,
        swift: `Button("Outline") {}.buttonStyle(.glimmer(.outline(Tokens.primary)))
Button("Ghost") {}.buttonStyle(.glimmer(.ghost(Tokens.secondary)))`,
      },
      {
        title: "Sizes and shapes",
        html: html`
          <button class="btn btn-sm">Small</button>
          <button class="btn">Medium</button>
          <button class="btn btn-lg">Large</button>
          <button class="btn btn-circle" aria-label="Notifications">${icon.bell}</button>`,
      },
      {
        title: "Disabled and busy",
        html: html`
          <button class="btn" disabled>Disabled</button>
          <button class="btn btn-primary" aria-busy="true">Saving</button>`,
        swift: `Button("Disabled") {}
    .buttonStyle(.glimmer)
    .disabled(true)`,
      },
    ],
  },
  {
    slug: "join",
    name: "Join",
    category: "Actions",
    blurb: "Fuses adjacent buttons or inputs into one control: button groups, pagination, an input with its button.",
    classes: [["join", "component", "Container. Rounds the first and last child and squares the rest"]],
    examples: [
      {
        title: "Button group",
        html: html`
          <div class="join">
            <button class="btn">Day</button>
            <button class="btn">Week</button>
            <button class="btn">Month</button>
          </div>`,
      },
      {
        title: "Input with a button",
        html: html`
          <div class="join" style="width: min(22rem, 100%)">
            <input class="input" placeholder="Invite by email" aria-label="Email">
            <button class="btn btn-primary">Send</button>
          </div>`,
      },
    ],
  },
  {
    slug: "link",
    name: "Link",
    category: "Actions",
    blurb: "An underlined text link in the accent colour.",
    colors: "link",
    classes: [["link", "component", "Coloured, underlined link"]],
    examples: [
      {
        title: "Links",
        html: html`
          <a class="link" href="#">A link</a>
          <a class="link link-secondary" href="#">Secondary link</a>`,
      },
    ],
  },
  {
    slug: "swap",
    name: "Swap",
    category: "Actions",
    blurb: "Flips between two elements when its hidden checkbox is toggled. No JavaScript.",
    classes: [
      ["swap", "component", "A <label> wrapping a checkbox and the two states"],
      ["swap-on", "part", "Shown while the checkbox is checked"],
      ["swap-off", "part", "Shown while it is not"],
    ],
    examples: [
      {
        title: "Icon swap",
        html: html`
          <label class="swap btn btn-circle" aria-label="Toggle theme">
            <input type="checkbox">
            <span class="swap-on">${icon.moon}</span>
            <span class="swap-off">${icon.sun}</span>
          </label>`,
      },
      {
        title: "Text swap",
        html: html`
          <label class="swap">
            <input type="checkbox">
            <span class="swap-on badge badge-success">Online</span>
            <span class="swap-off badge">Offline</span>
          </label>`,
      },
    ],
  },
];
