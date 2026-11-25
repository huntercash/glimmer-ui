import type { Metadata } from "next";
import Link from "next/link";
import { CodeBox } from "@/components/CodeBox";
import { tab } from "@/lib/highlight";
import { entries } from "@/lib/registry";

export const metadata: Metadata = { title: "SwiftUI", description: "Use Glimmer in iOS and macOS apps." };

export default function SwiftUIPage() {
  const withSwift = entries.filter((entry) => entry.examples.some((example) => example.swift));
  return (
    <div className="prose">
      <span className="meta">Docs</span>
      <h1>SwiftUI</h1>
      <p>
        Glimmer ships as a Swift package for iOS 17 and macOS 14 or later. It shares its colours, corners and fonts with the web kit, so the two
        stay in step.
      </p>

      <h2>1. Add the package</h2>
      <p>
        In Xcode, choose File → Add Package Dependencies and enter <code>https://github.com/huntercash/glimmer-ui</code>. Or in a package
        manifest:
      </p>
      <CodeBox
        tabs={[
          tab(
            "Package.swift",
            "swift",
            'dependencies: [\n    .package(url: "https://github.com/huntercash/glimmer-ui", from: "0.1.0"),\n],\ntargets: [\n    .target(name: "App", dependencies: [.product(name: "Glimmer", package: "glimmer-ui")]),\n]',
          ),
        ]}
      />

      <h2>2. Apply the theme once</h2>
      <p>This sets the dark scheme, the page colours, the bundled font and the accent for every native control.</p>
      <CodeBox tabs={[tab("Swift", "swift", 'import Glimmer\n\nContentView()\n    .glimmerTheme()')]} />

      <h2>3. Use the pieces</h2>
      <CodeBox
        tabs={[
          tab(
            "Swift",
            "swift",
            'VStack(spacing: 16) {\n    SearchField(text: $query)\n    Stat("Revenue", value: "$48,210", caption: "↑ 12% vs last month")\n    Button("Save") {}.buttonStyle(.glimmer(.primary))\n}\n.padding()\n.background(DotGrid())',
          ),
        ]}
      />

      <h2>Native controls stay native</h2>
      <p>
        Toggle, Slider, ProgressView, Gauge, Picker, sheets and popovers are the system's own. The theme tints them, so there is nothing extra to
        learn and they keep their accessibility behaviour.
      </p>

      <h2>Fonts and frost</h2>
      <CodeBox
        tabs={[
          tab(
            "Swift",
            "swift",
            'Text("Night walk").font(.glimmer(.headline, weight: .semibold))\nText("2,418").font(.glimmerMono())\n\nContentView().glimmerFrost(2) // 1 clear ... 5 milky',
          ),
        ]}
      />

      <h2>Components with a SwiftUI equivalent</h2>
      <p>Each of these pages has a SwiftUI tab on its code boxes.</p>
      <div className="flex flex-wrap gap-2">
        {withSwift.map((entry) => (
          <Link key={entry.slug} href={`/components/${entry.slug}`} className="btn btn-sm">
            {entry.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
