// Kept apart from theme.ts so the server-rendered layout can import it: theme.ts uses a client-only React hook.

export const KEY = "glimmer-theme";
export const hex = /^#[0-9a-f]{6}$/i;

/** Runs before the page paints, so a returning visitor never sees the default theme flash first.
    It repeats theme.ts's validity checks in plain JavaScript because it runs before any module loads. */
export const bootScript = `try{var t=JSON.parse(localStorage.getItem("${KEY}"));if(t&&typeof t.frost==="number"&&t.frost>=1&&t.frost<=5&&${hex}.test(t.primary)&&${hex}.test(t.secondary)){var s=document.documentElement.style;s.setProperty("--frost",t.frost);s.setProperty("--gl-primary",t.primary);s.setProperty("--gl-secondary",t.secondary);if(t.light===true)document.documentElement.dataset.theme="light"}}catch(e){}`;
