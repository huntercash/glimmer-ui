# To do

## Not done yet
- **Cross-browser testing.** Only checked in Chromium. Test Safari and Firefox: anchor positioning (popover), `oklch(from …)`, `@property`, `backdrop-filter`, `:dir()`, `color-mix`, the `<gl-chart>` element (private class fields, `ResizeObserver`, pointer capture).
- **Scroll performance.** Not measured. The in-app browser throttles a hidden pane to one frame a second, so frame times from it mean nothing. Measure with the pane in view, or in Chrome's performance panel, on `/components/all` (40 glass surfaces, 21 charts, about 3,200 elements) at frost 1, 3 and 5.
- **Print and Windows high contrast.** The rules are written (`css/media.css`, and the print block in `css/tokens.css`) but have not been seen on paper or in forced-colours mode.
- **Visual regression tests.** None. Needs Playwright (not installed here) and a set of baseline screenshots.
- **Accessibility audit.** Text on clear glass gets a halo, and accent-coloured text is darkened in the light theme, but contrast is not measured. Test with a screen reader.
- **npm name.** `glimmer-ui` on npm is someone else's package, so publishing needs another name (a scope such as `@huntercash/glimmer-ui`, or a new name). Every import in the docs (`glimmer-ui/...`) follows the `name` in `package.json`, so they change with it. Until then the docs install from GitHub.
- **Tag a release.** The Swift package instructions track `main` because no version tag exists.

## Known limits
- Pie, donut and heatmap are fixed-size drawings, so their text shrinks on narrow screens.
- Chart time axes are in UTC.
- Candlestick, OHLC, RSI and MACD charts space candles by position, not by date.
- Toasts do not pause on hover; pass `duration: 0` and remove them yourself if that matters.
- In Swift, rising candles are lightly filled rather than hollow (Swift Charts cannot outline a bar).
- The native range slider keeps a dark track in the light theme in Chromium, which picks the track to contrast with the accent colour.
- No version history or stability promise yet.

## Measured on 2026-11-24
- Drawing a 500-candle chart with two averages and Bollinger bands: 4.6 ms (Node 22, Apple silicon). A 60-candle window of it: 0.6 ms.
- Compressed sizes: all CSS 18 kB, `charts.js` 14 kB, `behaviors.js` 3 kB. Fonts are a separate, optional 790 kB.
