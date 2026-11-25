// Optional. Makes the light inside a `.glow` glass surface follow the pointer (`.gl-glow` with the prefixed build).
// Safe to import where there is no page (server rendering): it then does nothing.
globalThis.addEventListener?.("pointermove", (e) => {
  const el = e.target.closest?.(".glow, .gl-glow");
  if (!el) return;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--px", `${e.clientX - r.left}px`);
  el.style.setProperty("--py", `${e.clientY - r.top}px`);
}, { passive: true });
