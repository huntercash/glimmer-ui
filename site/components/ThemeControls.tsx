"use client";

import { defaults, setTheme, useTheme } from "@/lib/theme";

/** The site-wide theme controls: frost level, the two brand colours, and light or dark. Everything on the page follows them live. */
export function ThemeControls() {
  const theme = useTheme();
  const changed = theme.frost !== defaults.frost || theme.primary !== defaults.primary || theme.secondary !== defaults.secondary || theme.light;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
      <label className="flex items-center gap-2" data-tip="Drag to frost every surface">
        <span className="meta">Frost</span>
        <input
          className="range"
          style={{ width: "clamp(4rem, 12vw, 7rem)" }}
          type="range"
          min={1}
          max={5}
          step={1}
          value={theme.frost}
          aria-label="Frost level"
          onChange={(e) => setTheme({ frost: Number(e.target.value) })}
        />
        <output className="meta">{theme.frost}/5</output>
      </label>
      <label className="flex items-center gap-1.5" data-tip="Primary colour">
        <span className="meta">Primary</span>
        <input className="swatch-input" type="color" value={theme.primary} aria-label="Primary colour" onChange={(e) => setTheme({ primary: e.target.value })} />
      </label>
      <label className="flex items-center gap-1.5" data-tip="Secondary colour">
        <span className="meta">Secondary</span>
        <input className="swatch-input" type="color" value={theme.secondary} aria-label="Secondary colour" onChange={(e) => setTheme({ secondary: e.target.value })} />
      </label>
      <label className="flex items-center gap-1.5">
        <input className="toggle" type="checkbox" checked={theme.light} onChange={(e) => setTheme({ light: e.target.checked })} />
        <span className="meta">Light</span>
      </label>
      {changed && (
        <button className="btn btn-ghost btn-sm" onClick={() => setTheme(defaults)}>
          Reset
        </button>
      )}
    </div>
  );
}
