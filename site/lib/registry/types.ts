export const categories = [
  "Surface",
  "Actions",
  "Data input",
  "Data display",
  "Feedback",
  "Charts",
  "Navigation",
  "Overlay",
  "Layout",
  "Mockup",
] as const;
export type Category = (typeof categories)[number];

export type ClassKind = "component" | "part" | "modifier" | "size" | "state";
/** [class or attribute, kind, what it does] */
export type ClassDoc = [name: string, kind: ClassKind, note: string];

export type Example = {
  title: string;
  /** Rendered as the live preview and shown verbatim in the code box. */
  html: string;
  /** Markup for the live preview when it should differ from the code shown (charts are drawn on the server). */
  preview?: string;
  /** The same thing as a JavaScript call, for components that have one. */
  js?: string;
  /** The same thing with the React components from @glimmer-ui-core/glimmer/react, for the few components that have one. */
  react?: string;
  /** The SwiftUI equivalent, when the Swift package has one. */
  swift?: string;
  /** "block" stops the preview centring its content; use it for full-width components. */
  layout?: "block";
  /** Gives the preview extra height, for fixed or tall components. */
  tall?: boolean;
};

export type Entry = {
  slug: string;
  name: string;
  category: Category;
  blurb: string;
  classes: ClassDoc[];
  /** Base class that takes the -primary … -danger colour suffixes, if any. */
  colors?: string;
  examples: Example[];
  /** Shown under the class table. */
  note?: string;
};

export const colorNames = ["primary", "secondary", "success", "warning", "danger"] as const;

/** Strips the common indentation from a template literal so snippets read cleanly in the code box. */
export function html(strings: TemplateStringsArray, ...values: string[]): string {
  const raw = strings.reduce((out, s, i) => out + s + (values[i] ?? ""), "");
  const lines = raw.replace(/^\n/, "").trimEnd().split("\n");
  const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => /^ */.exec(l)![0].length));
  return lines.map((l) => l.slice(indent)).join("\n");
}

const svg = (paths: string) =>
  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

/** Inline icons, so every example is copy-pasteable with no sprite sheet. */
export const icon = {
  search: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
  close: svg('<path d="m6 6 12 12M18 6 6 18"/>'),
  arrow: svg('<path d="M7 17 17 7M8 7h9v9"/>'),
  photo: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m3 16 5-5 4 4 3-3 6 6"/>'),
  pin: svg('<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.800 7 11 7 11z"/><circle cx="12" cy="10" r="2.500"/>'),
  doc: svg('<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 10h8M8 14h8"/>'),
  home: svg('<path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'),
  user: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
  bell: svg('<path d="M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7zm4 11a2 2 0 0 0 4 0"/>'),
  sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.900 4.900l1.400 1.400m11.400 11.400 1.400 1.400M2 12h2m16 0h2M4.900 19.100l1.400-1.400M17.700 6.300l1.400-1.400"/>'),
  moon: svg('<path d="M20 14.500A8 8 0 0 1 9.500 4a8 8 0 1 0 10.500 10.500z"/>'),
};
