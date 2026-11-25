import { chart } from "../../../charts.js";
import type { ClassDoc, Entry, Example } from "./types.ts";

// Sample data, shared with the home page.
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];

/** Sixty trading days of made-up prices: a fixed pseudo-random walk, so every build draws the same chart. */
function candles() {
  let seed = 7, price = 182;
  const random = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const day = new Date(Date.UTC(2026, 9, 1));
  const out = [];
  while (out.length < 60) {
    day.setUTCDate(day.getUTCDate() + 1);
    if (day.getUTCDay() === 0 || day.getUTCDay() === 6) continue;
    const open = price, close = +(open + (random() - 0.46) * 9).toFixed(2);
    const high = +(Math.max(open, close) + random() * 4).toFixed(2), low = +(Math.min(open, close) - random() * 4).toFixed(2);
    out.push({ date: day.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }), open: +open.toFixed(2), high, low, close, volume: Math.round(40 + random() * 60 + Math.abs(close - open) * 12) });
    price = close;
  }
  return out;
}
/** Ninety days of readings with two weeks missing, to show that a time axis keeps the gap. */
function readings() {
  let seed = 11, value = 52;
  const random = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const times: string[] = [], values: number[] = [];
  for (let i = 0; i < 90; i++) {
    value += (random() - 0.47) * 6;
    if (i < 40 || i > 53) {
      times.push(new Date(Date.UTC(2026, 6, 1 + i)).toISOString().slice(0, 10));
      values.push(+value.toFixed(1));
    }
  }
  return { times, series: [{ name: "Reading", values }] };
}
export const sample = {
  time: readings(),
  line: {
    labels: months,
    series: [
      { name: "Visits", values: [120, 180, 160, 240, 300, 280, 360, 420] },
      { name: "Sign-ups", values: [40, 60, 90, 80, 140, 170, 160, 230] },
    ],
  },
  bar: {
    labels: ["Q1", "Q2", "Q3", "Q4"],
    series: [
      { name: "2025", values: [42, 58, 51, 73] },
      { name: "2026", values: [55, 64, 80, 96] },
    ],
  },
  scatter: {
    series: [
      { name: "Control", points: [[28, 41], [33, 52], [36, 38], [39, 57], [41, 46], [44, 61], [46, 49], [49, 55], [52, 44], [55, 63]] },
      { name: "Variant", points: [[51, 62], [55, 71], [58, 66], [60, 79], [63, 70], [65, 84], [68, 73], [70, 88], [73, 77], [76, 91]] },
    ],
  },
  histogram: {
    values: [152, 155, 158, 159, 161, 162, 163, 164, 165, 165, 166, 167, 167, 168, 168, 169, 169, 170, 170, 170, 171, 171, 172, 172, 173, 174, 174, 175, 176, 177, 178, 179, 181, 183, 186, 190],
  },
  box: {
    groups: [
      { name: "Tokyo", values: [48, 52, 55, 58, 60, 61, 63, 64, 66, 69, 72, 98] },
      { name: "Osaka", values: [31, 40, 44, 49, 52, 55, 57, 60, 63, 68, 75] },
      { name: "Kyoto", values: [41, 62, 65, 67, 69, 70, 71, 72, 74, 76, 79, 85] },
      { name: "Nara", values: [32, 38, 42, 45, 47, 49, 51, 54, 58, 63, 70] },
    ],
  },
  heatmap: {
    rows: ["Price", "Size", "Age", "Rooms", "Dist"],
    columns: ["Price", "Size", "Age", "Rooms", "Dist"],
    values: [
      [1, 0.82, -0.35, 0.74, -0.52],
      [0.82, 1, -0.12, 0.88, -0.2],
      [-0.35, -0.12, 1, -0.08, 0.31],
      [0.74, 0.88, -0.08, 1, -0.15],
      [-0.52, -0.2, 0.31, -0.15, 1],
    ],
  },
  pie: {
    slices: [
      { name: "Photos", value: 2418 },
      { name: "Videos", value: 940 },
      { name: "Stories", value: 512 },
      { name: "Other", value: 230 },
    ],
  },
  spark: [3, 5, 4, 7, 6, 9, 8, 12, 11, 15],
  radar: {
    axes: ["Speed", "Reliability", "Comfort", "Safety", "Efficiency", "Price"],
    series: [
      { name: "Model A", values: [82, 64, 70, 90, 58, 45] },
      { name: "Model B", values: [55, 88, 84, 72, 80, 70] },
    ],
  },
  stock: { candles: candles() },
  chord: {
    names: ["Design", "Engineering", "Product", "Sales", "Support", "Data"],
    matrix: [
      [0, 42, 28, 6, 4, 10],
      [38, 0, 35, 5, 18, 26],
      [24, 40, 0, 22, 12, 20],
      [4, 6, 30, 0, 25, 8],
      [3, 22, 14, 20, 0, 5],
      [8, 30, 24, 10, 4, 0],
    ],
  },
};

const attr = (value: unknown) => JSON.stringify(value).replace(/'/g, "&#39;");
/** Charts over many items are worth zooming into. */
const zoomable = (type: string, data: unknown) => ["candlestick", "ohlc", "rsi", "macd"].includes(type) || "times" in (data as object);
const tag = (type: string, data: unknown, options: Record<string, unknown> | undefined, inner = "") =>
  `<gl-chart type="${type}"${zoomable(type, data) ? " zoom" : ""} data='${attr(data)}'${options ? ` options='${attr(options)}'` : ""}>${inner}</gl-chart>`;

/** The tag with the chart already drawn inside it: it shows before any script loads, then <gl-chart> takes over
    and redraws it at its real width with the crosshair. */
// The registry holds every chart type in one list, so the type and its data are not paired at compile time; chart() checks the name at run time.
const draw = chart as (type: string, data: unknown, options?: Record<string, unknown>) => string;
export const interactive = (type: string, data: unknown, options?: Record<string, unknown>) => tag(type, data, options, draw(type, data, options));

/** One example from one data object: the live preview, the tag to copy, the function call and the React component. */
function example(title: string, type: string, fn: string, data: unknown, options?: Record<string, unknown>, swift?: string): Example {
  const pretty = JSON.stringify(data, null, 2).replace(/\[\s+([^[\]{}]*?)\s+\]/g, (_, inner: string) => `[${inner.replace(/\s+/g, " ")}]`);
  return {
    title,
    layout: "block",
    preview: interactive(type, data, options),
    html: `<script type="module" src="node_modules/glimmer-ui/charts.js"></script>\n\n${tag(type, data, options)}`,
    js: `import { ${fn} } from "glimmer-ui/charts.js";\n\nelement.innerHTML = ${fn}(${pretty}${options ? `, ${JSON.stringify(options)}` : ""});`,
    react: `import { Chart } from "glimmer-ui/react";\n\nconst data = ${pretty};\n\n<Chart type="${type}" data={data}${options ? ` options={${JSON.stringify(options)}}` : ""}${zoomable(type, data) ? " zoom" : ""} />`,
    swift,
  };
}

const common: ClassDoc[] = [
  ["{ width, height }", "modifier", "Option: the drawing's proportions. It always scales to the width of its container"],
  ["{ label }", "modifier", "Option: a description read out by screen readers"],
];

export const charts: Entry[] = [
  {
    slug: "charts",
    name: "Charts overview",
    category: "Charts",
    blurb: "Fifteen chart types, from line and bar to candlesticks, RSI, MACD and chord diagrams, drawn as SVG by small dependency-free functions and styled by the kit, so they pick up your colours and glow like everything else.",
    classes: [
      ["<gl-chart type data options>", "component", "A tag for plain HTML. Load charts.js once as a module and it draws itself at its own width, so text stays the same size on a phone"],
      ["<gl-chart zoom>", "modifier", "Attribute: charts over labels, times or candles zoom (pinch, Ctrl + wheel, + and −), pan (drag, Shift + arrows) and reset (double-click, 0)"],
      ["<Chart type data options zoom />", "component", "The React component, from glimmer-ui/react. Drawn on the server, interactive in the browser"],
      ["chart(type, data, options)", "component", "The same thing as a function that returns an SVG string. Works on a server or in the browser"],
      ["chart", "component", "The class on every chart's <svg>, if you want to style them yourself"],
      ["--chart-1 … --chart-8", "modifier", "CSS variables: the series colours. The first five are the accent tokens, the rest are blends"],
      ["{ window: [start, end] }", "modifier", "Option: draw only that slice of the data. This is what zooming sets; indicators are still worked out from all of it"],
    ],
    note: "In <gl-chart>, charts with axes show a crosshair with the values under the pointer; the arrow keys move it and Escape hides it. As a plain SVG string, every mark has a native tooltip instead. Put a chart in a card for a glass panel. On Apple platforms, use Swift Charts with .glimmerChartStyle(); the chord diagram is the one chart Glimmer draws itself there.",
    examples: [
      example("In plain HTML or JavaScript", "bar", "barChart", sample.bar, undefined, `import Charts

Chart(sales) { item in
    BarMark(x: .value("Quarter", item.quarter), y: .value("Sales", item.value))
        .foregroundStyle(by: .value("Year", item.year))
        .position(by: .value("Year", item.year))
}
.glimmerChartStyle()`),
    ],
  },
  {
    slug: "line-chart",
    name: "Line chart",
    category: "Charts",
    blurb: "How one or more values change across ordered categories, usually time.",
    classes: [
      ["lineChart(data, options)", "component", "data: { labels, series: [{ name, values }] }"],
      ["{ times, series }", "modifier", "Data: give a date, ISO string or millisecond number per value instead of labels for a real time axis. Points sit where their time falls, so gaps in the data show as gaps. Ticks are in UTC"],
      ["{ smooth: true }", "modifier", "Option: draw curves that pass through every point without overshooting"],
      ["{ zero: true }", "modifier", "Option: start the y axis at zero instead of fitting it to the data"],
      ...common,
    ],
    examples: [
      example("Two series", "line", "lineChart", sample.line, undefined, `Chart(points) { point in
    LineMark(x: .value("Month", point.month), y: .value("Count", point.value))
        .foregroundStyle(by: .value("Series", point.series))
}
.glimmerChartStyle()`),
      example("Smooth", "line", "lineChart", sample.line, { smooth: true }, `Chart(points) { point in
    LineMark(x: .value("Month", point.month), y: .value("Count", point.value))
        .foregroundStyle(by: .value("Series", point.series))
        .interpolationMethod(.monotone)
}
.glimmerChartStyle()`),
      example("Over time, with a gap in the data", "line", "lineChart", sample.time, { smooth: true }, `Chart(readings) { reading in
    LineMark(x: .value("Day", reading.date), y: .value("Reading", reading.value))
}
.glimmerChartStyle()`),
    ],
  },
  {
    slug: "area-chart",
    name: "Area chart",
    category: "Charts",
    blurb: "A line chart with the space under each line filled, for showing volume as well as trend.",
    classes: [["areaChart(data, options)", "component", "Same data as lineChart. The y axis starts at zero"], ...common],
    examples: [
      example("Filled lines", "area", "areaChart", sample.line, undefined, `Chart(points) { point in
    AreaMark(x: .value("Month", point.month), y: .value("Count", point.value))
        .foregroundStyle(by: .value("Series", point.series))
        .opacity(0.3)
}
.glimmerChartStyle()`),
    ],
  },
  {
    slug: "bar-chart",
    name: "Bar chart",
    category: "Charts",
    blurb: "Compares amounts across categories. More than one series puts the bars side by side.",
    classes: [
      ["barChart(data, options)", "component", "data: { labels, series: [{ name, values }] }"],
      ["{ stacked: true }", "modifier", "Option: put each series on top of the last instead of beside it (for non-negative values)"],
      ...common,
    ],
    examples: [
      example("Grouped bars", "bar", "barChart", sample.bar, undefined, `Chart(sales) { item in
    BarMark(x: .value("Quarter", item.quarter), y: .value("Sales", item.value))
        .foregroundStyle(by: .value("Year", item.year))
        .position(by: .value("Year", item.year))
}
.glimmerChartStyle()`),
      example("Stacked", "bar", "barChart", sample.bar, { stacked: true }, `Chart(sales) { item in
    BarMark(x: .value("Quarter", item.quarter), y: .value("Sales", item.value))
        .foregroundStyle(by: .value("Year", item.year))
}
.glimmerChartStyle()`),
    ],
  },
  {
    slug: "scatter-chart",
    name: "Scatter plot",
    category: "Charts",
    blurb: "Points on two numeric axes, for seeing how two measurements relate.",
    classes: [
      ["scatterChart(data, options)", "component", "data: { series: [{ name, points: [[x, y], …] }] }"],
      ["{ radius }", "modifier", "Option: point size (default 4)"],
      ...common,
    ],
    examples: [
      example("Two groups", "scatter", "scatterChart", sample.scatter, undefined, `Chart(samples) { sample in
    PointMark(x: .value("Dose", sample.x), y: .value("Response", sample.y))
        .foregroundStyle(by: .value("Group", sample.group))
}
.glimmerChartStyle()`),
    ],
  },
  {
    slug: "histogram",
    name: "Histogram",
    category: "Charts",
    blurb: "How a set of values is distributed, counted into round-numbered bins.",
    classes: [
      ["histogram(data, options)", "component", "data: { values }. Bin edges are chosen for you at round numbers"],
      ["{ bins }", "modifier", "Option: roughly how many bins to aim for"],
      ...common,
    ],
    examples: [
      example("Distribution of heights", "histogram", "histogram", sample.histogram, undefined, `let bins = NumberBins(data: heights, desiredCount: 8)
let counts = Dictionary(grouping: heights, by: bins.index)
    .map { (range: bins[$0.key], count: $0.value.count) }

Chart(counts, id: \\.range.lowerBound) { bin in
    BarMark(x: .value("Height", bin.range), y: .value("Count", bin.count))
}
.glimmerChartStyle()`),
    ],
  },
  {
    slug: "box-plot",
    name: "Box plot",
    category: "Charts",
    blurb: "Summarises each group by its median, quartiles and range, with outliers shown as dots.",
    classes: [
      ["boxPlot(data, options)", "component", "data: { groups: [{ name, values }] }. Whiskers reach 1.5 × the interquartile range"],
      ["boxStats(values)", "component", "The numbers behind one box: q1, median, q3, low, high and outliers"],
      ...common,
    ],
    examples: [example("Four groups", "box", "boxPlot", sample.box)],
  },
  {
    slug: "heatmap",
    name: "Heatmap",
    category: "Charts",
    blurb: "A grid shaded by value. Negative values take the second colour, which makes it a ready-made correlation matrix.",
    classes: [
      ["heatmap(data, options)", "component", "data: { rows, columns, values: [[…], …] }"],
      ["{ values: false }", "modifier", "Option: hide the number in each cell"],
      ["{ cell }", "modifier", "Option: cell size (default 46)"],
      ["{ label }", "modifier", "Option: a description read out by screen readers"],
    ],
    examples: [
      example("Correlation matrix", "heatmap", "heatmap", sample.heatmap, undefined, `Chart(cells) { cell in
    RectangleMark(x: .value("Column", cell.column), y: .value("Row", cell.row))
        .foregroundStyle(Tokens.primary.opacity(abs(cell.value)))
}
.glimmerChartStyle()`),
    ],
  },
  {
    slug: "pie-chart",
    name: "Pie and donut",
    category: "Charts",
    blurb: "Parts of a whole. The donut leaves room for a headline number in the middle.",
    classes: [
      ["pieChart(data, options)", "component", "data: { slices: [{ name, value }] }"],
      ["{ donut: true }", "modifier", "Option: draw a ring instead of a full pie (or use type=\"donut\" on the tag)"],
      ["{ center }", "modifier", "Option: text for the middle of a donut"],
      ...common,
    ],
    examples: [
      example("Donut with a total", "donut", "pieChart", sample.pie, { center: "4,100" }, `Chart(library) { item in
    SectorMark(angle: .value("Count", item.count), innerRadius: .ratio(0.62))
        .foregroundStyle(by: .value("Kind", item.kind))
}
.glimmerChartStyle()`),
      example("Pie", "pie", "pieChart", sample.pie),
    ],
  },
  {
    slug: "sparkline",
    name: "Sparkline",
    category: "Charts",
    blurb: "A tiny line with no axes that sits inline in a stat, a sentence or a table cell.",
    classes: [
      ["sparkline(values, options)", "component", "values: an array of numbers. Sized like the text around it"],
      ["{ width, height }", "modifier", "Option: its proportions (default 120 × 32)"],
    ],
    examples: [
      {
        title: "Inside a stat",
        preview: `<div class="stat" style="min-width: 15rem"><span class="meta">Revenue</span><span class="stat-value">$48,210 ${draw("spark", sample.spark)}</span><span class="stat-desc">↑ 12% vs last month</span></div>`,
        html: `<div class="stat">\n  <span class="meta">Revenue</span>\n  <span class="stat-value">$48,210 <gl-chart type="spark" data='${JSON.stringify(sample.spark)}' style="display: inline-block"></gl-chart></span>\n  <span class="stat-desc">↑ 12% vs last month</span>\n</div>`,
        js: `import { sparkline } from "glimmer-ui/charts.js";\n\nelement.innerHTML = sparkline(${JSON.stringify(sample.spark)});`,
      },
    ],
  },
  {
    slug: "radar-chart",
    name: "Radar chart",
    category: "Charts",
    blurb: "Compares several measures at once, each on its own spoke, so the shape of a profile stands out.",
    classes: [
      ["radarChart(data, options)", "component", "data: { axes: [names], series: [{ name, values }] }. Needs at least three axes"],
      ["{ max }", "modifier", "Option: the value at the outer ring. Defaults to a round number above the largest value"],
      ["{ size }", "modifier", "Option: the square drawing's size (default 420)"],
      ["{ label }", "modifier", "Option: a description read out by screen readers"],
    ],
    examples: [
      example("Two profiles", "radar", "radarChart", sample.radar, undefined, `RadarChart(
    axes: ["Speed", "Reliability", "Comfort", "Safety", "Efficiency", "Price"],
    series: [
        .init("Model A", [82, 64, 70, 90, 58, 45]),
        .init("Model B", [55, 88, 84, 72, 80, 70]),
    ]
)`),
    ],
  },
  {
    slug: "candlestick-chart",
    name: "Candlestick chart",
    category: "Charts",
    blurb: "The standard stock chart. Each candle's body runs from open to close and its wick from low to high. A hollow green candle means the price rose and a solid red one that it fell, so the two differ by shape as well as colour.",
    classes: [
      ["candlestickChart(data, options)", "component", "data: { candles: [{ date, open, high, low, close, volume? }] }"],
      ["{ volume: false }", "modifier", "Option: hide the volume panel. It shows by default when every candle has a volume"],
      ["{ sma: [5, 20] }", "modifier", "Option: overlay simple moving averages of the close over these many periods"],
      ["{ bollinger: [20, 2] }", "modifier", "Option: Bollinger bands, as period and standard deviations. Pass true for the usual 20 and 2"],
      ["{ heikinAshi: true }", "modifier", "Option: draw Heikin-Ashi candles, which average each candle with the last to show the trend"],
      ["sma · ema · bollinger · rsi · macd · heikinAshi", "component", "The same calculations as plain functions, if you need the numbers"],
      ["--chart-up · --chart-down", "modifier", "CSS variables: the rise and fall colours, if green and red do not suit"],
      ...common,
    ],
    note: "Candles are spaced evenly by position, not by calendar date, so weekends and holidays leave no gaps. Stack an RSI or MACD chart of the same candles underneath and the days line up.",
    examples: [
      example("Price, volume and moving averages", "candlestick", "candlestickChart", sample.stock, { sma: [5, 20] }, `StockChart(candles, movingAverages: [5, 20])
    .frame(height: 320)`),
      example("Bollinger bands", "candlestick", "candlestickChart", sample.stock, { bollinger: [20, 2], volume: false }, `StockChart(candles, bollinger: (period: 20, deviations: 2), showsVolume: false)`),
      example("Heikin-Ashi", "candlestick", "candlestickChart", sample.stock, { heikinAshi: true, volume: false }, `StockChart(candles, showsVolume: false, heikinAshi: true)`),
    ],
  },
  {
    slug: "ohlc-chart",
    name: "OHLC chart",
    category: "Charts",
    blurb: "Open-high-low-close bars: a line from low to high with a tick on the left for the open and on the right for the close.",
    classes: [
      ["ohlcChart(data, options)", "component", "Same data and options as candlestickChart"],
      ...common,
    ],
    note: "Leave volume out of the data, or pass { volume: false }, for a plain high-low-close view.",
    examples: [example("OHLC with volume", "ohlc", "ohlcChart", sample.stock, undefined, `StockChart(candles, style: .ohlc)`)],
  },
  {
    slug: "rsi-chart",
    name: "RSI",
    category: "Charts",
    blurb: "The relative strength index in its own panel, from 0 to 100, with guide lines at 30 (oversold) and 70 (overbought).",
    classes: [
      ["rsiChart(data, options)", "component", "Same data as candlestickChart, so it lines up underneath one"],
      ["{ period }", "modifier", "Option: how many periods to measure over (default 14)"],
      ["rsi(values, n)", "component", "The calculation as a plain function, using Wilder's smoothing"],
      ...common,
    ],
    examples: [example("RSI 14", "rsi", "rsiChart", sample.stock, undefined, `RSIChart(candles, period: 14)
    .frame(height: 140)`)],
  },
  {
    slug: "macd-chart",
    name: "MACD",
    category: "Charts",
    blurb: "Moving average convergence divergence: the gap between a fast and a slow average, its signal line, and the difference between the two as a histogram.",
    classes: [
      ["macdChart(data, options)", "component", "Same data as candlestickChart, so it lines up underneath one"],
      ["{ fast, slow, signal }", "modifier", "Option: the three periods (default 12, 26 and 9)"],
      ["macd(values, fast, slow, signal)", "component", "The calculation as a plain function: an array of { macd, signal, histogram }"],
      ...common,
    ],
    note: "The histogram needs slow + signal periods of history before its first bar, 34 with the defaults.",
    examples: [example("MACD 12, 26, 9", "macd", "macdChart", sample.stock, undefined, `MACDChart(candles)
    .frame(height: 160)`)],
  },
  {
    slug: "chord-diagram",
    name: "Chord diagram",
    category: "Charts",
    blurb: "How groups interact. Each group is an arc on the ring, and a ribbon joins every pair that exchanges something. Hover a group to isolate its connections.",
    classes: [
      ["chordDiagram(data, options)", "component", "data: { names, matrix }, where matrix[i][j] is the flow from group i to group j"],
      ["{ size }", "modifier", "Option: the square drawing's size (default 480)"],
      ["{ pad }", "modifier", "Option: the gap between groups, in radians (default 0.05)"],
      ["{ label }", "modifier", "Option: a description read out by screen readers"],
    ],
    note: "A ribbon is as wide at each end as that side's flow, and takes the colour of whichever side sends more. Hover highlighting from a group's arc covers the first twelve groups.",
    examples: [
      example("Messages between teams", "chord", "chordDiagram", sample.chord, { label: "Messages sent between six teams" }, `ChordDiagram(
    names: ["Design", "Engineering", "Product"],
    matrix: [[0, 42, 28], [38, 0, 35], [24, 40, 0]]
)`),
    ],
  },
];
