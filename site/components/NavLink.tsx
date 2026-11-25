"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** A sidebar link that marks itself as the current page. */
export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const current = usePathname() === href;
  return (
    <Link href={href} className="side-link" aria-current={current ? "page" : undefined}>
      {children}
    </Link>
  );
}
