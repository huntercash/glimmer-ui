import SwiftUI

// Styles for native controls. Use the system control; hand it a Glimmer style.

/// A glass button with an edge light: the colour lives only in the light, never the body.
/// Follows `.glimmerFrost(_:)` like every glass surface. `Button("Save") {}.buttonStyle(.glimmer(.primary))`
public struct GlimmerButtonStyle: ButtonStyle {
    public enum Kind {
        case neutral
        /// Glass body, edge light in this colour.
        case glass(Color)
        /// Edge light only, no glass body.
        case outline(Color)
        /// No body and no ring: coloured label, faint tint on hover.
        case ghost(Color)
        @available(*, deprecated, renamed: "glass", message: "Buttons are glass now; the colour is in the edge light.")
        case filled(Color)

        public static let primary = Kind.glass(Tokens.primary)
        public static let secondary = Kind.glass(Tokens.secondary)
        public static let success = Kind.glass(Tokens.success)
        public static let warning = Kind.glass(Tokens.warning)
        public static let danger = Kind.glass(Tokens.danger)
    }

    var kind: Kind

    public func makeBody(configuration: Configuration) -> some View {
        GlimmerButton(kind: kind, configuration: configuration)
    }
}

private struct GlimmerButton: View {
    var kind: GlimmerButtonStyle.Kind
    var configuration: ButtonStyleConfiguration
    @State private var hovering = false
    @Environment(\.isEnabled) private var isEnabled
    @Environment(\.glimmerFrost) private var frost

    // Which layers this kind draws, and its colour.
    private var parts: (color: Color, body: Bool, ring: Bool) {
        switch kind {
        case .neutral: (Tokens.content, true, true)
        case .glass(let c): (c, true, true)
        case .outline(let c): (c, false, true)
        case .ghost(let c): (c, false, false)
        default: (Tokens.content, true, true) // the deprecated .filled
        }
    }

    var body: some View {
        let shape = RoundedRectangle(cornerRadius: Tokens.radiusMd, style: .continuous)
        let (c, hasBody, hasRing) = parts
        let n = min(max(frost, 1), 5) - 1 // same frost maths as Glass
        let f = max(n / 2, n * 2 - 4)     // 0, 0.5, 1, 2, 4
        let r = 1 - min(f, 2) / 2         // clear-glass glint, gone by level 3
        configuration.label
            .font(.glimmer(.subheadline, weight: .medium))
            .padding(.horizontal, 16)
            .frame(minHeight: 40)
            .foregroundStyle(hasRing ? Tokens.content : c)
            .background {
                if hasBody {
                    ZStack {
                        // the frost: blur, a darker body and a milky wash, scaled by f
                        shape.fill(f > 2 ? AnyShapeStyle(.thinMaterial) : AnyShapeStyle(.ultraThinMaterial)).opacity(0.25 + min(f, 2) * 0.375)
                        shape.fill(Tokens.surface.opacity(f * 0.15))
                        shape.fill(LinearGradient(colors: [.white.opacity(0.05 + f * 0.075), .white.opacity(0.02 + f * 0.03)], startPoint: .top, endPoint: .bottom))
                        // clear glass only: light pooling in the top-right corner
                        shape.fill(RadialGradient(colors: [.white.opacity(0.16 * r), .clear], center: .topTrailing, startRadius: 0, endRadius: 50))
                        // the colour's light spilling in from the top-left, where the ring is brightest
                        shape.fill(RadialGradient(colors: [c.opacity(0.3), .clear], center: UnitPoint(x: 0.18, y: 0), startRadius: 0, endRadius: 60))
                    }
                } else if case .ghost = kind, hovering {
                    shape.fill(c.opacity(0.1))
                }
            }
            // the edge light: white where light hits the top-left, the colour sweeping round and fading on the far side
            .overlay {
                if hasRing {
                    shape.strokeBorder(LinearGradient(stops: [
                        .init(color: .white, location: 0), .init(color: c, location: 0.22), .init(color: c.opacity(0.15), location: 0.55),
                        .init(color: c, location: 0.88), .init(color: c.opacity(0.7), location: 1),
                    ], startPoint: .topLeading, endPoint: .bottomTrailing), lineWidth: 1.5)
                }
            }
            .shadow(color: hasBody ? c.opacity(hovering ? 0.7 : 0.45) : .clear, radius: hovering ? 11 : 12, y: hovering ? 0 : 6)
            .contentShape(shape)
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .opacity(isEnabled ? 1 : 0.5)
            .onHover { hovering = $0 }
            .animation(.easeOut(duration: Tokens.durationFast), value: configuration.isPressed)
            .animation(.easeOut(duration: Tokens.durationFast), value: hovering)
    }
}

public extension ButtonStyle where Self == GlimmerButtonStyle {
    static var glimmer: Self { .init(kind: .neutral) }
    static func glimmer(_ kind: GlimmerButtonStyle.Kind) -> Self { .init(kind: kind) }
}

/// `GroupBox("Title") { ... }.groupBoxStyle(.glimmer)` is the card.
public struct GlimmerCardStyle: GroupBoxStyle {
    var tint: Color

    public func makeBody(configuration: Configuration) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            configuration.label.font(.glimmer(.headline, weight: .semibold))
            configuration.content
        }
        .padding(20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .glass(tint: tint)
    }
}

public extension GroupBoxStyle where Self == GlimmerCardStyle {
    static var glimmer: Self { .init(tint: Tokens.secondary) }
    static func glimmer(tint: Color) -> Self { .init(tint: tint) }
}

/// `TextField("Email", text: $email).glimmerField()` — also works on SecureField and TextEditor.
struct FieldChrome: ViewModifier {
    @FocusState private var focused: Bool

    func body(content: Content) -> some View {
        let shape = RoundedRectangle(cornerRadius: Tokens.radiusMd, style: .continuous)
        content
            .textFieldStyle(.plain)
            .focused($focused)
            .padding(.horizontal, 14)
            .frame(minHeight: 40)
            .background(.white.opacity(0.05), in: shape)
            .overlay(shape.strokeBorder(focused ? Tokens.primary.opacity(0.7) : Tokens.border, lineWidth: 1))
            .shadow(color: focused ? Tokens.primary.opacity(0.35) : .clear, radius: 10)
            .animation(.easeOut(duration: Tokens.durationBase), value: focused)
    }
}

public extension View {
    func glimmerField() -> some View { modifier(FieldChrome()) }
}
