export type Series = { name: string; values: number[] };
/** Values over categories, or over time when `times` (dates, ISO strings or millisecond numbers) replaces `labels`. */
export type CategoryData = { labels: (string | number)[]; series: Series[] };
export type TimeData = { times: (string | number | Date)[]; series: Series[] };
export type ScatterData = { series: { name: string; points: [x: number, y: number][] }[] };
export type HistogramData = { values: number[] };
export type BoxData = { groups: { name: string; values: number[] }[] };
export type HeatmapData = { rows: (string | number)[]; columns: (string | number)[]; values: number[][] };
export type PieData = { slices: { name: string; value: number }[] };
export type ChordData = { names: string[]; matrix: number[][] };
export type RadarData = { axes: string[]; series: Series[] };
export type Candle = { date: string; open: number; high: number; low: number; close: number; volume?: number };
export type CandleData = { candles: Candle[] };

export type ChartOptions = {
  /** Accessible name for the drawing. */
  label?: string;
  width?: number;
  height?: number;
  /** Draw only this slice of the data: [start, end). Indicators are still worked out from all of it. */
  window?: [start: number, end: number];
};
export type LineOptions = ChartOptions & { smooth?: boolean; zero?: boolean; area?: boolean };
export type BarOptions = ChartOptions & { stacked?: boolean };
export type ScatterOptions = ChartOptions & { radius?: number };
export type HistogramOptions = ChartOptions & { bins?: number };
export type HeatmapOptions = ChartOptions & { cell?: number; values?: boolean };
export type PieOptions = ChartOptions & { donut?: boolean; center?: string | number };
export type SparkOptions = ChartOptions;
export type ChordOptions = ChartOptions & { size?: number; pad?: number };
export type RadarOptions = ChartOptions & { size?: number; max?: number };
export type PriceOptions = ChartOptions & { volume?: boolean; sma?: number[]; bollinger?: true | [period: number, deviations?: number]; heikinAshi?: boolean };
export type RsiOptions = ChartOptions & { period?: number };
export type MacdOptions = ChartOptions & { fast?: number; slow?: number; signal?: number };

/** Every drawing function returns an SVG string. */
export function lineChart(data: CategoryData | TimeData, options?: LineOptions): string;
export function areaChart(data: CategoryData | TimeData, options?: LineOptions): string;
export function barChart(data: CategoryData, options?: BarOptions): string;
export function scatterChart(data: ScatterData, options?: ScatterOptions): string;
export function histogram(data: HistogramData, options?: HistogramOptions): string;
export function boxPlot(data: BoxData, options?: ChartOptions): string;
export function heatmap(data: HeatmapData, options?: HeatmapOptions): string;
export function pieChart(data: PieData, options?: PieOptions): string;
export function sparkline(values: number[], options?: SparkOptions): string;
export function chordDiagram(data: ChordData, options?: ChordOptions): string;
export function radarChart(data: RadarData, options?: RadarOptions): string;
export function candlestickChart(data: CandleData, options?: PriceOptions): string;
export function ohlcChart(data: CandleData, options?: PriceOptions): string;
export function rsiChart(data: CandleData, options?: RsiOptions): string;
export function macdChart(data: CandleData, options?: MacdOptions): string;

/** What each chart type takes, for `chart()` and the React `<Chart>`. */
export type ChartKinds = {
  line: [CategoryData | TimeData, LineOptions];
  area: [CategoryData | TimeData, LineOptions];
  bar: [CategoryData, BarOptions];
  scatter: [ScatterData, ScatterOptions];
  histogram: [HistogramData, HistogramOptions];
  box: [BoxData, ChartOptions];
  heatmap: [HeatmapData, HeatmapOptions];
  pie: [PieData, PieOptions];
  donut: [PieData, PieOptions];
  spark: [number[], SparkOptions];
  chord: [ChordData, ChordOptions];
  radar: [RadarData, RadarOptions];
  candlestick: [CandleData, PriceOptions];
  ohlc: [CandleData, PriceOptions];
  rsi: [CandleData, RsiOptions];
  macd: [CandleData, MacdOptions];
};
export type ChartType = keyof ChartKinds;

/** Draws any chart by name. */
export function chart<T extends ChartType>(type: T, data: ChartKinds[T][0], options?: ChartKinds[T][1]): string;

/** Round tick values covering [min, max]. */
export function ticks(min: number, max: number, count?: number): number[];
/** Tick times (milliseconds, UTC) on round calendar boundaries, and a label format to match. */
export function timeTicks(min: number, max: number, count?: number): { ticks: number[]; format: (time: number) => string };
export function boxStats(values: number[]): { q1: number; median: number; q3: number; low: number; high: number; outliers: number[] };

/** Indicators return one entry per input value, with null until there is enough history. */
export function sma(values: number[], period: number): (number | null)[];
export function ema(values: number[], period: number): (number | null)[];
export function rsi(values: number[], period?: number): (number | null)[];
export function bollinger(values: number[], period?: number, deviations?: number): ({ mid: number; upper: number; lower: number } | null)[];
export function macd(values: number[], fast?: number, slow?: number, signal?: number): { macd: number | null; signal: number | null; histogram: number | null }[];
export function heikinAshi(candles: Candle[]): Candle[];
