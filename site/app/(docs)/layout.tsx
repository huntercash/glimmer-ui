import { Suspense } from "react";
import { NavLink } from "@/components/NavLink";
import { byCategory } from "@/lib/registry";

const docs = [
  ["Install", "/docs/install"],
  ["Usage", "/docs/usage"],
  ["Customize", "/docs/customize"],
  ["SwiftUI", "/docs/swiftui"],
];

function SideNav() {
  return (
    <nav aria-label="Documentation" className="grid gap-5 pb-8">
      <div className="grid gap-0.5">
        <span className="meta px-3 pb-1">Docs</span>
        {docs.map(([label, href]) => (
          <NavLink key={href} href={href}>
            {label}
          </NavLink>
        ))}
        <NavLink href="/components">All components</NavLink>
      </div>
      {byCategory.map(({ category, entries }) => (
        <div key={category} className="grid gap-0.5">
          <span className="meta px-3 pb-1">{category}</span>
          {entries.map((entry) => (
            <NavLink key={entry.slug} href={`/components/${entry.slug}`}>
              {entry.name}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-6xl gap-x-10 gap-y-4 px-4 pt-8 md:grid-cols-[13rem_minmax(0,1fr)]">
      <aside className="hidden md:block">
        <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pr-2">
          <Suspense>
            <SideNav />
          </Suspense>
        </div>
      </aside>
      <details className="accordion md:hidden">
        <summary>Menu</summary>
        <div>
          <Suspense>
            <SideNav />
          </Suspense>
        </div>
      </details>
      <main className="min-w-0">{children}</main>
    </div>
  );
}
