import CoreText
import SwiftUI

/// The bundled typefaces. Registered with the system the first time any Glimmer font is asked for.
enum GlimmerFonts {
    static let registered: Void = {
        for url in Bundle.module.urls(forResourcesWithExtension: "ttf", subdirectory: nil) ?? [] {
            CTFontManagerRegisterFontsForURL(url as CFURL, .process, nil)
        }
    }()
}

public extension Font {
    /// Glimmer's UI typeface at a text style. Scales with Dynamic Type like the system styles do.
    static func glimmer(_ style: TextStyle = .body, weight: Weight = .regular) -> Font {
        _ = GlimmerFonts.registered
        return .custom(Tokens.fontSans, size: pointSize(style), relativeTo: style).weight(weight)
    }

    /// Glimmer's UI typeface at an exact size that does not scale.
    static func glimmer(size: CGFloat, weight: Weight = .regular) -> Font {
        _ = GlimmerFonts.registered
        return .custom(Tokens.fontSans, fixedSize: size).weight(weight)
    }

    /// Glimmer's mono typeface, for labels, counts and code.
    static func glimmerMono(_ style: TextStyle = .caption2) -> Font {
        _ = GlimmerFonts.registered
        return .custom(Tokens.fontMono, size: pointSize(style), relativeTo: style)
    }

    /// The system's default point size for each text style, so custom faces line up with native text.
    private static func pointSize(_ style: TextStyle) -> CGFloat {
        switch style {
        case .largeTitle: 34
        case .title: 28
        case .title2: 22
        case .title3: 20
        case .headline, .body: 17
        case .callout: 16
        case .subheadline: 15
        case .footnote: 13
        case .caption: 12
        case .caption2: 11
        @unknown default: 17
        }
    }
}
