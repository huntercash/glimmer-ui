import Charts
import SwiftUI

/// One period of trading.
public struct Candle: Sendable {
    public var date: String
    public var open: Double
    public var high: Double
    public var low: Double
    public var close: Double
    public var volume: Double?

    public init(date: String, open: Double, high: Double, low: Double, close: Double, volume: Double? = nil) {
        self.date = date
        self.open = open
        self.high = high
        self.low = low
        self.close = close
        self.volume = volume
    }
}

/// The calculations behind the stock charts, as plain functions. They match the web kit's, value for value.
public enum Indicators {
    /// Simple moving average of the last n values; nil until there are n of them.
    public static func sma(_ values: [Double], _ n: Int) -> [Double?] {
        values.indices.map { i in i < n - 1 || n < 1 ? nil : values[(i - n + 1)...i].reduce(0, +) / Double(n) }
    }

    /// Exponential moving average, seeded with the simple average of the first n values; nil before that.
    public static func ema(_ values: [Double], _ n: Int) -> [Double?] {
        let k = 2 / Double(n + 1)
        var previous = 0.0
        return values.indices.map { i in
            if i < n - 1 || n < 1 { return nil }
            previous = i == n - 1 ? values[0..<n].reduce(0, +) / Double(n) : values[i] * k + previous * (1 - k)
            return previous
        }
    }

    /// Bollinger bands: a moving average with a band k standard deviations either side; nil until there are n values.
    public static func bollinger(_ values: [Double], n: Int = 20, k: Double = 2) -> [(mid: Double, upper: Double, lower: Double)?] {
        sma(values, n).enumerated().map { i, mid in
            guard let mid else { return nil }
            let deviation = (values[(i - n + 1)...i].map { ($0 - mid) * ($0 - mid) }.reduce(0, +) / Double(n)).squareRoot()
            return (mid, mid + k * deviation, mid - k * deviation)
        }
    }

    /// Relative strength index with Wilder's smoothing, from 0 to 100; nil for the first n values.
    public static func rsi(_ values: [Double], _ n: Int = 14) -> [Double?] {
        var gain = 0.0, loss = 0.0
        return values.indices.map { i in
            if i == 0 || n < 1 { return nil }
            let change = values[i] - values[i - 1], up = max(change, 0), down = max(-change, 0)
            if i <= n {
                gain += up / Double(n)
                loss += down / Double(n)
                if i < n { return nil }
            } else {
                gain = (gain * Double(n - 1) + up) / Double(n)
                loss = (loss * Double(n - 1) + down) / Double(n)
            }
            return loss == 0 ? (gain == 0 ? 50 : 100) : 100 - 100 / (1 + gain / loss)
        }
    }

    /// MACD: the gap between a fast and a slow EMA, that gap's own EMA as the signal line, and their difference as the histogram.
    public static func macd(_ values: [Double], fast: Int = 12, slow: Int = 26, signal: Int = 9) -> [(macd: Double?, signal: Double?, histogram: Double?)] {
        let quick = ema(values, fast), steady = ema(values, slow)
        let line: [Double?] = values.indices.map { i in
            guard let q = quick[i], let s = steady[i] else { return nil }
            return q - s
        }
        let start = line.firstIndex { $0 != nil } ?? line.count
        let smoothed = ema(line[start...].compactMap { $0 }, signal)
        return line.indices.map { i in
            let sig = i >= start ? smoothed[i - start] : nil
            guard let value = line[i], let sig else { return (line[i], sig, nil) }
            return (value, sig, value - sig)
        }
    }

    /// Heikin-Ashi candles: each one averaged with the last, which smooths out noise so the trend shows.
    public static func heikinAshi(_ candles: [Candle]) -> [Candle] {
        var previous: Candle?
        return candles.map { day in
            var averaged = day
            averaged.close = (day.open + day.high + day.low + day.close) / 4
            averaged.open = previous.map { ($0.open + $0.close) / 2 } ?? (day.open + day.close) / 2
            averaged.high = max(day.high, averaged.open, averaged.close)
            averaged.low = min(day.low, averaged.open, averaged.close)
            previous = averaged
            return averaged
        }
    }
}

/// Shared look for the stock panels: evenly spaced periods (so weekends leave no gaps), a few date labels, quiet gridlines.
private struct PeriodAxes: ViewModifier {
    var dates: [String]
    var showsLabels = true

    func body(content: Content) -> some View {
        let step = max(dates.count / 5, 1)
        content
            .chartXScale(domain: -0.7...(Double(max(dates.count, 1)) - 0.3))
            .chartXAxis {
                AxisMarks(values: Array(stride(from: 0, to: dates.count, by: step)).map(Double.init)) { value in
                    AxisValueLabel {
                        if showsLabels, let i = value.as(Double.self), dates.indices.contains(Int(i)) {
                            Text(dates[Int(i)]).font(.glimmerMono()).foregroundStyle(Tokens.muted)
                        }
                    }
                }
            }
            .chartYAxis {
                AxisMarks { _ in
                    AxisGridLine().foregroundStyle(.white.opacity(0.08))
                    AxisValueLabel().font(.glimmerMono()).foregroundStyle(Tokens.muted)
                }
            }
    }
}

private struct ChartLegend: View {
    var names: [String]

    var body: some View {
        HStack(spacing: 14) {
            ForEach(Array(names.enumerated()), id: \.offset) { i, name in
                HStack(spacing: 6) {
                    Circle().fill(Tokens.chartPalette[i % Tokens.chartPalette.count]).frame(width: 8, height: 8)
                    Text(name).font(.glimmerMono()).foregroundStyle(Tokens.muted)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

/// Candlesticks or OHLC bars, green (and lightly filled) when the price rose and red (solid) when it fell, with an optional volume panel,
/// moving averages and Bollinger bands. The same chart as the web kit's `candlestickChart` and `ohlcChart`.
public struct StockChart: View {
    public enum Style { case candlestick, ohlc }

    var candles: [Candle]
    var style: Style
    var movingAverages: [Int]
    var bollinger: (period: Int, deviations: Double)?
    var showsVolume: Bool
    var heikinAshi: Bool

    public init(_ candles: [Candle], style: Style = .candlestick, movingAverages: [Int] = [], bollinger: (period: Int, deviations: Double)? = nil, showsVolume: Bool = true, heikinAshi: Bool = false) {
        self.candles = candles
        self.style = style
        self.movingAverages = movingAverages
        self.bollinger = bollinger
        self.showsVolume = showsVolume
        self.heikinAshi = heikinAshi
    }

    private func colour(_ day: Candle) -> Color { day.close >= day.open ? Tokens.success : Tokens.danger }

    public var body: some View {
        let data = heikinAshi ? Indicators.heikinAshi(candles) : candles
        let closes = data.map(\.close)
        let dates = data.map(\.date)
        let palette = Tokens.chartPalette
        let band = bollinger.map { Indicators.bollinger(closes, n: $0.period, k: $0.deviations) } ?? []
        let bandColour = palette[movingAverages.count % palette.count]
        let names = movingAverages.map { "SMA \($0)" } + (bollinger.map { ["Bollinger \($0.period), \(String(format: "%g", $0.deviations))"] } ?? [])

        VStack(spacing: 6) {
            if !names.isEmpty { ChartLegend(names: names) }
            Chart {
                ForEach(Array(band.enumerated()), id: \.offset) { i, edge in
                    if let edge {
                        AreaMark(x: .value("Period", Double(i)), yStart: .value("Lower", edge.lower), yEnd: .value("Upper", edge.upper))
                            .foregroundStyle(bandColour.opacity(0.08))
                        LineMark(x: .value("Period", Double(i)), y: .value("Upper", edge.upper), series: .value("Line", "upper"))
                            .foregroundStyle(bandColour).lineStyle(StrokeStyle(lineWidth: 1.5))
                        LineMark(x: .value("Period", Double(i)), y: .value("Lower", edge.lower), series: .value("Line", "lower"))
                            .foregroundStyle(bandColour).lineStyle(StrokeStyle(lineWidth: 1.5))
                    }
                }
                ForEach(Array(data.enumerated()), id: \.offset) { i, day in
                    if style == .candlestick {
                        // The wick stops at the body, and a rising body is only lightly filled, so rise and fall
                        // differ by shape as well as colour (the web kit draws rising candles hollow).
                        RuleMark(x: .value("Period", Double(i)), yStart: .value("Body", max(day.open, day.close)), yEnd: .value("High", day.high))
                            .foregroundStyle(colour(day)).lineStyle(StrokeStyle(lineWidth: 1.25))
                        RuleMark(x: .value("Period", Double(i)), yStart: .value("Low", day.low), yEnd: .value("Body", min(day.open, day.close)))
                            .foregroundStyle(colour(day)).lineStyle(StrokeStyle(lineWidth: 1.25))
                        RectangleMark(xStart: .value("Period", Double(i) - 0.32), xEnd: .value("Period", Double(i) + 0.32), yStart: .value("Open", day.open), yEnd: .value("Close", day.close))
                            .foregroundStyle(colour(day).opacity(day.close >= day.open ? 0.28 : 1))
                    } else {
                        RuleMark(x: .value("Period", Double(i)), yStart: .value("Low", day.low), yEnd: .value("High", day.high))
                            .foregroundStyle(colour(day)).lineStyle(StrokeStyle(lineWidth: 1.25))
                        RuleMark(xStart: .value("Period", Double(i) - 0.32), xEnd: .value("Period", Double(i)), y: .value("Open", day.open))
                            .foregroundStyle(colour(day)).lineStyle(StrokeStyle(lineWidth: 1.25))
                        RuleMark(xStart: .value("Period", Double(i)), xEnd: .value("Period", Double(i) + 0.32), y: .value("Close", day.close))
                            .foregroundStyle(colour(day)).lineStyle(StrokeStyle(lineWidth: 1.25))
                    }
                }
                ForEach(Array(movingAverages.enumerated()), id: \.offset) { k, period in
                    ForEach(Array(Indicators.sma(closes, period).enumerated()), id: \.offset) { i, value in
                        if let value {
                            LineMark(x: .value("Period", Double(i)), y: .value("Average", value), series: .value("Line", "SMA \(period)"))
                                .foregroundStyle(palette[k % palette.count]).lineStyle(StrokeStyle(lineWidth: 1.5))
                        }
                    }
                }
            }
            .chartYScale(domain: .automatic(includesZero: false))
            .modifier(PeriodAxes(dates: dates, showsLabels: !hasVolume(data)))

            if hasVolume(data) {
                Chart {
                    ForEach(Array(data.enumerated()), id: \.offset) { i, day in
                        RectangleMark(xStart: .value("Period", Double(i) - 0.32), xEnd: .value("Period", Double(i) + 0.32), yStart: .value("Zero", 0), yEnd: .value("Volume", day.volume ?? 0))
                            .foregroundStyle(colour(day).opacity(0.3))
                    }
                }
                .modifier(PeriodAxes(dates: dates))
                .chartYAxis(.hidden)
                .frame(height: 64)
            }
        }
        .accessibilityLabel("\(style == .candlestick ? "Candlestick" : "OHLC") chart of \(data.count) periods")
    }

    private func hasVolume(_ data: [Candle]) -> Bool {
        showsVolume && !data.isEmpty && data.allSatisfy { $0.volume != nil }
    }
}

/// RSI in its own panel, with guide lines at 30 and 70. Put it under a `StockChart` of the same candles.
public struct RSIChart: View {
    var candles: [Candle]
    var period: Int

    public init(_ candles: [Candle], period: Int = 14) {
        self.candles = candles
        self.period = period
    }

    public var body: some View {
        VStack(spacing: 6) {
            ChartLegend(names: ["RSI \(period)"])
            Chart {
                RuleMark(y: .value("Oversold", 30)).foregroundStyle(.white.opacity(0.28)).lineStyle(StrokeStyle(lineWidth: 1, dash: [4, 4]))
                RuleMark(y: .value("Overbought", 70)).foregroundStyle(.white.opacity(0.28)).lineStyle(StrokeStyle(lineWidth: 1, dash: [4, 4]))
                ForEach(Array(Indicators.rsi(candles.map(\.close), period).enumerated()), id: \.offset) { i, value in
                    if let value {
                        LineMark(x: .value("Period", Double(i)), y: .value("RSI", value)).foregroundStyle(Tokens.primary)
                    }
                }
            }
            .chartYScale(domain: 0...100)
            .modifier(PeriodAxes(dates: candles.map(\.date)))
        }
    }
}

/// MACD in its own panel: the histogram as bars with the MACD and signal lines over it.
public struct MACDChart: View {
    var candles: [Candle]
    var fast: Int
    var slow: Int
    var signal: Int

    public init(_ candles: [Candle], fast: Int = 12, slow: Int = 26, signal: Int = 9) {
        self.candles = candles
        self.fast = fast
        self.slow = slow
        self.signal = signal
    }

    public var body: some View {
        let rows = Indicators.macd(candles.map(\.close), fast: fast, slow: slow, signal: signal)
        VStack(spacing: 6) {
            ChartLegend(names: ["MACD \(fast), \(slow)", "Signal \(signal)"])
            Chart {
                ForEach(Array(rows.enumerated()), id: \.offset) { i, row in
                    if let bar = row.histogram {
                        RectangleMark(xStart: .value("Period", Double(i) - 0.32), xEnd: .value("Period", Double(i) + 0.32), yStart: .value("Zero", 0), yEnd: .value("Histogram", bar))
                            .foregroundStyle((bar >= 0 ? Tokens.success : Tokens.danger).opacity(0.85))
                    }
                    if let value = row.macd {
                        LineMark(x: .value("Period", Double(i)), y: .value("MACD", value), series: .value("Line", "macd"))
                            .foregroundStyle(Tokens.chartPalette[0]).lineStyle(StrokeStyle(lineWidth: 1.5))
                    }
                    if let value = row.signal {
                        LineMark(x: .value("Period", Double(i)), y: .value("Signal", value), series: .value("Line", "signal"))
                            .foregroundStyle(Tokens.chartPalette[1]).lineStyle(StrokeStyle(lineWidth: 1.5))
                    }
                }
            }
            .modifier(PeriodAxes(dates: candles.map(\.date)))
        }
    }
}

/// Several measures per series, on spokes around a centre. The same chart as the web kit's `radarChart`.
public struct RadarChart: View {
    public struct Series {
        public var name: String
        public var values: [Double]

        public init(_ name: String, _ values: [Double]) {
            self.name = name
            self.values = values
        }
    }

    var axes: [String]
    var series: [Series]
    var max: Double?

    public init(axes: [String], series: [Series], max: Double? = nil) {
        self.axes = axes
        self.series = series
        self.max = max
    }

    public var body: some View {
        VStack(spacing: 6) {
            ChartLegend(names: series.map(\.name))
            Canvas { context, size in
                let n = axes.count
                guard n >= 3 else {
                    context.draw(Text("RadarChart: needs at least three axes").font(.glimmerMono()), at: CGPoint(x: size.width / 2, y: size.height / 2))
                    return
                }
                // The outer ring sits at a round number above the largest value, unless a maximum is given.
                let largest = series.flatMap(\.values).max() ?? 1
                let magnitude = pow(10, floor(log10(Swift.max(largest, .leastNonzeroMagnitude))))
                let top = max ?? ([1, 2, 2.5, 5, 10].map { $0 * magnitude }.first { $0 >= largest } ?? largest)

                let scale = min(size.width, size.height) / 420
                let centre = CGPoint(x: size.width / 2, y: size.height / 2), radius = 130 * scale
                func point(_ i: Int, _ fraction: Double) -> CGPoint {
                    let a = Double(i) / Double(n) * 2 * .pi
                    return CGPoint(x: centre.x + radius * fraction * sin(a), y: centre.y - radius * fraction * cos(a))
                }
                func polygon(_ fractions: [Double]) -> Path {
                    var path = Path()
                    path.addLines(fractions.enumerated().map { point($0.offset, $0.element) })
                    path.closeSubpath()
                    return path
                }

                for ring in [0.25, 0.5, 0.75, 1] {
                    context.stroke(polygon(Array(repeating: ring, count: n)), with: .color(.white.opacity(0.08)))
                }
                for (i, name) in axes.enumerated() {
                    var spoke = Path()
                    spoke.move(to: centre)
                    spoke.addLine(to: point(i, 1))
                    context.stroke(spoke, with: .color(.white.opacity(0.08)))
                    let side = sin(Double(i) / Double(n) * 2 * .pi)
                    context.draw(Text(name).font(.glimmerMono()).foregroundStyle(Tokens.muted), at: point(i, 1 + 12 * scale / radius), anchor: side > 0.15 ? .leading : side < -0.15 ? .trailing : .center)
                }
                for (k, item) in series.enumerated() where item.values.count == n {
                    let colour = Tokens.chartPalette[k % Tokens.chartPalette.count]
                    let shape = polygon(item.values.map { Swift.min(Swift.max($0 / top, 0), 1) })
                    context.fill(shape, with: .color(colour.opacity(0.14)))
                    context.stroke(shape, with: .color(colour), style: StrokeStyle(lineWidth: 2, lineJoin: .round))
                }
            }
            .frame(minWidth: 200, idealWidth: 360, maxWidth: .infinity, minHeight: 200, idealHeight: 360, maxHeight: .infinity)
            .aspectRatio(1, contentMode: .fit)
        }
        .accessibilityLabel("Radar chart comparing \(series.map(\.name).joined(separator: ", ")) across \(axes.joined(separator: ", "))")
    }
}
