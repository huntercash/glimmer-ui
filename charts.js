// Glimmer charts: small functions that turn data into an SVG string. No dependencies and no DOM needed,
// so they run on a server, in a build step or in the browser. All styling is in css/charts.css.
//
//   import { lineChart } from "@glimmer-ui-core/glimmer/charts.js";
//   element.innerHTML = lineChart({ labels: ["Mon", "Tue"], series: [{ name: "Visits", values: [3, 5] }] });
//
// In plain HTML, load this file as a module and use the tag instead:
//   <gl-chart type="line" data='{"labels":["Mon","Tue"],"series":[{"name":"Visits","values":[3,5]}]}'></gl-chart>

const TAU = Math.PI * 2;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const r = (n) => +n.toFixed(2);
// Two formatters made once: toLocaleString builds a new one on every call, which dominated the time to draw a large chart.
const whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }), fine = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const fmt = (n) => (Math.abs(n) >= 100 ? whole : fine).format(n);
const sum = (list) => list.reduce((a, b) => a + b, 0);
const S = (i) => `s${i % 8}`; // colour class; css/charts.css maps s0–s7 to the palette
const need = (ok, message) => {
  if (!ok) throw new Error(message);
};
/** { window: [start, end] } draws only that slice of the data, which is how zooming works. Indicators are still worked out from all of it. */
const cut = (list, o) => (o.window ? list.slice(...o.window) : list);

/** Round tick values covering [min, max], stepping by 1, 2 or 5 times a power of ten. */
export function ticks(min, max, count = 5) {
  if (min === max) [min, max] = [min - 1, max + 1];
  const raw = (max - min) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = (raw / mag >= 7 ? 10 : raw / mag >= 3 ? 5 : raw / mag >= 1.5 ? 2 : 1) * mag;
  const out = [];
  for (let v = Math.floor(min / step) * step; v < max + step * 0.999; v += step) out.push(+v.toPrecision(12));
  return out;
}

const lin = (d0, d1, r0, r1) => (v) => r(r0 + ((v - d0) / (d1 - d0)) * (r1 - r0));

const svg = (o, kind, w, h, body) =>
  `<svg class="chart chart-type-${kind}" viewBox="0 0 ${w} ${h}" role="img"${o.label ? ` aria-label="${esc(o.label)}"` : ""}>${body}</svg>`;

/** The plot area with a y axis: horizontal gridlines and their labels. */
function axes(o, values, zero, bottom = (o.height ?? 360) - 28) {
  need(values.length, "chart: no values to plot");
  const W = o.width ?? 640, H = o.height ?? 360;
  const left = 46, right = W - 12, top = 34;
  const t = ticks(Math.min(...values, zero ? 0 : Infinity), Math.max(...values, zero ? 0 : -Infinity));
  const y = lin(t[0], t.at(-1), bottom, top);
  const grid = `<g class="chart-grid">${t
    .map((v) => `<line x1="${left}" x2="${right}" y1="${y(v)}" y2="${y(v)}"/><text x="${left - 8}" y="${y(v)}" dy="0.32em" text-anchor="end">${fmt(v)}</text>`)
    .join("")}</g>`;
  return { W, H, left, right, top, bottom, y, grid };
}

/** Category labels under evenly spaced bands. Shows only as many as fit side by side at this width. */
function bands(c, labels) {
  const band = (c.right - c.left) / labels.length;
  const widest = Math.max(...labels.map((l) => String(l).length)) * 6.7 + 12; // mono face, so width is predictable
  const every = Math.max(1, Math.ceil(widest / band));
  const text = labels.map((l, i) => (i % every ? "" : `<text x="${r(c.left + band * (i + 0.5))}" y="${c.bottom + 18}" text-anchor="middle">${esc(l)}</text>`));
  return { band, x: (i) => r(c.left + band * (i + 0.5)), name: (i) => labels[i], labels: `<g class="chart-grid">${text.join("")}</g>` };
}

const DAY = 864e5;
const dateFormat = (options) => new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format;

/** Tick times (in milliseconds) on round calendar boundaries covering [min, max], and a label format to match.
    ponytail: ticks and labels are in UTC. For another zone, shift the times before passing them in. */
export function timeTicks(min, max, count = 6) {
  const span = (max - min) / count || 1;
  const step = [1e3, 5e3, 15e3, 6e4, 3e5, 9e5, 36e5, 108e5, 216e5, 432e5, DAY, 2 * DAY, 7 * DAY, 14 * DAY].find((s) => s >= span);
  const at = [];
  if (step) {
    for (let v = Math.ceil(min / step) * step; v <= max; v += step) at.push(v);
    return { ticks: at, format: dateFormat(step < 6e4 ? { hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" } : step < DAY ? { hour: "2-digit", minute: "2-digit", hourCycle: "h23" } : { month: "short", day: "numeric" }) };
  }
  // Months and years are not a fixed length, so step along the calendar instead.
  const months = [1, 2, 3, 6, 12, 24, 60, 120].find((m) => m * 30.44 * DAY >= span) ?? 120;
  const first = new Date(min);
  let m = Math.ceil((first.getUTCFullYear() * 12 + first.getUTCMonth()) / months) * months;
  if (Date.UTC(Math.floor(m / 12), m % 12) < min) m += months;
  for (let v; (v = Date.UTC(Math.floor(m / 12), m % 12)) <= max; m += months) at.push(v);
  return { ticks: at, format: dateFormat(months < 12 ? { month: "short", year: "numeric" } : { year: "numeric" }) };
}

/** A real time axis: points sit where their time falls, so uneven gaps in the data show as gaps. */
function timeAxis(c, times) {
  const ms = times.map((v) => +new Date(v));
  need(ms.length && ms.every(Number.isFinite), "chart: every time must be a date, an ISO date string or a millisecond number");
  const min = Math.min(...ms), max = Math.max(...ms), inset = Math.min(16, (c.right - c.left) / 20);
  const x = lin(min, max === min ? min + 1 : max, c.left + inset, c.right - inset);
  const { ticks: at, format } = timeTicks(min, max, Math.max(2, Math.floor((c.right - c.left) / 72)));
  const name = dateFormat(ms.every((v) => v % DAY === 0) ? { dateStyle: "medium" } : { dateStyle: "medium", timeStyle: "short" });
  const text = at.map((v) => `<text x="${x(v)}" y="${c.bottom + 18}" text-anchor="middle">${esc(format(v))}</text>`);
  return { x: (i) => x(ms[i]), name: (i) => name(ms[i]), labels: `<g class="chart-grid">${text.join("")}</g>` };
}

/** A numeric x axis. */
function xAxis(c, t) {
  const x = lin(t[0], t.at(-1), c.left, c.right);
  return { x, labels: `<g class="chart-grid">${t.map((v) => `<text x="${x(v)}" y="${c.bottom + 18}" text-anchor="middle">${fmt(v)}</text>`).join("")}</g>` };
}

function legend(names, x, y, vertical) {
  let offset = 0;
  const items = names.map((name, i) => {
    const at = vertical ? `${x} ${y + i * 20}` : `${x + offset} ${y}`;
    offset += 30 + String(name).length * 6.7; // labels are set in the mono face, so width is predictable
    return `<g class="${S(i)}" transform="translate(${at})"><circle cx="4" cy="-4" r="4"/><text x="14">${esc(name)}</text></g>`;
  });
  return `<g class="chart-legend">${items.join("")}</g>`;
}

/** A curve through every point that never overshoots between them (monotone cubic, Fritsch–Carlson). */
function smoothPath(pts) {
  const n = pts.length;
  if (n < 3) return "M" + pts.map((p) => p.join(" ")).join("L");
  const dx = [], slope = [], t = [];
  for (let i = 0; i < n - 1; i++) {
    dx[i] = pts[i + 1][0] - pts[i][0];
    slope[i] = (pts[i + 1][1] - pts[i][1]) / dx[i];
  }
  t[0] = slope[0];
  t[n - 1] = slope[n - 2];
  for (let i = 1; i < n - 1; i++) t[i] = slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) { t[i] = t[i + 1] = 0; continue; }
    const a = t[i] / slope[i], b = t[i + 1] / slope[i], size = a * a + b * b;
    if (size > 9) { t[i] = (3 / Math.sqrt(size)) * a * slope[i]; t[i + 1] = (3 / Math.sqrt(size)) * b * slope[i]; }
  }
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < n - 1; i++)
    d += `C${r(pts[i][0] + dx[i] / 3)} ${r(pts[i][1] + (t[i] * dx[i]) / 3)} ${r(pts[i + 1][0] - dx[i] / 3)} ${r(pts[i + 1][1] - (t[i + 1] * dx[i]) / 3)} ${pts[i + 1][0]} ${pts[i + 1][1]}`;
  return d;
}

/** Lines over categories, or over time. Pass { smooth: true } for curves.
    data: { labels, series: [{ name, values }] }, or { times, series } with a date, ISO string or millisecond number
    per value for a real time axis. */
export function lineChart({ labels, times, series }, o = {}) {
  const c = axes(o, series.flatMap((s) => cut(s.values, o)), o.zero ?? false);
  const b = times ? timeAxis(c, cut(times, o)) : bands(c, cut(labels, o));
  const body = series.map((s, k) => {
    const values = cut(s.values, o);
    const pts = values.map((v, i) => [b.x(i), c.y(v)]);
    const d = o.smooth ? smoothPath(pts) : "M" + pts.map((p) => p.join(" ")).join("L");
    const area = o.area ? `<path class="chart-area" d="${d}L${pts.at(-1)[0]} ${c.bottom}L${pts[0][0]} ${c.bottom}Z"/>` : "";
    const quiet = pts.length > (c.right - c.left) / 14 ? " chart-dot-quiet" : ""; // too many to draw: keep them for the readout only
    const dots = pts.map((p, i) => `<circle class="chart-dot${quiet}" cx="${p[0]}" cy="${p[1]}" r="3"><title>${esc(s.name)} · ${esc(b.name(i))}: ${fmt(values[i])}</title></circle>`);
    return `<g class="${S(k)}">${area}<path class="chart-line" d="${d}"/>${dots.join("")}</g>`;
  });
  return svg(o, "line", c.W, c.H, c.grid + b.labels + body.join("") + legend(series.map((s) => s.name), c.left, 16));
}

/** A line chart with the area under each line filled, from a zero baseline. Same data as lineChart. */
export const areaChart = (data, o = {}) => lineChart(data, { zero: true, ...o, area: true });

/** Vertical bars: side by side per series, or one on top of another with { stacked: true } (for non-negative values).
    data: { labels, series: [{ name, values }] } */
export function barChart(data, o = {}) {
  const labels = cut(data.labels, o), series = data.series.map((s) => ({ ...s, values: cut(s.values, o) }));
  const totals = labels.map((_, i) => sum(series.map((s) => s.values[i])));
  const c = axes(o, o.stacked ? totals : series.flatMap((s) => s.values), true);
  const b = bands(c, labels);
  const inner = b.band * 0.72, w = o.stacked ? inner : inner / series.length;
  const stack = labels.map(() => 0); // how high each stack has reached so far
  const bars = series.map((s, k) =>
    s.values.map((v, i) => {
      const x = c.left + b.band * i + (b.band - inner) / 2 + (o.stacked ? 0 : w * k);
      const from = o.stacked ? stack[i] : 0, to = from + v;
      if (o.stacked) stack[i] = to;
      const top = Math.min(c.y(to), c.y(from));
      return `<rect class="chart-bar ${S(k)}" x="${r(x + 1)}" y="${top}" width="${r(Math.max(w - 2, 1))}" height="${r(Math.abs(c.y(to) - c.y(from)))}" rx="3"><title>${esc(s.name)} · ${esc(labels[i])}: ${fmt(v)}</title></rect>`;
    }).join(""));
  return svg(o, "bar", c.W, c.H, c.grid + b.labels + bars.join("") + legend(series.map((s) => s.name), c.left, 16));
}

/** Points on two numeric axes. data: { series: [{ name, points: [[x, y], ...] }] } */
export function scatterChart({ series }, o = {}) {
  const all = series.flatMap((s) => s.points);
  const c = axes(o, all.map((p) => p[1]), false);
  const xs = all.map((p) => p[0]);
  const ax = xAxis(c, ticks(Math.min(...xs), Math.max(...xs), 6));
  const dots = series.map((s, k) =>
    `<g class="${S(k)}">${s.points.map(([x, y]) => `<circle class="chart-dot" cx="${ax.x(x)}" cy="${c.y(y)}" r="${o.radius ?? 4}"><title>${esc(s.name)}: ${fmt(x)}, ${fmt(y)}</title></circle>`).join("")}</g>`);
  return svg(o, "scatter", c.W, c.H, c.grid + ax.labels + dots.join("") + legend(series.map((s) => s.name), c.left, 16));
}

/** How values are distributed, counted into round-numbered bins. data: { values } */
export function histogram({ values }, o = {}) {
  need(values?.length, "histogram: no values");
  const edges = ticks(Math.min(...values), Math.max(...values), o.bins ?? Math.ceil(Math.log2(values.length)) + 1);
  const last = edges.length - 2;
  const counts = edges.slice(0, -1).map((lo, i) => values.filter((v) => v >= lo && (v < edges[i + 1] || (i === last && v <= edges[i + 1]))).length);
  const c = axes(o, counts, true);
  const ax = xAxis(c, edges);
  const bars = counts.map((n, i) =>
    `<rect class="chart-bar s0" x="${r(ax.x(edges[i]) + 1)}" y="${c.y(n)}" width="${r(Math.max(ax.x(edges[i + 1]) - ax.x(edges[i]) - 2, 1))}" height="${r(c.y(0) - c.y(n))}" rx="3"><title>${fmt(edges[i])} to ${fmt(edges[i + 1])}: ${n}</title></rect>`);
  return svg(o, "histogram", c.W, c.H, c.grid + ax.labels + bars.join(""));
}

const quantile = (sorted, q) => {
  const p = (sorted.length - 1) * q, i = Math.floor(p);
  return sorted[i] + (sorted[Math.min(i + 1, sorted.length - 1)] - sorted[i]) * (p - i);
};

/** The five-number summary of a group of values, with whiskers at 1.5 × IQR and the rest as outliers. */
export function boxStats(values) {
  need(values?.length, "boxPlot: a group has no values");
  const v = [...values].sort((a, b) => a - b);
  const q1 = quantile(v, 0.25), median = quantile(v, 0.5), q3 = quantile(v, 0.75), fence = (q3 - q1) * 1.5;
  const inside = v.filter((x) => x >= q1 - fence && x <= q3 + fence);
  return { q1, median, q3, low: inside[0], high: inside.at(-1), outliers: v.filter((x) => x < q1 - fence || x > q3 + fence) };
}

/** Box-and-whisker plots, one per group. data: { groups: [{ name, values }] } */
export function boxPlot({ groups }, o = {}) {
  const stats = groups.map((g) => boxStats(g.values));
  const c = axes(o, groups.flatMap((g) => g.values), false);
  const b = bands(c, groups.map((g) => g.name));
  const boxes = stats.map((s, i) => {
    const x = b.x(i), w = Math.min(b.band * 0.5, 56), y = c.y;
    return `<g class="chart-box ${S(i)}"><title>${esc(groups[i].name)}: median ${fmt(s.median)}, quartiles ${fmt(s.q1)}–${fmt(s.q3)}, range ${fmt(s.low)}–${fmt(s.high)}</title>` +
      `<line x1="${x}" x2="${x}" y1="${y(s.high)}" y2="${y(s.low)}"/>` +
      `<line x1="${r(x - w / 4)}" x2="${r(x + w / 4)}" y1="${y(s.high)}" y2="${y(s.high)}"/><line x1="${r(x - w / 4)}" x2="${r(x + w / 4)}" y1="${y(s.low)}" y2="${y(s.low)}"/>` +
      `<rect x="${r(x - w / 2)}" y="${y(s.q3)}" width="${r(w)}" height="${r(y(s.q1) - y(s.q3))}" rx="3"/>` +
      `<line class="chart-median" x1="${r(x - w / 2)}" x2="${r(x + w / 2)}" y1="${y(s.median)}" y2="${y(s.median)}"/>` +
      s.outliers.map((v) => `<circle class="chart-dot" cx="${x}" cy="${y(v)}" r="3"/>`).join("") + "</g>";
  });
  return svg(o, "box", c.W, c.H, c.grid + b.labels + boxes.join(""));
}

/** A grid of values shaded by size. Negative values use the second colour, so correlations read at a glance.
    data: { rows, columns, values: [[...], ...] } */
export function heatmap({ rows, columns, values }, o = {}) {
  need(values.length === rows.length && values.every((row) => row.length === columns.length), "heatmap: values must have one row per row label and one cell per column label");
  const max = Math.max(...values.flat().map(Math.abs)) || 1;
  const cell = o.cell ?? 46, left = 12 + Math.max(...rows.map((s) => String(s).length)) * 6.7, top = 6;
  const W = left + columns.length * cell + 6, H = top + rows.length * cell + 24;
  const cells = values.map((row, i) => row.map((v, j) => {
    const x = left + j * cell, y = top + i * cell;
    return `<g class="${S(v < 0 ? 1 : 0)}"><rect class="chart-cell" x="${r(x)}" y="${y}" width="${cell - 3}" height="${cell - 3}" rx="5" fill-opacity="${r(0.06 + 0.94 * (Math.abs(v) / max))}"><title>${esc(rows[i])} × ${esc(columns[j])}: ${fmt(v)}</title></rect>` +
      (o.values === false ? "" : `<text class="chart-value" x="${r(x + (cell - 3) / 2)}" y="${r(y + (cell - 3) / 2)}" dy="0.32em" text-anchor="middle">${fmt(v)}</text>`) + "</g>";
  }).join(""));
  const labels = rows.map((l, i) => `<text x="${r(left - 8)}" y="${r(top + i * cell + (cell - 3) / 2)}" dy="0.32em" text-anchor="end">${esc(l)}</text>`).join("") +
    columns.map((l, j) => `<text x="${r(left + j * cell + (cell - 3) / 2)}" y="${top + rows.length * cell + 12}" text-anchor="middle">${esc(l)}</text>`).join("");
  return svg(o, "heatmap", r(W), H, `<g class="chart-grid">${labels}</g>${cells.join("")}`);
}

// Angles run clockwise from twelve o'clock.
const pt = (cx, cy, radius, a) => `${r(cx + radius * Math.sin(a))} ${r(cy - radius * Math.cos(a))}`;

/** A ring segment between two radii (or a pie slice when r0 is 0). */
function sector(cx, cy, r0, r1, a0, a1) {
  if (a1 - a0 > TAU - 1e-6) a1 = a0 + TAU - 1e-4; // one arc cannot draw a full circle
  const big = a1 - a0 > Math.PI ? 1 : 0;
  return `M${pt(cx, cy, r1, a0)}A${r1} ${r1} 0 ${big} 1 ${pt(cx, cy, r1, a1)}L${pt(cx, cy, r0, a1)}${r0 ? `A${r0} ${r0} 0 ${big} 0 ${pt(cx, cy, r0, a0)}` : ""}Z`;
}

/** Parts of a whole. Pass { donut: true } for a ring, and { center: "text" } to label its hole.
    data: { slices: [{ name, value }] } */
export function pieChart({ slices }, o = {}) {
  const total = sum(slices.map((s) => s.value));
  need(total > 0, "pieChart: slice values must add up to more than zero");
  const W = o.width ?? 440, H = o.height ?? 260, R = H / 2 - 14, cx = R + 14, cy = H / 2;
  let a = 0;
  const paths = slices.map((s, i) => {
    const a0 = a;
    a += (s.value / total) * TAU;
    return `<path class="chart-slice ${S(i)}" d="${sector(cx, cy, o.donut ? r(R * 0.62) : 0, r(R), a0, a)}"><title>${esc(s.name)}: ${fmt(s.value)} (${fmt((s.value / total) * 100)}%)</title></path>`;
  });
  const center = o.donut && o.center != null ? `<text class="chart-center" x="${r(cx)}" y="${cy}" dy="0.32em" text-anchor="middle">${esc(o.center)}</text>` : "";
  const names = slices.map((s) => `${s.name}  ${fmt((s.value / total) * 100)}%`);
  return svg(o, o.donut ? "donut" : "pie", W, H, paths.join("") + center + legend(names, r(cx + R + 28), r(cy - (slices.length - 1) * 10 + 4), true));
}

/** A tiny line with no axes, for inline use in stats and tables. data: an array of numbers. */
export function sparkline(values, o = {}) {
  need(values?.length > 1, "sparkline: needs at least two values");
  const W = o.width ?? 120, H = o.height ?? 32;
  const x = lin(0, values.length - 1, 3, W - 5), y = lin(Math.min(...values), Math.max(...values) || 1, H - 4, 4);
  const pts = values.map((v, i) => `${x(i)},${y(v)}`);
  return svg(o, "spark", W, H, `<g class="s0"><polyline class="chart-line" points="${pts.join(" ")}"/><circle class="chart-dot" cx="${x(values.length - 1)}" cy="${y(values.at(-1))}" r="2.5"/></g>`);
}

/** Flows between groups: each group is an arc on the ring, and a ribbon joins every pair that exchanges something.
    matrix[i][j] is the flow from group i to group j. A ribbon takes the colour of whichever side sends more.
    data: { names, matrix } */
export function chordDiagram({ names, matrix }, o = {}) {
  const n = names.length;
  need(n > 0 && matrix.length === n && matrix.every((row) => row.length === n), "chordDiagram: matrix must be square, with one row and one column per name");
  const out = matrix.map(sum), total = sum(out);
  need(total > 0, "chordDiagram: the matrix has no flows");
  const size = o.size ?? 480, c = size / 2, R = c - 70, r0 = R - 12, rr = r0 - 4, pad = o.pad ?? 0.05;
  const k = (TAU - pad * n) / total;

  // Each group's span on the ring, split into one sub-span per partner.
  let a = 0;
  const groups = matrix.map((row) => {
    const start = a;
    const cells = row.map((v) => {
      const from = a;
      a += v * k;
      return [from, a];
    });
    a += pad;
    return { start, end: a - pad, cells };
  });

  const arc = (a0, a1) => `A${rr} ${rr} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${pt(c, c, rr, a1)}`;
  const ribbons = [];
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      if (!matrix[i][j] && !matrix[j][i]) continue;
      const [s, t] = matrix[i][j] >= matrix[j][i] ? [i, j] : [j, i];
      const [s0, s1] = groups[s].cells[t], [t0, t1] = groups[t].cells[s];
      const d = s === t
        ? `M${pt(c, c, rr, s0)}${arc(s0, s1)}Q${c} ${c} ${pt(c, c, rr, s0)}Z`
        : `M${pt(c, c, rr, s0)}${arc(s0, s1)}Q${c} ${c} ${pt(c, c, rr, t0)}${arc(t0, t1)}Q${c} ${c} ${pt(c, c, rr, s0)}Z`;
      const title = s === t ? `${names[s]} (within): ${fmt(matrix[s][s])}` : `${names[s]} → ${names[t]}: ${fmt(matrix[s][t])} · ${names[t]} → ${names[s]}: ${fmt(matrix[t][s])}`;
      ribbons.push(`<path class="chart-ribbon ${S(s)} g${s} g${t}" d="${d}"><title>${esc(title)}</title></path>`);
    }
  }
  const arcs = groups.map((g, i) => `<path class="chart-arc ${S(i)} g${i}" d="${sector(c, c, r0, R, g.start, g.end)}"><title>${esc(names[i])}: ${fmt(out[i])}</title></path>`);
  const labels = groups.map((g, i) => {
    const mid = (g.start + g.end) / 2, side = Math.sin(mid);
    return `<text x="${r(c + (R + 10) * side)}" y="${r(c - (R + 10) * Math.cos(mid))}" dy="0.32em" text-anchor="${side > 0.15 ? "start" : side < -0.15 ? "end" : "middle"}">${esc(names[i])}</text>`;
  });
  return svg(o, "chord", size, size, `<g>${ribbons.join("")}</g><g>${arcs.join("")}</g><g class="chart-grid">${labels.join("")}</g>`);
}

/** Several measures per series, on spokes around a centre. data: { axes: [names], series: [{ name, values }] } */
export function radarChart({ axes: names, series }, o = {}) {
  const n = names.length;
  need(n >= 3, "radarChart: needs at least three axes");
  const size = o.size ?? 420, c = size / 2, R = c - 64;
  const max = o.max ?? ticks(0, Math.max(...series.flatMap((s) => s.values))).at(-1);
  const at = (i, v) => pt(c, c, (v / max) * R, (i / n) * TAU);
  const rings = [0.25, 0.5, 0.75, 1].map((f) => `<polygon points="${names.map((_, i) => at(i, max * f)).join(" ")}"/>`);
  const spokes = names.map((name, i) => {
    const side = Math.sin((i / n) * TAU), [x, y] = pt(c, c, R + 12, (i / n) * TAU).split(" ");
    return `<line x1="${c}" y1="${c}" x2="${at(i, max).split(" ")[0]}" y2="${at(i, max).split(" ")[1]}"/><text x="${x}" y="${y}" dy="0.32em" text-anchor="${side > 0.15 ? "start" : side < -0.15 ? "end" : "middle"}">${esc(name)}</text>`;
  });
  const shapes = series.map((s, k) =>
    `<polygon class="chart-shape ${S(k)}" points="${s.values.map((v, i) => at(i, v)).join(" ")}"><title>${esc(s.name)}: ${s.values.map((v, i) => `${esc(names[i])} ${fmt(v)}`).join(", ")}</title></polygon>`);
  return svg(o, "radar", size, size, `<g class="chart-grid">${rings.join("")}${spokes.join("")}</g>${shapes.join("")}${legend(series.map((s) => s.name), 8, 14)}`);
}

/** Simple moving average of the last n values; null until there are n of them. */
export const sma = (values, n) => values.map((_, i) => (i < n - 1 ? null : sum(values.slice(i - n + 1, i + 1)) / n));

/** Exponential moving average, seeded with the simple average of the first n values; null before that. */
export function ema(values, n) {
  const k = 2 / (n + 1);
  let prev = null;
  return values.map((v, i) => {
    if (i < n - 1) return null;
    prev = i === n - 1 ? sum(values.slice(0, n)) / n : v * k + prev * (1 - k);
    return prev;
  });
}

/** Bollinger bands: a moving average with a band k standard deviations either side; null until there are n values. */
export function bollinger(values, n = 20, k = 2) {
  return sma(values, n).map((mid, i) => {
    if (mid == null) return null;
    const deviation = Math.sqrt(sum(values.slice(i - n + 1, i + 1).map((v) => (v - mid) ** 2)) / n);
    return { mid, upper: mid + k * deviation, lower: mid - k * deviation };
  });
}

/** Relative strength index with Wilder's smoothing, from 0 to 100; null for the first n values. */
export function rsi(values, n = 14) {
  let gain = 0, loss = 0;
  return values.map((v, i) => {
    if (i === 0) return null;
    const change = v - values[i - 1], up = Math.max(change, 0), down = Math.max(-change, 0);
    if (i <= n) {
      gain += up / n;
      loss += down / n;
      if (i < n) return null;
    } else {
      gain = (gain * (n - 1) + up) / n;
      loss = (loss * (n - 1) + down) / n;
    }
    return loss === 0 ? (gain === 0 ? 50 : 100) : 100 - 100 / (1 + gain / loss);
  });
}

/** MACD: the gap between a fast and a slow EMA, that gap's own EMA as the signal line, and their difference as the histogram. */
export function macd(values, fast = 12, slow = 26, signal = 9) {
  const quick = ema(values, fast), steady = ema(values, slow);
  const line = values.map((_, i) => (steady[i] == null ? null : quick[i] - steady[i]));
  const start = line.findIndex((v) => v != null);
  const smoothed = start < 0 ? [] : ema(line.slice(start), signal);
  return line.map((value, i) => {
    const sig = start >= 0 && i >= start ? smoothed[i - start] : null;
    return { macd: value, signal: sig, histogram: value != null && sig != null ? value - sig : null };
  });
}

/** Heikin-Ashi candles: each one averaged with the last, which smooths out noise so the trend shows. */
export function heikinAshi(candles) {
  let prev;
  return candles.map((k) => {
    const close = (k.open + k.high + k.low + k.close) / 4;
    const open = prev ? (prev.open + prev.close) / 2 : (k.open + k.close) / 2;
    prev = { ...k, open, close, high: Math.max(k.high, open, close), low: Math.min(k.low, open, close) };
    return prev;
  });
}

/** Shared by the two stock charts: price marks, an optional volume panel underneath, and moving-average lines. */
function priceChart(kind, { candles }, o) {
  need(candles?.length, `${kind}Chart: no candles`);
  const all = o.heikinAshi ? heikinAshi(candles) : candles, data = cut(all, o);
  need(data.length, `${kind}Chart: the window is empty`);
  const H = o.height ?? 360, foot = H - 28;
  const showVolume = o.volume ?? candles.every((k) => k.volume != null);
  const volH = showVolume ? Math.round(H * 0.18) : 0;
  const closes = all.map((k) => k.close);
  const [bandN, bandK] = o.bollinger === true ? [20, 2] : (o.bollinger ?? []);
  const band = bandN ? cut(bollinger(closes, bandN, bandK ?? 2), o) : [];
  const c = axes(o, [...data.flatMap((k) => [k.high, k.low]), ...band.flatMap((v) => (v ? [v.upper, v.lower] : []))], false, foot - (volH ? volH + 12 : 0));
  const b = bands({ ...c, bottom: foot }, data.map((k) => k.date));
  const w = Math.max(Math.min(b.band * 0.64, 14), 1.5);
  const maxVolume = showVolume ? Math.max(...data.map((k) => k.volume)) || 1 : 1;
  const marks = data.map((k, i) => {
    const x = b.x(i), y = c.y;
    const title = `<title>${esc(k.date)} · open ${fmt(k.open)}, high ${fmt(k.high)}, low ${fmt(k.low)}, close ${fmt(k.close)}${k.volume != null ? `, volume ${fmt(k.volume)}` : ""}</title>`;
    const top = Math.min(y(k.open), y(k.close)), base = Math.max(y(k.open), y(k.close));
    // A candle's wick stops at its body, so a rising candle can be drawn hollow: the shape tells rise from fall, not just the colour.
    const range = kind === "candlestick"
      ? `<line x1="${x}" x2="${x}" y1="${y(k.high)}" y2="${top}"/><line x1="${x}" x2="${x}" y1="${base}" y2="${y(k.low)}"/>`
      : `<line x1="${x}" x2="${x}" y1="${y(k.high)}" y2="${y(k.low)}"/>`;
    const body = kind === "candlestick"
      ? `<rect class="chart-body" x="${r(x - w / 2)}" y="${Math.min(y(k.open), y(k.close))}" width="${r(w)}" height="${r(Math.max(Math.abs(y(k.open) - y(k.close)), 1))}" rx="1"/>`
      : `<line x1="${r(x - w / 2)}" x2="${x}" y1="${y(k.open)}" y2="${y(k.open)}"/><line x1="${x}" x2="${r(x + w / 2)}" y1="${y(k.close)}" y2="${y(k.close)}"/>`;
    const volume = showVolume ? `<rect class="chart-volume" x="${r(x - w / 2)}" y="${r(foot - (k.volume / maxVolume) * volH)}" width="${r(w)}" height="${r((k.volume / maxVolume) * volH)}"/>` : "";
    return `<g class="chart-candle ${k.close >= k.open ? "chart-up" : "chart-down"}">${title}${range}${body}${volume}</g>`;
  });
  const periods = o.sma ?? [];
  const averages = periods.map((n, k) => {
    const pts = cut(sma(closes, n), o).flatMap((v, i) => (v == null ? [] : [`${b.x(i)} ${c.y(v)}`]));
    return pts.length > 1 ? `<path class="chart-line chart-average ${S(k)}" d="M${pts.join("L")}"/>` : "";
  });
  // Bollinger: a shaded band between the upper and lower lines.
  const edge = (side) => band.flatMap((v, i) => (v ? [`${b.x(i)} ${c.y(v[side])}`] : []));
  const upper = edge("upper"), lower = edge("lower");
  const bands_ = upper.length > 1
    ? `<g class="${S(periods.length)}"><path class="chart-band" d="M${upper.join("L")}L${lower.reverse().join("L")}Z"/><path class="chart-line chart-average" d="M${upper.join("L")}"/><path class="chart-line chart-average" d="M${edge("lower").join("L")}"/></g>`
    : "";
  const names = [...periods.map((n) => `SMA ${n}`), ...(bandN ? [`Bollinger ${bandN}, ${bandK ?? 2}`] : [])];
  return svg(o, kind, c.W, H, c.grid + b.labels + bands_ + marks.join("") + averages.join("") + (names.length ? legend(names, c.left, 16) : ""));
}

/** Candlesticks: a body from open to close and a wick from low to high. Hollow and green when the price rose, solid and red when it fell.
    Options: { volume: false } hides the volume panel, { sma: [5, 20] } adds moving averages, { bollinger: [20, 2] } adds
    Bollinger bands (period, standard deviations), { heikinAshi: true } smooths the candles.
    data: { candles: [{ date, open, high, low, close, volume? }] } */
export const candlestickChart = (data, o = {}) => priceChart("candlestick", data, o);

/** OHLC bars: a line from low to high with a tick on the left for the open and on the right for the close.
    Same data and options as candlestickChart. */
export const ohlcChart = (data, o = {}) => priceChart("ohlc", data, o);

/** RSI in its own panel, with guide lines at 30 and 70. It takes the same data as candlestickChart and lines up under it.
    Options: { period } (default 14). */
export function rsiChart({ candles }, o = {}) {
  need(candles?.length, "rsiChart: no candles");
  const period = o.period ?? 14;
  const c = axes({ height: 160, ...o }, [0, 100], true);
  const b = bands(c, cut(candles, o).map((k) => k.date));
  const pts = cut(rsi(candles.map((k) => k.close), period), o).flatMap((v, i) => (v == null ? [] : [`${b.x(i)} ${c.y(v)}`]));
  const guides = [30, 70].map((v) => `<line class="chart-guide" x1="${c.left}" x2="${c.right}" y1="${c.y(v)}" y2="${c.y(v)}"/>`);
  const line = pts.length > 1 ? `<path class="chart-line s0" d="M${pts.join("L")}"/>` : "";
  return svg(o, "rsi", c.W, c.H, c.grid + b.labels + guides.join("") + line + legend([`RSI ${period}`], c.left, 16));
}

/** MACD in its own panel: the histogram as bars, with the MACD and signal lines over it. Same data as candlestickChart.
    Options: { fast, slow, signal } (default 12, 26, 9). */
export function macdChart({ candles }, o = {}) {
  need(candles?.length, "macdChart: no candles");
  const { fast = 12, slow = 26, signal = 9 } = o;
  const rows = cut(macd(candles.map((k) => k.close), fast, slow, signal), o), shown = cut(candles, o);
  const c = axes({ height: 180, ...o }, [0, ...rows.flatMap((v) => [v.macd, v.signal, v.histogram].filter((x) => x != null))], true);
  const b = bands(c, shown.map((k) => k.date));
  const w = Math.max(Math.min(b.band * 0.64, 14), 1.5);
  const bars = rows.map((v, i) => (v.histogram == null ? "" :
    `<rect class="chart-bar ${v.histogram >= 0 ? "chart-up" : "chart-down"}" x="${r(b.x(i) - w / 2)}" y="${Math.min(c.y(v.histogram), c.y(0))}" width="${r(w)}" height="${r(Math.abs(c.y(v.histogram) - c.y(0)))}"><title>${esc(shown[i].date)} · histogram ${fmt(v.histogram)}</title></rect>`));
  const path = (key, cls) => {
    const pts = rows.flatMap((v, i) => (v[key] == null ? [] : [`${b.x(i)} ${c.y(v[key])}`]));
    return pts.length > 1 ? `<path class="chart-line chart-average ${cls}" d="M${pts.join("L")}"/>` : "";
  };
  return svg(o, "macd", c.W, c.H, c.grid + b.labels + bars.join("") + path("macd", "s0") + path("signal", "s1") + legend([`MACD ${fast}, ${slow}`, `Signal ${signal}`], c.left, 16));
}

const kinds = {
  line: lineChart, area: areaChart, bar: barChart, scatter: scatterChart, histogram, box: boxPlot, heatmap,
  pie: pieChart, donut: (data, o) => pieChart(data, { ...o, donut: true }), spark: sparkline, chord: chordDiagram,
  radar: radarChart, candlestick: candlestickChart, ohlc: ohlcChart, rsi: rsiChart, macd: macdChart,
};

/** Draws any chart by name: line, area, bar, scatter, histogram, box, heatmap, pie, donut, spark, chord, radar, candlestick, ohlc, rsi or macd. */
export function chart(type, data, options = {}) {
  need(type in kinds, `Unknown chart type "${type}". Use one of: ${Object.keys(kinds).join(", ")}`);
  return kinds[type](data, options);
}

// Kinds drawn at the element's own width, so text is the same size on a phone as on a desktop. The rest are fixed drawings that scale.
const fluid = new Set(["line", "area", "bar", "scatter", "histogram", "box", "candlestick", "ohlc", "rsi", "macd"]);
const squares = { chord: 480, radar: 420 };
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// <gl-chart type="…" data='…json…' options='…json…'>, for pages with no build step.
// On charts with axes it adds a crosshair with a readout of the values under the pointer (arrow keys move it too).
// With the `zoom` attribute, charts over labels, times or candles also zoom (pinch, Ctrl + wheel, or + and −),
// pan (drag, or Shift + arrows) and reset (double-click, or 0).
if (globalThis.customElements && !customElements.get("gl-chart")) {
  customElements.define("gl-chart", class extends HTMLElement {
    static observedAttributes = ["type", "data", "options"];
    #width = -1;
    #window = null; // [start, end) of the data while zoomed
    #count = 0; // how many labels, times or candles there are to zoom across
    #marks = []; // { x, y, text } for everything the crosshair can land on
    #at = -1;
    #pointers = new Map();
    #gesture = null;
    #resize = new ResizeObserver(() => this.clientWidth !== this.#width && this.render());

    constructor() {
      super();
      this.addEventListener("pointermove", (e) => (this.#pointers.has(e.pointerId) ? this.#drag(e) : this.#near(e)));
      this.addEventListener("pointerleave", () => this.#show(-1));
      this.addEventListener("pointerdown", (e) => this.#grab(e));
      for (const type of ["pointerup", "pointercancel"]) this.addEventListener(type, (e) => this.#pointers.delete(e.pointerId) && this.#rebase());
      this.addEventListener("dblclick", () => this.#zoomTo(null));
      this.addEventListener("keydown", (e) => this.#key(e));
      this.addEventListener("wheel", (e) => {
        if (!this.#zoomable || !(e.ctrlKey || e.metaKey)) return; // a plain wheel still scrolls the page
        e.preventDefault();
        this.#scale(e.deltaY > 0 ? 1.25 : 0.8);
      }, { passive: false });
    }
    connectedCallback() { this.#resize.observe(this); this.render(); }
    disconnectedCallback() { this.#resize.disconnect(); }
    attributeChangedCallback() { if (this.isConnected) this.render(); }

    get #zoomable() { return this.hasAttribute("zoom") && this.#count > 1; }

    render() {
      const type = this.getAttribute("type"), w = (this.#width = this.clientWidth);
      try {
        const data = JSON.parse(this.getAttribute("data")), o = JSON.parse(this.getAttribute("options") ?? "{}");
        this.#count = ["line", "area", "bar", "candlestick", "ohlc", "rsi", "macd"].includes(type) ? (data.candles ?? data.times ?? data.labels)?.length ?? 0 : 0;
        if (this.#window && this.#zoomable) o.window = this.#window;
        if (w && fluid.has(type)) {
          o.width ??= Math.max(w, 240); // before layout settles a chart can measure only a few pixels wide, too narrow to draw in
          if (type !== "rsi" && type !== "macd") o.height ??= Math.round(clamp(w * 0.6, 220, 360));
        }
        if (w && squares[type]) o.size ??= clamp(w, 280, squares[type]);
        this.innerHTML = chart(type, data, o) + (fluid.has(type) ? `<div class="chart-tip" role="status" hidden></div>` : "");
        if (!fluid.has(type)) return;
        const svg = this.firstElementChild;
        this.#marks = [...svg.querySelectorAll("title")].map((title) => {
          const box = title.parentNode.getBBox(), text = title.textContent;
          title.remove(); // the readout replaces the browser's own tooltip, which would otherwise show as well
          return { x: r(box.x + box.width / 2), y: box.y + box.height / 2, text };
        });
        svg.insertAdjacentHTML("beforeend", `<line class="chart-cross" y1="34" y2="${svg.viewBox.baseVal.height - 28}" visibility="hidden"/>`);
        if (!this.hasAttribute("tabindex")) this.tabIndex = 0;
        this.#show(this.#at);
      } catch (error) {
        this.textContent = `gl-chart: ${error.message}`; // say what is wrong instead of rendering nothing
      }
    }

    /** Moves the crosshair to the i-th mark's column and lists every mark in that column; -1 hides it. */
    #show(i) {
      const svg = this.firstElementChild, tip = this.lastElementChild, cross = svg?.lastElementChild;
      if (!tip?.classList.contains("chart-tip")) return;
      this.#at = i;
      const mark = this.#marks[i];
      tip.hidden = !mark;
      cross.setAttribute("visibility", mark ? "visible" : "hidden");
      if (!mark) return;
      const column = this.getAttribute("type") === "scatter" ? [mark] : this.#marks.filter((m) => m.x === mark.x);
      tip.textContent = column.map((m) => m.text).join("\n");
      cross.setAttribute("x1", mark.x);
      cross.setAttribute("x2", mark.x);
      // Beside the crosshair, on whichever side has room, and never outside the chart.
      const px = (mark.x / svg.viewBox.baseVal.width) * svg.clientWidth, room = this.clientWidth - tip.offsetWidth;
      tip.style.left = `${clamp(px + 12 > room ? px - 12 - tip.offsetWidth : px + 12, 0, Math.max(0, room))}px`;
    }
    #near(e) {
      const svg = this.firstElementChild, box = svg?.getBoundingClientRect();
      if (!this.#marks.length || !box?.width) return;
      const k = svg.viewBox.baseVal.width / box.width, x = (e.clientX - box.left) * k, y = (e.clientY - box.top) * k;
      const far = this.getAttribute("type") === "scatter" ? (m) => Math.hypot(m.x - x, m.y - y) : (m) => Math.abs(m.x - x);
      let best = 0;
      this.#marks.forEach((m, i) => far(m) < far(this.#marks[best]) && (best = i));
      if (best !== this.#at) this.#show(best);
    }

    #zoomTo(window) {
      const n = this.#count;
      this.#window = !window || window[1] - window[0] >= n ? null : window;
      this.#at = -1;
      this.render();
    }
    /** Zooms about the middle of what is showing: a factor under 1 zooms in. Never shows fewer than five items. */
    #scale(factor) {
      const n = this.#count, [a, b] = this.#window ?? [0, n];
      const span = clamp(Math.round((b - a) * factor), Math.min(5, n), n), start = clamp(Math.round((a + b - span) / 2), 0, n - span);
      this.#zoomTo([start, start + span]);
    }
    #pan(steps) {
      const n = this.#count, [a, b] = this.#window ?? [0, n], start = clamp(a + steps, 0, n - (b - a));
      this.#zoomTo([start, start + b - a]);
    }
    // One pointer drags the data sideways; two pinch it. Both are measured from where the gesture began.
    #spread() { const xs = [...this.#pointers.values()]; return { mid: sum(xs) / xs.length, gap: Math.max(...xs) - Math.min(...xs) }; }
    #rebase() { this.#gesture = this.#pointers.size ? { ...this.#spread(), window: this.#window ?? [0, this.#count] } : null; }
    #grab(e) {
      if (!this.#zoomable) return;
      this.setPointerCapture(e.pointerId);
      this.#pointers.set(e.pointerId, e.clientX);
      this.#rebase();
    }
    #drag(e) {
      this.#pointers.set(e.pointerId, e.clientX);
      const n = this.#count, { mid, gap } = this.#spread(), g = this.#gesture, [a, b] = g.window;
      const span = g.gap > 24 && gap > 24 ? clamp(Math.round(((b - a) * g.gap) / gap), Math.min(5, n), n) : b - a;
      const perItem = (this.clientWidth - 58) / (b - a); // 58: the axis gutter either side of the plot
      const start = clamp(Math.round(a + (b - a - span) / 2 + (g.mid - mid) / perItem), 0, n - span);
      const [c, d] = this.#window ?? [0, n];
      if (start !== c || start + span !== d) this.#zoomTo([start, start + span]);
    }
    #key(e) {
      const step = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
      if (this.#zoomable && (e.key === "+" || e.key === "=")) this.#scale(0.8);
      else if (this.#zoomable && e.key === "-") this.#scale(1.25);
      else if (this.#zoomable && e.key === "0") this.#zoomTo(null);
      else if (this.#zoomable && step && e.shiftKey) this.#pan(step);
      else if (e.key === "Escape") this.#show(-1);
      else if (step && this.#marks.length) {
        // Step to the nearest mark in the next column over, wrapping at the ends.
        const xs = [...new Set(this.#marks.map((m) => m.x))].sort((p, q) => p - q);
        const from = xs.indexOf(this.#marks[this.#at]?.x);
        const column = xs[from < 0 ? (step > 0 ? 0 : xs.length - 1) : (from + step + xs.length) % xs.length];
        this.#show(this.#marks.findIndex((m) => m.x === column));
      } else return;
      e.preventDefault();
    }
  });
}
