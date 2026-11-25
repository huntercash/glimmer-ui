// Run with `npm test`. Checks the maths, not the pixels: counts, sums and a few known answers.
import assert from "node:assert/strict";
import { test } from "node:test";
import * as c from "./charts.js";

const count = (svg, cls) => svg.split(`class="${cls}`).length - 1;
const data = { labels: ["Mon", "Tue", "Wed"], series: [{ name: "A", values: [3, 5, 4] }, { name: "B", values: [1, 2, 6] }] };

test("ticks are round and cover the range", () => {
  assert.deepEqual(c.ticks(0, 100), [0, 20, 40, 60, 80, 100]);
  assert.deepEqual(c.ticks(3, 47), [0, 10, 20, 30, 40, 50]);
  assert.deepEqual(c.ticks(5, 5), [4, 4.5, 5, 5.5, 6]); // a flat series still gets an axis
  const t = c.ticks(-0.3, 0.9);
  assert.ok(t[0] <= -0.3 && t.at(-1) >= 0.9);
});

test("line, area and bar draw one mark per value", () => {
  assert.equal(count(c.lineChart(data), "chart-dot"), 6);
  assert.equal(count(c.lineChart(data), "chart-line"), 2);
  assert.equal(count(c.areaChart(data), "chart-area"), 2);
  assert.equal(count(c.barChart(data), "chart-bar"), 6);
});

test("histogram counts every value exactly once", () => {
  const values = [1, 2, 2, 3, 3, 3, 4, 4, 5, 10];
  const titles = [...c.histogram({ values }).matchAll(/: (\d+)<\/title>/g)].map((m) => +m[1]);
  assert.equal(titles.reduce((a, b) => a + b, 0), values.length);
});

test("box plot statistics match a hand-worked example", () => {
  const s = c.boxStats([1, 2, 3, 4, 5, 6, 7, 8, 9, 40]);
  assert.equal(s.median, 5.5);
  assert.equal(s.q1, 3.25);
  assert.equal(s.q3, 7.75);
  assert.deepEqual(s.outliers, [40]); // beyond q3 + 1.5 × IQR = 14.5
  assert.equal(s.high, 9);
});

test("pie slices sweep the full circle and donut adds a centre label", () => {
  const slices = [{ name: "a", value: 1 }, { name: "b", value: 1 }, { name: "c", value: 2 }];
  assert.equal(count(c.pieChart({ slices }), "chart-slice"), 3);
  assert.match(c.pieChart({ slices }, { donut: true, center: "4" }), /chart-center/);
  assert.match(c.pieChart({ slices }), /c {2}50%/);
});

test("chord diagram draws one arc per group and one ribbon per interacting pair", () => {
  const names = ["A", "B", "C"];
  const matrix = [[0, 5, 0], [3, 0, 2], [0, 0, 4]]; // A↔B, B→C, and C with itself
  const svg = c.chordDiagram({ names, matrix });
  assert.equal(count(svg, "chart-arc"), 3);
  assert.equal(count(svg, "chart-ribbon"), 3);
  assert.match(svg, /A → B: 5 · B → A: 3/);
  assert.match(svg, /chart-ribbon s0 g0 g1/); // coloured by A, the bigger sender, and tagged with both groups
});

test("bad input fails with a message that says what is wrong", () => {
  assert.throws(() => c.chordDiagram({ names: ["A", "B"], matrix: [[1, 2]] }), /square/);
  assert.throws(() => c.heatmap({ rows: ["a"], columns: ["x", "y"], values: [[1]] }), /one cell per column/);
  assert.throws(() => c.chart("sankey", {}), /Unknown chart type "sankey"/);
  assert.throws(() => c.pieChart({ slices: [{ name: "a", value: 0 }] }), /more than zero/);
});

test("labels are escaped", () => {
  const svg = c.barChart({ labels: ["<img src=x>"], series: [{ name: '"x"', values: [1] }] });
  assert.ok(!svg.includes("<img"));
  assert.match(svg, /&lt;img src=x&gt;/);
});

test("stacked bars sit on top of each other and the axis fits the totals", () => {
  const svg = c.barChart(data, { stacked: true });
  const bars = [...svg.matchAll(/<rect class="chart-bar s(\d)" x="([\d.]+)" y="([\d.]+)" width="[\d.]+" height="([\d.]+)"/g)].map((m) => m.slice(1).map(Number));
  const [first, second] = [bars.find((b) => b[0] === 0), bars.find((b) => b[0] === 1)]; // Monday: A=3 then B=1
  assert.equal(first[1], second[1]); // same column
  assert.ok(Math.abs(second[2] + second[3] - first[2]) < 0.02); // B's bottom edge is A's top edge
});

test("smooth lines still pass through every data point", () => {
  const svg = c.lineChart(data, { smooth: true });
  const dots = [...svg.matchAll(/<circle class="chart-dot" cx="([\d.]+)" cy="([\d.]+)"/g)].map((m) => `${m[1]} ${m[2]}`);
  const paths = [...svg.matchAll(/class="chart-line" d="([^"]+)"/g)].map((m) => m[1]).join(" ");
  for (const dot of dots) assert.ok(paths.includes(dot), `curve misses ${dot}`);
  assert.match(paths, /C/);
});

test("radar draws one shape per series and needs three axes", () => {
  assert.equal(count(c.radarChart({ axes: ["a", "b", "c"], series: [{ name: "x", values: [1, 2, 3] }, { name: "y", values: [3, 2, 1] }] }), "chart-shape"), 2);
  assert.throws(() => c.radarChart({ axes: ["a", "b"], series: [] }), /three axes/);
});

test("moving average and Heikin-Ashi match hand-worked values", () => {
  assert.deepEqual(c.sma([1, 2, 3, 4, 5], 3), [null, null, 2, 3, 4]);
  const ha = c.heikinAshi([{ open: 10, high: 14, low: 8, close: 12 }, { open: 12, high: 16, low: 11, close: 15 }]);
  assert.equal(ha[0].close, 11); // (10 + 14 + 8 + 12) / 4
  assert.equal(ha[0].open, 11); // first candle: (open + close) / 2
  assert.equal(ha[1].open, 11); // (previous HA open + previous HA close) / 2
  assert.equal(ha[1].close, 13.5);
});

test("stock charts mark rises and falls, and show volume and averages when asked", () => {
  const candles = [
    { date: "Mon", open: 10, high: 14, low: 9, close: 13, volume: 100 },
    { date: "Tue", open: 13, high: 15, low: 11, close: 12, volume: 300 },
    { date: "Wed", open: 12, high: 16, low: 12, close: 16, volume: 200 },
  ];
  const svg = c.candlestickChart({ candles }, { sma: [2] });
  assert.equal(count(svg, "chart-candle chart-up"), 2);
  assert.equal(count(svg, "chart-candle chart-down"), 1);
  assert.equal(count(svg, "chart-volume"), 3);
  assert.match(svg, /SMA 2/);
  assert.equal(count(c.candlestickChart({ candles }, { volume: false }), "chart-volume"), 0);
  const ohlc = c.ohlcChart({ candles });
  assert.equal(ohlc.split("<rect").length - 1, count(ohlc, "chart-volume")); // OHLC bodies are ticks, so the only boxes are volume bars
});

test("indicators match hand-worked values", () => {
  assert.deepEqual(c.ema([1, 2, 3, 4, 5], 3), [null, null, 2, 3, 4]); // seed 2, then k = 0.5
  const strength = c.rsi([1, 2, 3, 2, 1, 2], 2);
  assert.deepEqual(strength.slice(0, 2), [null, null]);
  [100, 50, 25, 62.5].forEach((expected, i) => assert.ok(Math.abs(strength[i + 2] - expected) < 1e-9, `rsi[${i + 2}] is ${strength[i + 2]}, expected ${expected}`));
  assert.deepEqual(c.rsi([5, 5, 5, 5], 2).slice(2), [50, 50]); // flat prices are neutral, not overbought

  const band = c.bollinger([1, 2, 3], 3, 2);
  assert.deepEqual(band.slice(0, 2), [null, null]);
  assert.equal(band[2].mid, 2);
  assert.ok(Math.abs(band[2].upper - (2 + 2 * Math.sqrt(2 / 3))) < 1e-12);
  assert.ok(Math.abs(band[2].lower - (2 - 2 * Math.sqrt(2 / 3))) < 1e-12);

  // On a straight line both EMAs lag by a constant, so MACD is constant, the signal catches up to it and the histogram is zero.
  const rows = c.macd(Array.from({ length: 30 }, (_, i) => i), 3, 6, 4);
  assert.equal(rows[4].macd, null);
  assert.ok(Math.abs(rows[5].macd - 1.5) < 1e-9); // (6 - 1) / 2 - (3 - 1) / 2
  assert.ok(Math.abs(rows.at(-1).histogram) < 1e-9);
  assert.ok(rows.every((v) => v.histogram == null || Math.abs(v.histogram - (v.macd - v.signal)) < 1e-12));
});

test("indicator charts draw, and Bollinger bands widen the price axis", () => {
  const candles = Array.from({ length: 40 }, (_, i) => {
    const close = 100 + Math.sin(i / 3) * 8 + i * 0.4;
    return { date: `d${i}`, open: close - 1, high: close + 2, low: close - 3, close, volume: 10 + i };
  });
  assert.match(c.candlestickChart({ candles }, { bollinger: [10, 2] }), /chart-band/);
  assert.match(c.candlestickChart({ candles }, { bollinger: true }), /Bollinger 20, 2/);
  assert.equal(count(c.rsiChart({ candles }), "chart-guide"), 2);
  assert.match(c.rsiChart({ candles }, { period: 7 }), /RSI 7/);
  const m = c.macdChart({ candles });
  assert.equal(count(m, "chart-bar chart-up") + count(m, "chart-bar chart-down"), 40 - (26 - 1) - (9 - 1));
});

test("time ticks land on round calendar boundaries", () => {
  const day = 864e5, at = (...d) => Date.UTC(...d);
  const hours = c.timeTicks(at(2026, 0, 1, 0, 20), at(2026, 0, 1, 6, 10));
  assert.deepEqual(hours.ticks.map(hours.format), ["01:00", "02:00", "03:00", "04:00", "05:00", "06:00"]);
  const months = c.timeTicks(at(2026, 0, 15), at(2026, 5, 20));
  assert.deepEqual(months.ticks.map(months.format), ["Feb 2026", "Mar 2026", "Apr 2026", "May 2026", "Jun 2026"]);
  const years = c.timeTicks(at(2019, 6, 1), at(2026, 6, 1));
  assert.ok(years.ticks.every((v) => new Date(v).getUTCMonth() === 0 && new Date(v).getUTCDate() === 1) && years.ticks.length >= 3);
  assert.ok(c.timeTicks(at(2026, 0, 1), at(2026, 0, 1) + 9 * day).ticks.every((v) => v % day === 0));
});

test("a time axis places points by time, not by position in the list", () => {
  const x = (svg) => [...svg.matchAll(/class="chart-dot" cx="([\d.]+)"/g)].map((m) => +m[1]);
  const [a, b, d] = x(c.lineChart({ times: ["2026-01-01", "2026-01-02", "2026-01-11"], series: [{ name: "A", values: [1, 2, 3] }] }));
  assert.ok(Math.abs((d - b) / (b - a) - 9) < 0.01); // nine days is nine times as wide as one
  assert.throws(() => c.lineChart({ times: ["nope"], series: [{ name: "A", values: [1] }] }), /every time must be/);
});

test("a window draws a slice but keeps indicators worked out from all the data", () => {
  const candles = Array.from({ length: 40 }, (_, i) => ({ date: `d${i}`, open: 10 + i, high: 12 + i, low: 9 + i, close: 11 + i, volume: 100 }));
  const svg = c.candlestickChart({ candles }, { sma: [20], window: [30, 40] });
  assert.equal(count(svg, "chart-candle"), 10);
  assert.equal(count(svg, "chart-line chart-average"), 1); // a 20-period average exists though only 10 candles show
  assert.equal(count(c.barChart(data, { window: [1, 3] }), "chart-bar"), 4);
  assert.equal(count(c.lineChart(data, { window: [0, 2] }), "chart-dot"), 4);
});

test("rising candles are hollow: their wick stops at the body", () => {
  const svg = c.candlestickChart({ candles: [{ date: "a", open: 10, high: 14, low: 9, close: 13 }] }, { volume: false });
  assert.equal(count(svg, "chart-body"), 1);
  assert.equal(svg.slice(svg.indexOf("chart-candle")).split("<line").length - 1, 2); // one wick above the body, one below
  assert.match(svg, /chart-candle chart-up/);
});
