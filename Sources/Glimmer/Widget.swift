import SwiftUI

/// A thick glass slab with a clear pane lifted off its top, holding a picture, and a caption below.
/// `thickness` sets the slab's edge, `lift` how far the pane floats above it; `tilted` lays it back in perspective.
public struct Widget<Pane: View>: View {
    var eyebrow: String?
    var title: String
    var subtitle: String?
    var tint: Color
    var thickness: CGFloat
    var lift: CGFloat
    var tilted: Bool
    var pane: Pane

    public init(_ title: String, eyebrow: String? = nil, subtitle: String? = nil, tint: Color = Tokens.secondary,
                thickness: CGFloat = 8, lift: CGFloat = 6, tilted: Bool = false, @ViewBuilder pane: () -> Pane) {
        self.title = title
        self.eyebrow = eyebrow
        self.subtitle = subtitle
        self.tint = tint
        self.thickness = thickness
        self.lift = lift
        self.tilted = tilted
        self.pane = pane()
    }

    public var body: some View {
        let slab = RoundedRectangle(cornerRadius: 32, style: .continuous)
        let glassPane = RoundedRectangle(cornerRadius: 20, style: .continuous)
        VStack(spacing: 4) {
            Color.clear
                .aspectRatio(4 / 3, contentMode: .fit)
                .overlay { pane.scaledToFill() }
                .clipShape(glassPane)
                // glass over the picture: a sheen from the top, a lit top edge and a shaded bottom one
                .overlay {
                    ZStack {
                        glassPane.fill(LinearGradient(stops: [.init(color: .white.opacity(0.24), location: 0), .init(color: .clear, location: 0.38)],
                                                      startPoint: .topLeading, endPoint: .bottom))
                        glassPane.fill(RadialGradient(colors: [.black.opacity(0.35), .clear], center: UnitPoint(x: 0.5, y: 1.15), startRadius: 0, endRadius: 160))
                        glassPane.strokeBorder(LinearGradient(colors: [.white.opacity(0.6), .white.opacity(0.12), .black.opacity(0.4)], startPoint: .top, endPoint: .bottom), lineWidth: 1)
                    }
                    .allowsHitTesting(false)
                }
                .shadow(color: .black.opacity(0.6), radius: 10, y: lift)
                .offset(y: -lift)
                .padding(.bottom, 12)
                .accessibilityHidden(true)
            if let eyebrow { Text(eyebrow).metaStyle() }
            Text(title).font(.glimmer(size: 22, weight: .bold)).tracking(-0.4)
            if let subtitle { Text(subtitle).font(.glimmer(.subheadline)).fontWeight(.semibold).foregroundStyle(Tokens.muted) }
        }
        .multilineTextAlignment(.center)
        .padding(.horizontal, 12)
        .padding(.top, 12)
        .padding(.bottom, 24)
        .glass(tint: tint, radius: 32)
        // the slab's edge: a dark band under it, outlined by a tinted rim
        .background {
            SlabEdge(radius: 32, thickness: thickness).fill(Tokens.base.opacity(0.75))
            SlabEdge(radius: 32, thickness: thickness).stroke(tint.opacity(0.3), lineWidth: 1)
        }
        .padding(.bottom, thickness)
        .rotation3DEffect(.degrees(tilted ? 26 : 0), axis: (x: 1, y: 0, z: 0), perspective: 0.6)
        .rotationEffect(.degrees(tilted ? -12 : 0))
        .accessibilityElement(children: .combine)
    }
}

/// The strip a slab's shadow copy shows below it: the slab moved down by `thickness`, minus the slab.
private struct SlabEdge: Shape {
    var radius: CGFloat
    var thickness: CGFloat

    func path(in rect: CGRect) -> Path {
        let slab = RoundedRectangle(cornerRadius: radius, style: .continuous)
        return slab.path(in: rect.offsetBy(dx: 0, dy: thickness)).subtracting(slab.path(in: rect))
    }
}
