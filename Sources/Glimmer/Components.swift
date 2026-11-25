import SwiftUI

// Only the pieces SwiftUI has no native control for. Everything else is a system control
// plus `.glimmerTheme()` or a style from Styles.swift (see the table in README.md).

/// The glass search pill. For a standard navigation-bar search, prefer the system `.searchable`.
public struct SearchField: View {
    @Binding var text: String
    var prompt: String

    public init(_ prompt: String = "Search", text: Binding<String>) {
        self.prompt = prompt
        _text = text
    }

    public var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "magnifyingglass").foregroundStyle(Tokens.muted)
            TextField(prompt, text: $text).textFieldStyle(.plain)
            if !text.isEmpty {
                Button { text = "" } label: { Image(systemName: "xmark.circle") }
                    .buttonStyle(.plain)
                    .foregroundStyle(Tokens.muted)
                    .accessibilityLabel("Clear")
            }
        }
        .padding(.horizontal, 18)
        .frame(height: 48)
        .glass(tint: Tokens.primary, radius: 24)
    }
}

/// A row for result lists and menus: icon, title, trailing mono value.
public struct MenuRow: View {
    var title: String
    var systemImage: String
    var meta: String?

    public init(_ title: String, systemImage: String, meta: String? = nil) {
        self.title = title
        self.systemImage = systemImage
        self.meta = meta
    }

    public var body: some View {
        HStack(spacing: 12) {
            Image(systemName: systemImage).frame(width: 18)
            Text(title)
            Spacer()
            if let meta { Text(meta).metaStyle() }
            Image(systemName: "arrow.up.right").font(.caption2).foregroundStyle(Tokens.muted)
        }
        .font(.glimmer(.subheadline))
        .padding(.horizontal, 12)
        .padding(.vertical, 9)
        .contentShape(Rectangle())
    }
}

public struct Badge: View {
    var text: String
    var color: Color

    public init(_ text: String, color: Color = Tokens.muted) {
        self.text = text
        self.color = color
    }

    public var body: some View {
        let shape = RoundedRectangle(cornerRadius: Tokens.radiusSm, style: .continuous)
        Text(text)
            .font(.glimmerMono(.caption2))
            .textCase(.uppercase)
            .padding(.horizontal, 8)
            .frame(height: 22)
            .foregroundStyle(color)
            .background(color.opacity(0.14), in: shape)
            .overlay(shape.strokeBorder(color.opacity(0.3), lineWidth: 1))
    }
}

/// A lit dot. Decorative unless you give it an accessibility label.
public struct StatusDot: View {
    var color: Color

    public init(_ color: Color = Tokens.success) { self.color = color }

    public var body: some View {
        Circle()
            .fill(color)
            .frame(width: 8, height: 8)
            .background(Circle().fill(color.opacity(0.2)).padding(-3))
            .shadow(color: color, radius: 6)
    }
}

public struct Avatar: View {
    var initials: String
    var size: CGFloat

    public init(_ initials: String, size: CGFloat = 40) {
        self.initials = initials
        self.size = size
    }

    public var body: some View {
        let shape = RoundedRectangle(cornerRadius: size * 0.32, style: .continuous)
        Text(initials)
            .font(.glimmer(size: size * 0.36, weight: .semibold))
            .foregroundStyle(Tokens.onAccent)
            .frame(width: size, height: size)
            .background(LinearGradient(colors: [Tokens.primary, Tokens.secondary], startPoint: .topLeading, endPoint: .bottomTrailing), in: shape)
            .overlay(shape.strokeBorder(Tokens.border, lineWidth: 1))
    }
}

/// Inline alert. (Named Banner because SwiftUI already owns `Alert`.)
public struct Banner: View {
    var message: String
    var color: Color

    public init(_ message: String, color: Color = Tokens.secondary) {
        self.message = message
        self.color = color
    }

    public var body: some View {
        Text(message)
            .font(.glimmer(.subheadline))
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .glass(tint: color, radius: Tokens.radiusMd)
    }
}

public struct Stat: View {
    var title: String
    var value: String
    var caption: String?
    var tint: Color

    public init(_ title: String, value: String, caption: String? = nil, tint: Color = Tokens.secondary) {
        self.title = title
        self.value = value
        self.caption = caption
        self.tint = tint
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title).metaStyle()
            Text(value).font(.glimmer(size: 30, weight: .semibold)).monospacedDigit().lineLimit(1).minimumScaleFactor(0.6)
            if let caption { Text(caption).font(.glimmer(.footnote)).foregroundStyle(Tokens.muted) }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .glass(tint: tint)
        .accessibilityElement(children: .combine)
    }
}

/// Chat bubble. `mine` puts it on the trailing side in the accent colour.
public struct Bubble: View {
    var text: String
    var mine: Bool

    public init(_ text: String, mine: Bool = false) {
        self.text = text
        self.mine = mine
    }

    public var body: some View {
        let shape = UnevenRoundedRectangle(
            topLeadingRadius: 18, bottomLeadingRadius: mine ? 18 : 4,
            bottomTrailingRadius: mine ? 4 : 18, topTrailingRadius: 18, style: .continuous)
        Text(text)
            .font(.glimmer(.subheadline))
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .foregroundStyle(mine ? Tokens.onAccent : Tokens.content)
            .background(mine ? AnyShapeStyle(Tokens.primary.gradient) : AnyShapeStyle(.white.opacity(0.08)), in: shape)
            .overlay(shape.strokeBorder(mine ? .clear : Tokens.border, lineWidth: 1))
            .frame(maxWidth: .infinity, alignment: mine ? .trailing : .leading)
    }
}

/// Loading state: a dark sphere with a rim light orbiting it, and an optional label with a highlight
/// sweeping through it. `Orb("Generating")` for a full state, `Orb(size: 20)` as an icon.
public struct Orb: View {
    var label: String?
    var size: CGFloat
    var tint: Color
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    public init(_ label: String? = nil, size: CGFloat = 144, tint: Color = Tokens.primary) {
        self.label = label
        self.size = size
        self.tint = tint
    }

    public var body: some View {
        TimelineView(.animation(paused: reduceMotion)) { timeline in
            let t = reduceMotion ? 0 : timeline.date.timeIntervalSinceReferenceDate
            ZStack {
                sphere.rotationEffect(.degrees(t.truncatingRemainder(dividingBy: 3) / 3 * 360))
                if let label {
                    // A 1-width gradient band slid across the text: -0.5 ... 1.5 over two seconds.
                    let x = t.truncatingRemainder(dividingBy: 2) - 0.5
                    Text(label)
                        .font(.glimmer(size: size * 0.12))
                        .foregroundStyle(LinearGradient(
                            stops: [.init(color: Tokens.muted, location: 0.3), .init(color: .white, location: 0.5), .init(color: Tokens.muted, location: 0.7)],
                            startPoint: UnitPoint(x: x - 0.5, y: 0.5), endPoint: UnitPoint(x: x + 0.5, y: 0.5)))
                }
            }
        }
        .frame(width: size, height: size)
        .shadow(color: tint.opacity(0.45), radius: size * 0.2)
        .accessibilityElement()
        .accessibilityLabel(label ?? "Loading")
    }

    private var sphere: some View {
        let r = size / 2
        return ZStack {
            Circle().fill(Tokens.base)
            Circle().fill(RadialGradient(
                stops: [.init(color: Tokens.secondary.opacity(0.5), location: 0.3), .init(color: tint, location: 0.78)],
                center: .center, startRadius: 0, endRadius: r))
            // rim light
            Circle().fill(RadialGradient(
                stops: [.init(color: .clear, location: 0.78), .init(color: .white.opacity(0.65), location: 1)],
                center: .center, startRadius: 0, endRadius: r))
            // the unlit side, pushed off-centre so a crescent of the layers below shows
            Circle().fill(RadialGradient(
                stops: [.init(color: Tokens.base, location: 0.4), .init(color: Tokens.base.opacity(0), location: 1)],
                center: UnitPoint(x: 0.68, y: 0.5), startRadius: 0, endRadius: size * 0.56))
        }
    }
}

/// A horizontal streak of light with a bright core, like a lens flare. Use it as an accent or a divider.
/// `x` moves the core along the streak (0 leading, 1 trailing); set the height with `.frame(height:)`.
public struct Flare: View {
    var tint: Color
    var x: CGFloat

    public init(tint: Color = Tokens.primary, x: CGFloat = 0.5) {
        self.tint = tint
        self.x = x
    }

    public var body: some View {
        GeometryReader { geo in
            let h = geo.size.height
            let line = LinearGradient(
                stops: [.init(color: .clear, location: 0), .init(color: tint, location: max(x - 0.22, 0)), .init(color: .white, location: x),
                        .init(color: tint, location: min(x + 0.22, 1)), .init(color: .clear, location: 1)],
                startPoint: .leading, endPoint: .trailing)
            ZStack {
                // soft haze around the streak
                EllipticalGradient(colors: [tint.opacity(0.3), .clear], center: .center, startRadiusFraction: 0, endRadiusFraction: 0.5)
                    .frame(width: geo.size.width * 0.9).position(x: geo.size.width * x, y: h / 2)
                // three hairlines: one bright, two fainter
                line.frame(height: 2).position(x: geo.size.width / 2, y: h * 0.5)
                line.frame(height: 1).position(x: geo.size.width / 2, y: h * 0.34)
                line.frame(height: 1).position(x: geo.size.width / 2, y: h * 0.66)
                // the core
                Circle().fill(RadialGradient(
                    stops: [.init(color: .white, location: 0.08), .init(color: tint.opacity(0.85), location: 0.3), .init(color: tint.opacity(0.4), location: 0.5), .init(color: .clear, location: 1)],
                    center: .center, startRadius: 0, endRadius: h / 2))
                    .frame(width: h, height: h).position(x: geo.size.width * x, y: h / 2)
            }
        }
        .frame(height: 48)
        .blendMode(.screen)
        .allowsHitTesting(false)
        .accessibilityHidden(true)
    }
}
