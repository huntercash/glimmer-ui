// Optional. The few things CSS and native elements cannot do on their own: tabs that switch panels, toasts,
// carousel buttons, filtering a list as you type, and tooltips that assistive technology can read.
// It listens on the document, so markup added later works without being set up, and it changes nothing on the page
// until someone interacts with it, which keeps it out of the way of frameworks that hydrate server-rendered markup.
// Modals, drawers, popovers and accordions need none of this: they are native <dialog>, [popover] and <details>.
// Safe to import where there is no page (server rendering): it then does nothing.

/** Set config.prefix = "gl-" when you use css/prefixed.css, so toast() builds prefixed markup. Everything else accepts both. */
export const config = { prefix: "" };

const cls = (name) => `:is(.${name}, .gl-${name})`;
const rtl = (el) => (getComputedStyle(el).direction === "rtl" ? -1 : 1);

/** Tabs: <div class="tabs" role="tablist"> holding <button class="tab" role="tab" aria-controls="panel-id">, and one
    element per panel with that id (give all but the first the `hidden` attribute). Only tabs that name a panel are
    managed: tabs used as links, or driven by your own code or a framework, are left alone. */
const TAB = '[role="tab"][aria-controls]';
const tabsIn = (tab) => [...tab.closest(cls("tabs")).querySelectorAll(TAB)];
function selectTab(tab) {
  for (const other of tabsIn(tab)) {
    const on = other === tab;
    other.setAttribute("aria-selected", on);
    other.tabIndex = on ? 0 : -1; // one tab stop for the whole set; arrows move within it
    const panel = document.getElementById(other.getAttribute("aria-controls"));
    if (panel) panel.hidden = !on;
  }
}

/** Tooltips are drawn by CSS from data-tip, which assistive technology does not reliably read. This copies the text
    to where it does: the name of an element that has none (an icon button), otherwise its description. */
function describe(el) {
  if (["aria-label", "aria-labelledby", "aria-description", "aria-describedby"].some((a) => el.hasAttribute(a))) return;
  el.setAttribute(el.textContent.trim() ? "aria-description" : "aria-label", el.dataset.tip);
}

/** One tab stop for the whole set: only the selected tab is reachable with Tab, and the arrow keys move between them. */
const rove = (tab) => tabsIn(tab).forEach((other) => (other.tabIndex = other.getAttribute("aria-selected") === "true" ? 0 : -1));

/** Optional. Tooltips and tab stops are otherwise set up the first time something is focused. On a page that is not
    hydrated by a framework, call this once after the markup exists so screen readers browsing without focus get tooltip text too. */
export function init(root = document) {
  root.querySelectorAll("[data-tip]").forEach(describe);
  root.querySelectorAll(`${cls("tabs")} ${TAB}[aria-selected="true"]`).forEach(rove);
}

/** Shows a message in the corner and removes it after `duration` milliseconds (0 keeps it until you call .remove() on
    the returned element). type: "success", "warning", "danger", "primary" or "secondary". The message is inserted as text, never as HTML. */
export function toast(message, { type, duration = 4000, top = false, start = false } = {}) {
  const p = config.prefix;
  const stackClass = [`${p}toast`, top && `${p}toast-top`, start && `${p}toast-start`].filter(Boolean).join(" ");
  let stack = [...document.querySelectorAll("[data-toasts]")].find((el) => el.className === stackClass);
  if (!stack) {
    stack = Object.assign(document.createElement("div"), { className: stackClass });
    stack.dataset.toasts = "";
    stack.setAttribute("role", "status"); // announced politely by screen readers
    document.body.append(stack);
  }
  const item = Object.assign(document.createElement("div"), { className: `${p}alert${type ? ` ${p}alert-${type}` : ""}`, textContent: message });
  if (type === "danger") item.setAttribute("role", "alert"); // errors interrupt
  stack.append(item);
  if (duration) setTimeout(() => item.remove(), duration);
  return item;
}

if (globalThis.document) {
  document.addEventListener("click", (e) => {
    const tab = e.target.closest?.(TAB);
    if (tab?.closest(cls("tabs"))) selectTab(tab);

    // <button data-clear> inside a search field empties its input (and so resets any filter).
    const field = e.target.closest?.("[data-clear]")?.closest(cls("search"))?.querySelector("input");
    if (field) {
      field.value = "";
      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.focus();
    }

    // Carousel buttons: <button data-carousel="prev" aria-controls="carousel-id"> (or "next"), placed outside the carousel.
    const turn = e.target.closest?.("[data-carousel]");
    const carousel = turn && document.getElementById(turn.getAttribute("aria-controls"));
    if (carousel)
      carousel.scrollBy({
        left: (turn.dataset.carousel === "prev" ? -1 : 1) * rtl(carousel) * carousel.clientWidth * 0.9,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
  });

  document.addEventListener("keydown", (e) => {
    // Escape dismisses a tooltip without moving focus; it comes back the next time the element is hovered or focused.
    if (e.key === "Escape") document.querySelectorAll("[data-tip]:is(:hover, :focus)").forEach((el) => el.setAttribute("data-tip-off", ""));

    const tab = e.target.closest?.(TAB);
    if (e.defaultPrevented || !tab?.closest(cls("tabs"))) return; // already handled, by the React component for one
    const all = tabsIn(tab), n = all.length, step = { ArrowRight: rtl(tab), ArrowLeft: -rtl(tab) }[e.key];
    const next = e.key === "Home" ? 0 : e.key === "End" ? n - 1 : step ? (all.indexOf(tab) + step + n) % n : -1;
    if (next < 0) return;
    e.preventDefault();
    selectTab(all[next]);
    all[next].focus();
  });

  // Filtering: <input type="search" data-filter="#list-id"> hides the <li>s of that list that do not contain what was typed.
  document.addEventListener("input", (e) => {
    const target = e.target.dataset?.filter;
    if (!target) return;
    const query = e.target.value.trim().toLowerCase();
    for (const item of document.querySelectorAll(`${target} > li`)) item.hidden = !item.textContent.toLowerCase().includes(query);
  });

  document.addEventListener("focusin", (e) => {
    const tip = e.target.closest?.("[data-tip]"), tab = e.target.closest?.(TAB);
    if (tip) describe(tip);
    if (tab?.closest(cls("tabs"))) rove(tab);
  });
  for (const type of ["pointerout", "focusout"]) document.addEventListener(type, (e) => e.target.closest?.("[data-tip-off]")?.removeAttribute("data-tip-off"));
}
