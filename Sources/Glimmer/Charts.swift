import Charts
import SwiftUI

// Standard charts are Apple's own Swift Charts (LineMark, BarMark, AreaMark, PointMark, RectangleMark, SectorMark),
// themed with `.glimmerChartStyle()`. Only the chord diagram, which Swift Charts has no mark for, is drawn here.

public extension Tokens {
    /// Series colours in order, as in the web kit's charts: the five accents, then three blends of them.
    static let chartPalette: [Color] = [
        primary, secondary, success, warning, danger,
        blend(secondary, danger), blend(secondary, success), blend(primary, danger),
    ]

    private static func blend(_ a: Color, _ b: Color) -> Color {
        let x = a.resolve(in: EnvironmentValues()), y = b.resolve(in: EnvironmentValues())
        return Color(.sRGB, red: Double(x.red + y.red) / 2, green: Double(x.green + y.green) / 2, blue: Double(x.blue + y.blue) / 2)
    }
}

public extension View {
    /// Styles a Swift Charts `Chart` to match Glimmer: the kit's series colours, hairline gridlines and mono axis labels.
    /// Colour your marks with `.foregroundStyle(by: .value("Series", name))` so the palette applies.
    func glimmerChartStyle() -> some View {
        chartForegroundStyleScale(range: Tokens.chartPalette)
            .chartXAxis {
                AxisMarks { _ in
                    AxisValueLabel().font(.glimmerMono()).foregroundStyle(Tokens.muted)
                }
            }
            .chartYAxis {
                AxisMarks { _ in
                    AxisGridLine().foregroundStyle(.white.opacity(0.08))
                    AxisValueLabel().font(.glimmerMono()).foregroundStyle(Tokens.muted)
                }
            }
            .chartLegend(position: .top, alignment: .leading)
    }
}

/// Flows between groups: each group is an arc on the ring, and a ribbon joins every pair that exchanges something.
/// `matrix[i][j]` is the flow from group i to group j; a ribbon takes the colour of whichever side sends more.
/// Same layout as the web kit's `chordDiagram`.
public struct ChordDiagram: View {
    var names: [String]
    var matrix: [[Double]]

    public init(names: [String], matrix: [[Double]]) {
        self.names = names
        self.matrix = matrix
    }

    public var body: some View {
        Canvas { context, size in
            let n = names.count
            let totals = matrix.map { $0.reduce(0, +) }
            let total = totals.reduce(0, +)
            guard n > 0, matrix.count == n, matrix.allSatisfy({ $0.count == n }), total > 0 else {
                // Say what is wrong instead of drawing nothing.
                context.draw(Text("ChordDiagram: matrix must be square, match names, and contain a flow").font(.glimmerMono()), at: CGPoint(x: size.width / 2, y: size.height / 2))
                return
            }

            // Drawn in the web kit's 480-point design space, scaled to fit. Angles run clockwise from twelve o'clock.
            let scale = min(size.width, size.height) / 480
            let centre = CGPoint(x: size.width / 2, y: size.height / 2)
            let outer = 150 * scale, inner = outer - 12 * scale, ribbon = inner - 4 * scale
            let pad = 0.05, k = (2 * Double.pi - pad * Double(n)) / total
            func point(_ radius: CGFloat, _ a: Double) -> CGPoint {
                CGPoint(x: centre.x + radius * sin(a), y: centre.y - radius * cos(a))
            }
            func arc(_ path: inout Path, _ radius: CGFloat, _ a0: Double, _ a1: Double, backwards: Bool = false) {
                path.addArc(center: centre, radius: radius, startAngle: .radians(a0 - .pi / 2), endAngle: .radians(a1 - .pi / 2), clockwise: backwards)
            }

            // Each group's span on the ring, split into one sub-span per partner.
            var angle = 0.0
            var spans: [(start: Double, end: Double, cells: [(Double, Double)])] = []
            for row in matrix {
                let start = angle
                let cells = row.map { value -> (Double, Double) in
                    let a0 = angle
                    angle += value * k
                    return (a0, angle)
                }
                spans.append((start, angle, cells))
                angle += pad
            }
            let colour = { (i: Int) in Tokens.chartPalette[i % Tokens.chartPalette.count] }

            for i in 0..<n {
                for j in i..<n where matrix[i][j] > 0 || matrix[j][i] > 0 {
                    let (s, t) = matrix[i][j] >= matrix[j][i] ? (i, j) : (j, i)
                    let from = spans[s].cells[t], to = spans[t].cells[s]
                    var path = Path()
                    path.move(to: point(ribbon, from.0))
                    arc(&path, ribbon, from.0, from.1)
                    if s != t {
                        path.addQuadCurve(to: point(ribbon, to.0), control: centre)
                        arc(&path, ribbon, to.0, to.1)
                    }
                    path.addQuadCurve(to: point(ribbon, from.0), control: centre)
                    path.closeSubpath()
                    context.fill(path, with: .color(colour(s).opacity(0.32)))
                    context.stroke(path, with: .color(colour(s).opacity(0.55)), lineWidth: 0.75)
                }
            }

            for (i, span) in spans.enumerated() {
                var ring = Path()
                arc(&ring, outer, span.start, span.end)
                arc(&ring, inner, span.end, span.start, backwards: true)
                ring.closeSubpath()
                context.fill(ring, with: .color(colour(i)))

                let mid = (span.start + span.end) / 2, side = sin(mid)
                context.draw(
                    Text(names[i]).font(.glimmerMono()).foregroundStyle(Tokens.muted),
                    at: point(outer + 10 * scale, mid),
                    anchor: side > 0.15 ? .leading : side < -0.15 ? .trailing : .center)
            }
        }
        .frame(minWidth: 200, idealWidth: 360, maxWidth: .infinity, minHeight: 200, idealHeight: 360, maxHeight: .infinity)
        .aspectRatio(1, contentMode: .fit)
        .accessibilityLabel("Chord diagram of flows between \(names.joined(separator: ", "))")
    }
}
