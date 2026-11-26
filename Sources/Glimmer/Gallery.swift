import Charts
import SwiftUI

/// Every Glimmer piece on one screen. Drop it in a `#Preview { GlimmerGallery() }` to browse.
public struct GlimmerGallery: View {
    public init() {}

    public var body: some View {
        ScrollView { GalleryContent() }
            .glimmerTheme()
    }
}

struct GalleryContent: View {
    /// Made-up prices that wander up and down, for the stock chart samples.
    static let candles: [Candle] = (0..<30).map { i in
        let close = 180 + sin(Double(i) / 3) * 6 + Double(i) * 0.3
        let open = close - cos(Double(i) * 1.7) * 3
        return Candle(date: "Day \(i + 1)", open: open, high: max(open, close) + 2, low: min(open, close) - 2.5, close: close, volume: 60 + sin(Double(i)) * 25)
    }

    @State private var query = "tokyo night skyline"
    @State private var email = ""
    @State private var on = true
    @State private var volume = 0.6
    @State private var tab = 0
    @State private var page: String? = "Home"
    @State private var folded = false
    @State private var menu: [SidebarSection]? // nil until a row is dragged; then the order the user left

    private var defaultMenu: [SidebarSection] {
        [SidebarSection("Pinned", items: [
            SidebarItem("Home", systemImage: "house"),
            SidebarItem("Inbox", systemImage: "bell", badge: "4", hint: "Inbox · 4 new"),
        ]),
         SidebarSection("Library", items: [
            SidebarItem("Photos", systemImage: "photo"),
            SidebarItem("Places", systemImage: "mappin.and.ellipse"),
            SidebarItem("Sync", systemImage: "bolt", hint: "Sync · 3 running", isOn: $on),
            SidebarItem("Analytics", systemImage: "chart.xyaxis.line"),
        ])]
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 28) {
            VStack(spacing: 10) {
                SearchField(text: $query)
                VStack(spacing: 0) {
                    HStack { Text("Top results"); Spacer(); Text("0.21 s") }
                        .metaStyle()
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                    MenuRow("Photos", systemImage: "photo", meta: "2,418")
                    MenuRow("Places", systemImage: "mappin.and.ellipse", meta: "36")
                    MenuRow("Stories", systemImage: "doc.text", meta: "112")
                }
                .padding(6)
                .glass()
            }
            .padding(.vertical, 40)
            .background(DotGrid())

            section("Buttons") {
                HStack {
                    Button("Default") { /* gallery demo: no action */ }.buttonStyle(.glimmer)
                    Button("Primary") { /* gallery demo: no action */ }.buttonStyle(.glimmer(.primary))
                    Button("Secondary") { /* gallery demo: no action */ }.buttonStyle(.glimmer(.secondary))
                }
                HStack {
                    Button("Outline") { /* gallery demo: no action */ }.buttonStyle(.glimmer(.outline(Tokens.primary)))
                    Button("Ghost") { /* gallery demo: no action */ }.buttonStyle(.glimmer(.ghost(Tokens.secondary)))
                    Button("Disabled") { /* gallery demo: no action */ }.buttonStyle(.glimmer).disabled(true)
                }
            }

            section("Forms") {
                TextField("you@example.com", text: $email).glimmerField()
                Toggle("Toggle", isOn: $on)
                Slider(value: $volume)
                Picker("View", selection: $tab) {
                    Text("Overview").tag(0)
                    Text("Activity").tag(1)
                    Text("Settings").tag(2)
                }
                .pickerStyle(.segmented)
                .labelsHidden()
            }

            section("Sidebar") {
                Sidebar(sections: Binding { menu ?? defaultMenu } set: { menu = $0 }, selection: $page, collapsed: $folded) {
                    HStack(spacing: 12) { Avatar("G", size: 32); Text("Glimmer").fontWeight(.semibold); Badge("Pro") }
                } footer: {
                    HStack(spacing: 12) {
                        Avatar("AK", size: 32)
                        VStack(alignment: .leading, spacing: 2) { Text("Aiden Kerr"); Text(verbatim: "aiden@example.com").metaStyle() }
                    }
                }
                .frame(height: 440)
            }

            section("Cards & stats") {
                GroupBox {
                    Text("Any view can be a glass surface with .glass().").foregroundStyle(Tokens.muted)
                    HStack {
                        Badge("Draft")
                        Badge("New", color: Tokens.primary)
                        Badge("Live", color: Tokens.success)
                        Badge("Failed", color: Tokens.danger)
                    }
                } label: {
                    HStack { Avatar("HM"); Text("Night walk") }
                }
                .groupBoxStyle(.glimmer)
                HStack(spacing: 12) {
                    Stat("Revenue", value: "$48,210", caption: "↑ 12% vs last month")
                    Stat("Uptime", value: "99.98%", caption: "30 day rolling", tint: Tokens.success)
                }
            }

            section("Widget") {
                HStack(spacing: 40) {
                    ForEach([false, true], id: \.self) { tilted in
                        Widget("Night walk", eyebrow: "Photo of the day", subtitle: "Shibuya, after the rain", tilted: tilted) {
                            LinearGradient(colors: [Tokens.secondary, Tokens.primary], startPoint: .top, endPoint: .bottom)
                                .overlay(Image(systemName: "building.2.fill").font(.system(size: 64)).foregroundStyle(.white.opacity(0.85)))
                        }
                        .frame(width: 260)
                    }
                }
                .padding(.vertical, 30)
            }

            section("Feedback") {
                Banner("Heads up — a new version is available.")
                Banner("Saved. Your changes are live.", color: Tokens.success)
                Banner("Payment failed. Update your card.", color: Tokens.danger)
                ProgressView(value: 0.35)
                HStack(spacing: 16) {
                    Gauge(value: 0.72) { Text("72") }.gaugeStyle(.accessoryCircularCapacity)
                    ProgressView()
                    StatusDot()
                    StatusDot(Tokens.warning)
                    StatusDot(Tokens.danger)
                }
                HStack(spacing: 20) {
                    Orb("Generating")
                    Orb(size: 72, tint: Tokens.secondary)
                    Orb(size: 20)
                }
                ZStack {
                    Orb(size: 96)
                    Flare()
                }
                .frame(maxWidth: .infinity, minHeight: 200)
                .background(Streaks())
                Bubble("Did the deploy go out?")
                Bubble("Shipped ten minutes ago.", mine: true)
            }

            section("Charts") {
                Chart {
                    ForEach(Array([120.0, 180, 160, 240, 300, 280, 360, 420].enumerated()), id: \.offset) { month, value in
                        LineMark(x: .value("Month", month + 1), y: .value("Count", value))
                            .foregroundStyle(by: .value("Series", "Visits"))
                    }
                    ForEach(Array([40.0, 60, 90, 80, 140, 170, 160, 230].enumerated()), id: \.offset) { month, value in
                        LineMark(x: .value("Month", month + 1), y: .value("Count", value))
                            .foregroundStyle(by: .value("Series", "Sign-ups"))
                    }
                }
                .glimmerChartStyle()
                .frame(height: 180)
                .padding(16)
                .glass()

                ChordDiagram(
                    names: ["Design", "Engineering", "Product", "Sales", "Support", "Data"],
                    matrix: [[0, 42, 28, 6, 4, 10], [38, 0, 35, 5, 18, 26], [24, 40, 0, 22, 12, 20], [4, 6, 30, 0, 25, 8], [3, 22, 14, 20, 0, 5], [8, 30, 24, 10, 4, 0]])
                    .padding(8)
                    .glass()

                StockChart(GalleryContent.candles, movingAverages: [5], bollinger: (10, 2))
                    .frame(height: 280)
                    .padding(16)
                    .glass()
                RSIChart(GalleryContent.candles, period: 7)
                    .frame(height: 130)
                    .padding(16)
                    .glass()
                MACDChart(GalleryContent.candles, fast: 4, slow: 9, signal: 4)
                    .frame(height: 140)
                    .padding(16)
                    .glass()
                StockChart(GalleryContent.candles, style: .ohlc, showsVolume: false)
                    .frame(height: 200)
                    .padding(16)
                    .glass()
                RadarChart(
                    axes: ["Speed", "Reliability", "Comfort", "Safety", "Efficiency", "Price"],
                    series: [.init("Model A", [82, 64, 70, 90, 58, 45]), .init("Model B", [55, 88, 84, 72, 80, 70])])
                    .padding(16)
                    .glass()
            }
        }
        .padding(20)
        .frame(maxWidth: 480)
    }

    private func section<Content: View>(_ title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title).metaStyle()
            content()
        }
    }
}
