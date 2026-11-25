import SwiftUI

// Styles for native controls. Use the system control; hand it a Glimmer style.

/// `Button("Save") {}.buttonStyle(.glimmer(.primary))`
public struct GlimmerButtonStyle: ButtonStyle {
    public enum Kind {
        case neutral
        case filled(Color)
        case outline(Color)
        case ghost(Color)

        public static let primary = Kind.filled(Tokens.primary)
        public static let secondary = Kind.filled(Tokens.secondary)
        public static let danger = Kind.filled(Tokens.danger)
    }

    var kind: Kind
    @Environment(\.isEnabled) private var isEnabled

    public func makeBody(configuration: Configuration) -> some View {
        let shape = RoundedRectangle(cornerRadius: Tokens.radiusMd, style: .continuous)
        configuration.label
            .font(.glimmer(.subheadline, weight: .medium))
            .padding(.horizontal, 16)
            .frame(minHeight: 40)
            .foregroundStyle(foreground)
            .background(background, in: shape)
            .overlay(shape.strokeBorder(border, lineWidth: 1))
            .shadow(color: glow, radius: 12, y: 6)
            .contentShape(shape)
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .opacity(isEnabled ? 1 : 0.5)
            .animation(.easeOut(duration: Tokens.durationFast), value: configuration.isPressed)
    }

    private var foreground: Color {
        switch kind {
        case .neutral: Tokens.content
        case .filled: Tokens.onAccent
        case .outline(let color), .ghost(let color): color
        }
    }

    private var background: AnyShapeStyle {
        switch kind {
        case .neutral: AnyShapeStyle(LinearGradient(colors: [.white.opacity(0.1), .white.opacity(0.04)], startPoint: .top, endPoint: .bottom))
        case .filled(let color): AnyShapeStyle(color.gradient)
        case .outline, .ghost: AnyShapeStyle(.clear)
        }
    }

    private var border: Color {
        switch kind {
        case .neutral: Tokens.border
        case .outline(let color): color.opacity(0.55)
        case .filled, .ghost: .clear
        }
    }

    private var glow: Color {
        if case .filled(let color) = kind { color.opacity(0.45) } else { .clear }
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
