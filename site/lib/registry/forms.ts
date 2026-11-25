import { type Entry, html, icon } from "./types.ts";

export const forms: Entry[] = [
  {
    slug: "input",
    name: "Text input",
    category: "Data input",
    blurb: "A single-line text field.",
    classes: [
      ["input", "component", "Text field"],
      ["input-sm", "size", "Small"],
      ["input-lg", "size", "Large"],
      ["aria-invalid=\"true\"", "state", "Marks the field as invalid"],
      ["disabled", "state", "HTML attribute"],
    ],
    examples: [
      {
        title: "Input",
        html: html`
          <input class="input" type="email" placeholder="you@example.com" aria-label="Email" style="max-width: 20rem">`,
        swift: `TextField("you@example.com", text: $email)
    .glimmerField()`,
      },
      {
        title: "Sizes and states",
        html: html`
          <div style="display: grid; gap: 0.75rem; width: min(20rem, 100%)">
            <input class="input input-sm" placeholder="Small" aria-label="Small">
            <input class="input input-lg" placeholder="Large" aria-label="Large">
            <input class="input" aria-invalid="true" value="not-an-email" aria-label="Invalid">
            <input class="input" disabled placeholder="Disabled" aria-label="Disabled">
          </div>`,
      },
    ],
  },
  {
    slug: "field",
    name: "Field",
    category: "Data input",
    blurb: "A label, a control and an optional hint, stacked.",
    classes: [["field", "component", "A <label> holding a caption <span>, a control and an optional <small> hint"]],
    examples: [
      {
        title: "Field with a hint",
        html: html`
          <label class="field" style="width: min(20rem, 100%)">
            <span>Email</span>
            <input class="input" type="email" placeholder="you@example.com">
            <small>We never share it.</small>
          </label>`,
      },
    ],
  },
  {
    slug: "fieldset",
    name: "Fieldset",
    category: "Data input",
    blurb: "Groups related fields under a legend.",
    classes: [["fieldset", "component", "A <fieldset> with a bordered frame and a mono legend"]],
    examples: [
      {
        title: "Fieldset",
        html: html`
          <fieldset class="fieldset" style="width: min(22rem, 100%)">
            <legend>Profile</legend>
            <label class="field"><span>Name</span><input class="input" placeholder="Ada Lovelace"></label>
            <label class="field"><span>Role</span><input class="input" placeholder="Engineer"></label>
          </fieldset>`,
      },
    ],
  },
  {
    slug: "textarea",
    name: "Textarea",
    category: "Data input",
    blurb: "A multi-line text field.",
    classes: [["textarea", "component", "Multi-line field, resizable vertically"]],
    examples: [
      {
        title: "Textarea",
        html: html`
          <textarea class="textarea" placeholder="Anything else?" aria-label="Notes" style="max-width: 22rem"></textarea>`,
        swift: `TextEditor(text: $notes)
    .glimmerField()`,
      },
    ],
  },
  {
    slug: "select",
    name: "Select",
    category: "Data input",
    blurb: "Picks one value from a list, using the native control.",
    classes: [["select", "component", "A styled native <select>"]],
    examples: [
      {
        title: "Select",
        html: html`
          <select class="select" aria-label="Plan" style="max-width: 16rem">
            <option>Free</option>
            <option>Pro</option>
            <option>Team</option>
          </select>`,
        swift: `Picker("Plan", selection: $plan) {
    Text("Free").tag(0)
    Text("Pro").tag(1)
}`,
      },
    ],
  },
  {
    slug: "checkbox",
    name: "Checkbox",
    category: "Data input",
    blurb: "Selects or deselects a value.",
    colors: "checkbox",
    classes: [["checkbox", "component", "A styled <input type=checkbox>"]],
    examples: [
      {
        title: "Checkboxes",
        html: html`
          <label style="display: flex; align-items: center; gap: 0.5rem"><input class="checkbox" type="checkbox" checked> Checkbox</label>
          <label style="display: flex; align-items: center; gap: 0.5rem"><input class="checkbox checkbox-secondary" type="checkbox" checked> Secondary</label>
          <label style="display: flex; align-items: center; gap: 0.5rem"><input class="checkbox" type="checkbox" disabled> Disabled</label>`,
      },
    ],
  },
  {
    slug: "radio",
    name: "Radio",
    category: "Data input",
    blurb: "Picks one option from a set.",
    colors: "radio",
    classes: [["radio", "component", "A styled <input type=radio>"]],
    examples: [
      {
        title: "Radios",
        html: html`
          <label style="display: flex; align-items: center; gap: 0.5rem"><input class="radio" type="radio" name="radio-demo" checked> One</label>
          <label style="display: flex; align-items: center; gap: 0.5rem"><input class="radio" type="radio" name="radio-demo"> Two</label>
          <label style="display: flex; align-items: center; gap: 0.5rem"><input class="radio radio-success" type="radio" name="radio-demo"> Three</label>`,
      },
    ],
  },
  {
    slug: "toggle",
    name: "Toggle",
    category: "Data input",
    blurb: "A checkbox styled as a switch.",
    colors: "toggle",
    classes: [["toggle", "component", "A styled <input type=checkbox> that looks like a switch"]],
    examples: [
      {
        title: "Toggles",
        html: html`
          <label style="display: flex; align-items: center; gap: 0.5rem"><input class="toggle" type="checkbox" checked> Toggle</label>
          <label style="display: flex; align-items: center; gap: 0.5rem"><input class="toggle toggle-success" type="checkbox" checked> Success</label>
          <label style="display: flex; align-items: center; gap: 0.5rem"><input class="toggle" type="checkbox"> Off</label>`,
        swift: `Toggle("Toggle", isOn: $on) // tinted by .glimmerTheme()`,
      },
    ],
  },
  {
    slug: "range",
    name: "Range",
    category: "Data input",
    blurb: "A slider for picking a value, using the native control with the accent colour.",
    colors: "range",
    classes: [["range", "component", "A tinted native <input type=range>"]],
    examples: [
      {
        title: "Range slider",
        html: html`
          <input class="range" type="range" value="60" aria-label="Volume" style="max-width: 18rem">
          <input class="range range-secondary" type="range" value="30" aria-label="Balance" style="max-width: 18rem">`,
        swift: `Slider(value: $volume) // tinted by .glimmerTheme()`,
      },
    ],
  },
  {
    slug: "file-input",
    name: "File input",
    category: "Data input",
    blurb: "A file picker whose button matches the kit.",
    classes: [["file-input", "component", "A styled <input type=file>"]],
    examples: [
      {
        title: "File input",
        html: html`
          <input class="file-input" type="file" aria-label="Upload">`,
      },
    ],
  },
  {
    slug: "search",
    name: "Search",
    category: "Data input",
    blurb: "The glass search pill. Pair it with a menu underneath for suggestions.",
    classes: [
      ["search", "component", "A <label> holding an icon, an <input> and an optional clear button"],
      ["data-filter=\"#list-id\"", "part", "With behaviors.js loaded: on the input. Hides the <li>s of that list that do not contain what is typed"],
      ["data-clear", "part", "With behaviors.js loaded: on the button. Empties the field"],
    ],
    note: "Filtering a list already on the page needs behaviors.js. Searching a server is yours to write: listen for the input event and fill the menu.",
    examples: [
      {
        title: "Search with results",
        tall: true,
        html: html`
          <div style="display: grid; gap: 0.625rem; width: min(26rem, 100%)">
            <label class="search glow">
              ${icon.search}
              <input type="search" placeholder="Type to filter" aria-label="Search" data-filter="#search-results">
              <button class="btn btn-ghost btn-circle btn-sm" type="button" aria-label="Clear" data-clear>${icon.close}</button>
            </label>
            <ul class="menu glass glow" id="search-results">
              <li><a href="#">${icon.photo} Photos <span class="meta">2,418</span></a></li>
              <li><a href="#">${icon.pin} Places <span class="meta">36</span></a></li>
              <li><a href="#">${icon.doc} Stories <span class="meta">112</span></a></li>
            </ul>
          </div>`,
        swift: `SearchField(text: $query)

VStack(spacing: 0) {
    MenuRow("Photos", systemImage: "photo", meta: "2,418")
    MenuRow("Places", systemImage: "mappin.and.ellipse", meta: "36")
}
.padding(6)
.glass()`,
      },
    ],
  },
  {
    slug: "rating",
    name: "Rating",
    category: "Data input",
    blurb: "A row of radio buttons drawn as stars that fill up to the chosen one.",
    colors: "rating",
    classes: [["rating", "component", "Container for the radio inputs. The checked one and all before it are lit"]],
    examples: [
      {
        title: "Star rating",
        html: html`
          <div class="rating">
            <input type="radio" name="rating-demo" aria-label="1 star">
            <input type="radio" name="rating-demo" aria-label="2 stars">
            <input type="radio" name="rating-demo" aria-label="3 stars">
            <input type="radio" name="rating-demo" aria-label="4 stars" checked>
            <input type="radio" name="rating-demo" aria-label="5 stars">
          </div>`,
      },
      {
        title: "Coloured",
        html: html`
          <div class="rating rating-primary">
            <input type="radio" name="rating-demo-2" aria-label="1 star">
            <input type="radio" name="rating-demo-2" aria-label="2 stars" checked>
            <input type="radio" name="rating-demo-2" aria-label="3 stars">
            <input type="radio" name="rating-demo-2" aria-label="4 stars">
            <input type="radio" name="rating-demo-2" aria-label="5 stars">
          </div>`,
      },
    ],
  },
  {
    slug: "kbd",
    name: "Kbd",
    category: "Data input",
    blurb: "Shows a keyboard key or shortcut.",
    classes: [["kbd", "component", "A keycap"]],
    examples: [
      {
        title: "Shortcut",
        html: html`
          <span>Press <kbd class="kbd">⌘</kbd> <kbd class="kbd">K</kbd> to search</span>`,
      },
    ],
  },
];
