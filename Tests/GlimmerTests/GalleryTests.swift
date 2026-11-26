#if canImport(AppKit)
import AppKit
import SwiftUI
import XCTest
@testable import Glimmer

/// Smoke test: every component lays out and draws. Writes a PNG you can open to eyeball the result.
/// (Materials and native AppKit controls render flat off-screen, so use an Xcode preview to judge the look.)
final class GalleryTests: XCTestCase {
    /// The bundled fonts are registered and in use: heavier weights put down more ink, and neither
    /// face renders the same as the system font it would silently fall back to.
    @MainActor
    func testBundledFontsRender() throws {
        func ink(_ font: Font) throws -> Int {
            let renderer = ImageRenderer(content: Text("Hamburgefonstiv 48,210").font(font).foregroundStyle(.white).padding(8).background(.black))
            let data = try XCTUnwrap(renderer.cgImage?.dataProvider?.data)
            let bytes = try XCTUnwrap(CFDataGetBytePtr(data))
            return stride(from: 0, to: CFDataGetLength(data), by: 4).reduce(0) { $0 + Int(bytes[$1]) }
        }
        let weights = try [Font.Weight.regular, .medium, .semibold, .bold].map { try ink(.glimmer(size: 17, weight: $0)) }
        XCTAssertEqual(weights, weights.sorted(), "weights should get heavier: \(weights)")
        XCTAssertEqual(Set(weights).count, 4, "weights collapsed onto one face: \(weights)")
        XCTAssertNotEqual(try ink(.glimmer(size: 17)), try ink(.system(size: 17)), "sans fell back to the system font")
        XCTAssertNotEqual(try ink(.glimmerMono(.body)), try ink(.system(size: 17, design: .monospaced)), "mono fell back to the system font")
    }

    /// The same hand-worked values the web kit's tests use, so the two platforms agree.
    func testIndicatorsMatchTheWebKit() throws {
        XCTAssertEqual(Indicators.sma([1, 2, 3, 4, 5], 3), [nil, nil, 2, 3, 4])
        XCTAssertEqual(Indicators.ema([1, 2, 3, 4, 5], 3), [nil, nil, 2, 3, 4])

        let strength = Indicators.rsi([1, 2, 3, 2, 1, 2], 2)
        XCTAssertEqual(Array(strength.prefix(2)), [nil, nil])
        for (value, expected) in zip(strength.dropFirst(2), [100, 50, 25, 62.5]) {
            XCTAssertEqual(try XCTUnwrap(value), expected, accuracy: 1e-9)
        }
        XCTAssertEqual(Indicators.rsi([5, 5, 5, 5], 2).suffix(2), [50, 50])

        let band = try XCTUnwrap(Indicators.bollinger([1, 2, 3], n: 3, k: 2)[2])
        XCTAssertEqual(band.mid, 2)
        XCTAssertEqual(band.upper, 2 + 2 * (2.0 / 3).squareRoot(), accuracy: 1e-12)

        let rows = Indicators.macd((0..<30).map(Double.init), fast: 3, slow: 6, signal: 4)
        XCTAssertNil(rows[4].macd)
        XCTAssertEqual(try XCTUnwrap(rows[5].macd), 1.5, accuracy: 1e-9)
        XCTAssertEqual(try XCTUnwrap(rows.last?.histogram), 0, accuracy: 1e-9)

        let averaged = Indicators.heikinAshi([Candle(date: "a", open: 10, high: 14, low: 8, close: 12), Candle(date: "b", open: 12, high: 16, low: 11, close: 15)])
        XCTAssertEqual(averaged[0].close, 11)
        XCTAssertEqual(averaged[1].open, 11)
        XCTAssertEqual(averaged[1].close, 13.5)
    }

    /// Dragging and nudging sidebar rows, and the search match, with the same cases the web kit was checked against.
    func testSidebarRowsMoveAndMatch() throws {
        let menu = [SidebarSection("Pinned", items: ["Home", "Inbox"].map { SidebarItem($0, systemImage: "circle") }),
                    SidebarSection("Library", items: ["Photos", "Places", "Sync"].map { SidebarItem($0, systemImage: "circle") })]
        func order(_ sections: [SidebarSection]) -> String { sections.map { $0.items.map(\.id).joined(separator: ",") }.joined(separator: " | ") }

        XCTAssertEqual(order(menu.moving("Places", to: 0, before: "Inbox")), "Home,Places,Inbox | Photos,Sync")
        XCTAssertEqual(order(menu.moving("Home", to: 1, before: nil)), "Inbox | Photos,Places,Sync,Home")
        XCTAssertEqual(order(menu.moving("Home", to: 0, before: "Home")), order(menu), "dropping a row on itself changes nothing")
        XCTAssertEqual(order(menu.moving("Nope", to: 0, before: nil)), order(menu))

        XCTAssertEqual(order(menu.nudging("Photos", by: -1)), "Home,Inbox,Photos | Places,Sync", "up out of a section lands at the end of the one above")
        XCTAssertEqual(order(menu.nudging("Inbox", by: 1)), "Home | Inbox,Photos,Places,Sync", "down out of a section lands at the start of the one below")
        XCTAssertEqual(order(menu.nudging("Photos", by: 1)), "Home,Inbox | Places,Photos,Sync")
        XCTAssertEqual(order(menu.nudging("Places", by: 1)), "Home,Inbox | Photos,Sync,Places")
        XCTAssertEqual(order(menu.nudging("Sync", by: -1)), "Home,Inbox | Photos,Sync,Places")
        XCTAssertEqual(order(menu.nudging("Home", by: -1)), order(menu))
        XCTAssertEqual(order(menu.nudging("Sync", by: 1)), order(menu))

        let item = SidebarItem("Analytics", systemImage: "chart.xyaxis.line")
        XCTAssertNil(item.label(matching: "zz"))
        XCTAssertNil(try XCTUnwrap(item.label(matching: "")).runs.first?.foregroundColor, "an empty search lights nothing")
        let lit = try XCTUnwrap(item.label(matching: "AN")).runs.filter { $0.foregroundColor != nil }
        XCTAssertEqual(lit.count, 1)
        XCTAssertEqual(lit.first.map { $0.range.lowerBound == item.label(matching: "")!.startIndex }, true, "only the first match is lit")
    }

    @MainActor
    func testGalleryRenders() throws {
        // Default frost, and clear glass (a different drawing path: no material, edge reflections on).
        for frost in [3.0, 1.0] {
            let renderer = ImageRenderer(content: GalleryContent().glimmerFrost(frost).glimmerTheme())
            renderer.scale = 2
            let image = try XCTUnwrap(renderer.nsImage)
            XCTAssertGreaterThan(image.size.height, 600, "gallery collapsed — a component failed to lay out")

            let tiff = try XCTUnwrap(image.tiffRepresentation)
            let png = try XCTUnwrap(NSBitmapImageRep(data: tiff)?.representation(using: .png, properties: [:]))
            let url = FileManager.default.temporaryDirectory.appendingPathComponent("glimmer-gallery-frost\(Int(frost)).png")
            try png.write(to: url)
            print("Gallery snapshot: \(url.path)")
        }
    }
}
#endif
