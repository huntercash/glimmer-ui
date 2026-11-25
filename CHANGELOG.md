# Changelog

Every release of Glimmer, newest first. The docs site shows this file at glimmer-ui.com/changelog.
Each entry is a `## version · date` heading followed by a flat list. Start a line with
`Docs:` or `Swift:` when the change is not in the web kit.

## Unreleased

- Sidebar: a column of menus that folds to a rail of icons, with search (⌘K), rows you can drag between lists, and a handle on its edge. Needs `behaviors.js`.
- Swift: `Sidebar`, the same thing in SwiftUI: bind your sections, the selection and whether it is folded.
- Menu rows can be a `<label>`, so a row can hold a toggle.

## 0.1.0 · 2026-11-25

- First public version: glass surfaces, five frost levels, and component classes in plain CSS, usable alone or after Tailwind CSS v4.
- `charts.js`: the `<gl-chart>` element with line, area, bar, pie, donut, heatmap, candlestick, OHLC, RSI and MACD charts.
- `behaviors.js`, `glow.js` and a React wrapper for the few things CSS cannot do, all with type definitions.
- Swift: a matching SwiftUI package with the same tokens, surfaces, components and charts.
- Docs: the site at glimmer-ui.com, with one page per component and a live example on each.
- Published to npm as `@glimmer-ui-core/glimmer`.
- Swift: tagged `v0.1.0`, so the package manifest can pin a version instead of tracking `main`.
