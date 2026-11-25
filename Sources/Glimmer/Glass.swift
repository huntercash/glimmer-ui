import SwiftUI

/// The signature surface: frosted material, hairline border, and a tinted light inside
/// that follows the pointer on macOS / iPadOS (it rests bottom-right on touch).
struct Glass: ViewModifier {
    var tint: Color
    var radius: CGFloat
    @State private var pointer: CGPoint?
    @Environment(\.glimmerFrost) private var frost

    func body(content: Content) -> some View {
        let shape = RoundedRectangle(cornerRadius: radius, style: .continuous)
        let n = min(max(frost, 1), 5) - 1 // level, counted from 0
        let f = max(n / 2, n * 2 - 4)     // frost amount per level: 0, 0.5, 1, 2, 4 — small steps first, big ones last
        let l = min(f, 2) / 2             // inner light: off on clear glass, full from level 3
        let r = 1 - l                     // edge reflections: full on clear glass, gone by level 3
        content
            .background {
                GeometryReader { geo in
                    let w = max(geo.size.width, 1), h = max(geo.size.height, 1)
                    let light = pointer.map { UnitPoint(x: $0.x / w, y: $0.y / h) } ?? UnitPoint(x: 0.72, y: 0.88)
                    ZStack {
                        // the frost: a blur, a darker body and a milky wash, all scaled by f (nothing at clear glass)
                        shape.fill(f > 3 ? AnyShapeStyle(.regularMaterial) : f > 2 ? AnyShapeStyle(.thinMaterial) : AnyShapeStyle(.ultraThinMaterial))
                            .opacity(l)
                        shape.fill(Tokens.surface.opacity(f * 0.15))
                        shape.fill(LinearGradient(colors: [.white.opacity(f * 0.085), .white.opacity(f * 0.035)], startPoint: .top, endPoint: .bottom))
                        // the light: a hot core that falls off slowly
                        shape.fill(RadialGradient(
                            stops: [.init(color: tint.opacity(0.8 * l), location: 0), .init(color: tint.opacity(0.32 * l), location: 0.38), .init(color: .clear, location: 0.78)],
                            center: light, startRadius: 0, endRadius: 240))
                    }
                }
            }
            // rim: white where the top edge catches light, tinted along the bottom
            .overlay(shape.strokeBorder(
                LinearGradient(colors: [.white.opacity(0.5), .white.opacity(0.22), tint.opacity(0.55)], startPoint: .top, endPoint: .bottom),
                lineWidth: 1))
            // clear glass only: white glints on the top-right and bottom-left corners, each with a soft colour fringe
            .overlay {
                ZStack {
                    shape.strokeBorder(
                        LinearGradient(stops: [.init(color: Tokens.secondary, location: 0), .init(color: .clear, location: 0.4), .init(color: .clear, location: 0.6), .init(color: Tokens.primary, location: 1)],
                                       startPoint: .topTrailing, endPoint: .bottomLeading),
                        lineWidth: 6)
                        .blur(radius: 4)
                    shape.strokeBorder(
                        LinearGradient(stops: [.init(color: .white.opacity(0.9), location: 0), .init(color: .clear, location: 0.4), .init(color: .clear, location: 0.6), .init(color: .white.opacity(0.65), location: 1)],
                                       startPoint: .topTrailing, endPoint: .bottomLeading),
                        lineWidth: 1.5)
                }
                .clipShape(shape)
                .opacity(r)
                .allowsHitTesting(false)
            }
            .shadow(color: .black.opacity(0.5), radius: 16, y: 10)
            .shadow(color: tint.opacity(0.4 * l), radius: 30, y: 8)
            .onContinuousHover { phase in
                if case .active(let point) = phase { pointer = point }
            }
    }
}

private struct FrostKey: EnvironmentKey {
    static let defaultValue: Double = 3
}

extension EnvironmentValues {
    var glimmerFrost: Double {
        get { self[FrostKey.self] }
        set { self[FrostKey.self] = newValue }
    }
}

public extension View {
    /// Turns any view into a glass surface. `tint` colours the light inside it.
    func glass(tint: Color = Tokens.secondary, radius: CGFloat = Tokens.radiusLg) -> some View {
        modifier(Glass(tint: tint, radius: radius))
    }

    /// Apply once at the root. Sets the dark scheme, page colours, and the accent for every
    /// native control (Toggle, Slider, ProgressView, Gauge, Picker, Link...), so those need no custom styles.
    func glimmerTheme() -> some View {
        tint(Tokens.primary)
            .font(.glimmer(.body))
            .foregroundStyle(Tokens.content)
            .background(Tokens.base)
            .preferredColorScheme(.dark)
    }

    /// Frost level for every glass surface inside this view, 1 (clear) to 5 (milky). Default 3.
    func glimmerFrost(_ level: Double) -> some View {
        environment(\.glimmerFrost, level)
    }

    /// Small mono caps label: section heads, stat titles, counts.
    func metaStyle() -> some View {
        font(.glimmerMono(.caption2))
            .textCase(.uppercase)
            .tracking(1)
            .foregroundStyle(Tokens.muted)
    }
}

/// Dotted backdrop that fades toward the edges. Put it behind content with `.background(DotGrid())`.
public struct DotGrid: View {
    public init() {}

    public var body: some View {
        Canvas { context, size in
            for x in stride(from: 7.0, to: size.width, by: 14) {
                for y in stride(from: 7.0, to: size.height, by: 14) {
                    context.fill(Path(ellipseIn: CGRect(x: x, y: y, width: 1.5, height: 1.5)), with: .color(.white.opacity(0.13)))
                }
            }
        }
        .mask(EllipticalGradient(colors: [.black, .clear], center: .center, startRadiusFraction: 0.2, endRadiusFraction: 0.6))
        .accessibilityHidden(true)
    }
}

/// Backdrop of flowing strands of light, warm to cool, fading out to the trailing edge.
/// Put it behind content with `.background(Streaks())`.
public struct Streaks: View {
    public init() {}

    public var body: some View {
        Canvas { context, size in
            // Drawn in an 800 x 600 design space scaled to cover the view, the same as the web kit's SVG.
            // Each strand is two summed sine waves; neighbours share almost the same phase, so they flow together.
            let scale = max(size.width / 800, size.height / 600)
            context.translateBy(x: size.width / 2, y: size.height / 2)
            context.scaleBy(x: scale, y: scale)
            context.rotate(by: .degrees(-14))
            context.translateBy(x: -400, y: -300)

            func noise(_ i: Int, _ k: Double) -> Double {
                let v = sin(Double(i) * 12.9898 + k * 78.233) * 43758.5453
                return v - v.rounded(.down)
            }
            let count = 40
            let shading = GraphicsContext.Shading.linearGradient(
                Gradient(colors: [Tokens.primary, Tokens.secondary]), startPoint: CGPoint(x: 400, y: 0), endPoint: CGPoint(x: 400, y: 600))
            for i in 0..<count {
                let t = Double(i) / Double(count - 1)
                let y0 = -160 + 920 * t + (noise(i, 1) - 0.5) * 12
                var strand = Path()
                for x in stride(from: -300.0, through: 1100, by: 20) {
                    let y = y0 + 26 * sin(x / 190 + 5 * t) + 14 * sin(x / 83 + 11 * t + 1.7)
                    if x == -300 { strand.move(to: CGPoint(x: x, y: y)) } else { strand.addLine(to: CGPoint(x: x, y: y)) }
                }
                let level = Int(noise(i, 2) * 4)
                context.opacity = [0.95, 0.6, 0.34, 0.18][level]
                context.stroke(strand, with: shading, style: StrokeStyle(lineWidth: [1.4, 1.2, 1, 0.9][level], lineCap: .round))
            }
        }
        .mask(LinearGradient(stops: [.init(color: .black, location: 0.2), .init(color: .clear, location: 0.9)], startPoint: .leading, endPoint: .trailing))
        .accessibilityHidden(true)
    }
}
