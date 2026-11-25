"use client";

import { useState } from "react";
import type { CodeTab } from "@/lib/highlight";

/** Code in a Glimmer mockup-code frame, with a copy button and tabs when there is more than one snippet. */
export function CodeBox({ tabs, wrap }: { tabs: CodeTab[]; /** Wrap long lines instead of scrolling sideways: for prose such as prompts. */ wrap?: boolean }) {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const current = tabs[active];

  async function copy() {
    try {
      await navigator.clipboard.writeText(current.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked (insecure origin or denied permission): leave the label alone so nothing claims a copy happened.
    }
  }

  return (
    <div className={wrap ? "mockup-code codebox codebox-wrap" : "mockup-code codebox"}>
      <div className="codebox-bar">
        {tabs.length > 1 ? (
          <div className="tabs" role="tablist" aria-label="Code language">
            {tabs.map((t, i) => (
              <button key={t.label} className="tab" role="tab" aria-selected={i === active} onClick={() => setActive(i)}>
                {t.label}
              </button>
            ))}
          </div>
        ) : (
          <span className="meta">{current.label}</span>
        )}
        <button className="btn btn-ghost btn-sm" onClick={copy} aria-live="polite">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre>
        <code dangerouslySetInnerHTML={{ __html: current.html }} />
      </pre>
    </div>
  );
}
