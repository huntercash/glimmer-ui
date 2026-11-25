import { actions } from "./actions.ts";
import { charts } from "./charts.ts";
import { display } from "./display.ts";
import { feedback } from "./feedback.ts";
import { forms } from "./forms.ts";
import { navigation } from "./navigation.ts";
import { layout, mockup, overlay } from "./rest.ts";
import { surface } from "./surface.ts";
import { categories, type Entry } from "./types.ts";

export * from "./types.ts";

/** Every component, in sidebar order. */
export const entries: Entry[] = [...surface, ...actions, ...forms, ...display, ...feedback, ...charts, ...navigation, ...overlay, ...layout, ...mockup];

export const byCategory = categories.map((category) => ({ category, entries: entries.filter((e) => e.category === category) }));

export const findEntry = (slug: string) => entries.find((e) => e.slug === slug);
