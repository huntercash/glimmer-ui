import type { Theme } from "./theme";

const frostNames = ["clear glass", "barely frosted", "lightly frosted", "frosted", "milky"];

/** A prompt someone can paste into an AI coding agent to set Glimmer up with the theme they picked on this site. */
export function buildPrompt({ frost, primary, secondary, light }: Theme): string {
  return `Set up the Glimmer UI kit in this project and use it for all UI. Docs and every component: https://glimmer-ui.com

1. Install it:
   npm i @glimmer-ui-core/glimmer

2. Import it in the main stylesheet. With Tailwind CSS v4, put it straight after Tailwind:
   @import "tailwindcss";
   @import "@glimmer-ui-core/glimmer";
   Without Tailwind, use: @import "@glimmer-ui-core/glimmer/css/index.css";
   Optional extras: @import "@glimmer-ui-core/glimmer/css/fonts.css"; for the bundled SUIT and Fragment Mono fonts, and (Tailwind only)
   @import "@glimmer-ui-core/glimmer/css/tailwind.css"; so variants such as md:btn-lg and hover:btn-primary work.
   If the project already uses class names like .btn or .card, import "@glimmer-ui-core/glimmer/css/prefixed.css" instead and write every class with a gl- prefix.

3. Apply this theme. Add class="frost-${frost}" (${frostNames[frost - 1]})${light ? ' and data-theme="light"' : ""} to the <html> element, and add this to the main stylesheet:
   :root {
     --gl-primary: ${primary};
     --gl-secondary: ${secondary};
   }

4. Load the two small scripts once on the client:
   import "@glimmer-ui-core/glimmer/glow.js";       // light follows the pointer on .glow surfaces
   import "@glimmer-ui-core/glimmer/behaviors.js";  // tab panels, toast(), carousel buttons, list filtering, tooltip accessibility

5. Build with Glimmer's classes instead of writing custom CSS:
   - One class makes a component, on the natural HTML element: btn, card, input, select, toggle, badge, alert, tabs, navbar, menu, modal and drawer (on <dialog>), popover (on an element with the popover attribute).
   - A suffix sets the colour: -primary, -secondary, -success, -warning, -danger. For example btn-primary, badge-success.
   - State comes from HTML attributes, not classes: disabled, open, aria-busy, aria-invalid, aria-selected, aria-current, data-done.
   - Any element becomes a glass panel with the class "glass". Add "glow" and its light follows the pointer.
   - For charts, import from "@glimmer-ui-core/glimmer/charts.js" (lineChart, barChart, candlestickChart, chordDiagram and more), or use <gl-chart type="..." data='...'> (add the zoom attribute to let people zoom and pan).
   - In React, the classes go on plain elements (<button className="btn btn-primary">). Only the parts with behaviour have components: import { Chart, Tabs, Modal, Drawer, toast } from "@glimmer-ui-core/glimmer/react".

6. Each component's markup is documented in the comment above its rule in node_modules/@glimmer-ui-core/glimmer/css/*.css, each chart in node_modules/@glimmer-ui-core/glimmer/charts.js, and each behaviour in node_modules/@glimmer-ui-core/glimmer/behaviors.js. Read those before writing a component, and do not invent class names.`;
}
