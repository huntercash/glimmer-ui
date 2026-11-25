import type { Metadata } from "next";
import Link from "next/link";
import { Glow } from "@/components/Glow";
import { ThemeControls } from "@/components/ThemeControls";
import { bootScript } from "@/lib/theme-boot";
import pkg from "../../package.json";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://glimmer-ui.com"),
  title: { default: "Glimmer — glass-and-glow UI for the web and Apple platforms", template: "%s — Glimmer" },
  description: "Component classes in plain CSS, with a matching SwiftUI package. Works alone or with Tailwind.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // The boot script sets saved theme variables on <html> before React loads, hence suppressHydrationWarning.
  return (
    <html lang="en" className="frost-1" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        {/* A fixed scene behind every page, so clear glass has something to show through it. */}
        <div className="site-backdrop dotgrid streaks" aria-hidden="true" />
        <header className="sticky top-0 z-40 px-4 pt-3">
          <nav className="navbar site-nav mx-auto max-w-6xl" aria-label="Main">
            <Link href="/" className="btn btn-ghost btn-sm font-semibold">
              Glimmer
            </Link>
            <Link href="/changelog" className="badge" title="Changelog">
              v{pkg.version}
            </Link>
            <Link href="/docs/install" className="btn btn-ghost btn-sm">
              Docs
            </Link>
            <Link href="/components" className="btn btn-ghost btn-sm">
              Components
            </Link>
            <div className="navbar-end">
              <div className="hidden md:block">
                <ThemeControls />
              </div>
              {/* On small screens the same controls live in a popover, so the bar stays one row tall. */}
              <button className="btn btn-ghost btn-sm md:hidden" popoverTarget="theme-menu">
                Theme
              </button>
              <div popover="auto" id="theme-menu" className="popover w-64 p-4 md:hidden">
                <ThemeControls />
              </div>
            </div>
          </nav>
        </header>

        {children}

        <footer className="footer mx-auto mt-24 max-w-6xl">
          <nav aria-label="Docs">
            <span className="footer-title">Docs</span>
            <Link href="/docs/install">Install</Link>
            <Link href="/docs/usage">Usage</Link>
            <Link href="/docs/customize">Customize</Link>
            <Link href="/docs/swiftui">SwiftUI</Link>
            <Link href="/changelog">Changelog</Link>
          </nav>
          <nav aria-label="Components">
            <span className="footer-title">Components</span>
            <Link href="/components">All components</Link>
            <Link href="/components/glass">Glass</Link>
            <Link href="/components/frost">Frost</Link>
            <Link href="/components/orb">Orb</Link>
          </nav>
          <div>
            <span className="footer-title">Glimmer</span>
            <span>Glass-and-glow UI for the web and Apple platforms.</span>
            <a href="https://github.com/huntercash/glimmer-ui">GitHub</a>
            <span>Fonts: SUIT and Fragment Mono, SIL Open Font License.</span>
          </div>
        </footer>
        <Glow />
      </body>
    </html>
  );
}
