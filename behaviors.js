// Optional. The few things CSS and native elements cannot do on their own: tabs that switch panels, toasts,
// carousel buttons, filtering a list as you type, a sidebar that folds, and tooltips that assistive technology can read.
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

/** Sidebar: <nav class="sidebar"> holding <ul class="menu"> lists and a <button class="sidebar-handle">.
    Clicking the handle, or dragging it, folds the sidebar to a rail of icons (the data-collapsed attribute) and back.
    An <input> in .sidebar-search dims the rows that do not match and lights the letters that do; ⌘K or Ctrl+K focuses it
    and Enter follows the first match. Rows with draggable="true" can be dragged to a new place, or moved with Alt+↑ and Alt+↓. */
const SIDEBAR = cls("sidebar"), ROW = `${cls("menu")} > li`;
const rowsIn = (bar) => [...bar.querySelectorAll(ROW)];
function collapse(bar, on) {
  bar.toggleAttribute("data-collapsed", on);
  bar.querySelector(cls("sidebar-handle"))?.setAttribute("aria-expanded", !on);
}
function searchSidebar(input) {
  const query = input.value.trim().toLowerCase(), ranges = [];
  for (const row of rowsIn(input.closest(SIDEBAR))) {
    const walker = document.createTreeWalker(row, NodeFilter.SHOW_TEXT);
    let hit = !query;
    for (let node; !hit && (node = walker.nextNode()); ) {
      const at = node.data.toLowerCase().indexOf(query);
      if (at < 0) continue;
      hit = true;
      const range = new Range();
      range.setStart(node, at);
      range.setEnd(node, at + query.length);
      ranges.push(range);
    }
    row.toggleAttribute("data-dim", !hit);
  }
  // The CSS Custom Highlight API colours the matching letters without touching the markup. Older browsers just dim.
  if (!globalThis.Highlight) return;
  if (ranges.length) CSS.highlights.set("gl-match", new Highlight(...ranges));
  else CSS.highlights.delete("gl-match");
}
/** Puts a row before `before` in `list` (at the end when null). It first sends a cancelable "gl-move" event from the row,
    with detail { list, before }: call preventDefault() to do the move yourself, which a framework that renders the list
    from state must. Moving to another list that has an aria-label shows a toast with an Undo button. */
function moveRow(row, list, before) {
  const from = row.parentElement, next = row.nextElementSibling;
  if (before === row || (list === from && before === next)) return;
  if (!row.dispatchEvent(new CustomEvent("gl-move", { bubbles: true, cancelable: true, detail: { list, before } }))) return;
  list.insertBefore(row, before);
  const to = list.getAttribute("aria-label");
  if (list === from || !to) return;
  const p = config.prefix, name = (row.querySelector(":scope > * > :nth-child(2)") ?? row).textContent.trim();
  const note = toast(`${name} moved to ${to}`);
  const undo = Object.assign(document.createElement("button"), { type: "button", className: `${p}btn ${p}btn-ghost ${p}btn-sm`, textContent: "Undo" });
  undo.style.margin = "-0.375rem -0.5rem -0.375rem auto";
  undo.onclick = () => {
    from.insertBefore(row, next?.parentElement === from ? next : null);
    note.remove();
  };
  note.append(undo);
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
  let dragged = false; // the sidebar handle was dragged, so the click that ends the drag must not toggle it back
  let row = null;      // the sidebar row being dragged

  document.addEventListener("click", (e) => {
    const tab = e.target.closest?.(TAB);
    if (tab?.closest(cls("tabs"))) selectTab(tab);

    const handle = e.target.closest?.(cls("sidebar-handle")), bar = handle?.closest(SIDEBAR);
    if (bar && !dragged) collapse(bar, !bar.hasAttribute("data-collapsed"));
    dragged = false;

    // Links within the page (href="#…") move the current marker themselves. Links to other pages are your router's job.
    const link = e.target.closest?.(`${SIDEBAR} ${ROW} > a[href^="#"]`);
    if (link) {
      link.closest(SIDEBAR).querySelectorAll(`${ROW} > [aria-current]`).forEach((el) => el.removeAttribute("aria-current"));
      link.setAttribute("aria-current", "true");
    }

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
    if (e.key === "Escape") document.querySelectorAll("[data-tip]:is(:hover, :focus)").forEach((el) => (el.dataset.tipOff = ""));

    const search = document.querySelector(`${cls("sidebar-search")} > input`);
    if (search && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      search.focus(); // which also unfolds a collapsed sidebar: see focusin below
      search.select();
    }
    const field = e.key === "Enter" && e.target.closest?.(`${cls("sidebar-search")} > input`);
    if (field && field.value.trim()) rowsIn(field.closest(SIDEBAR)).find((r) => !r.hasAttribute("data-dim"))?.firstElementChild?.click();

    const way = e.altKey && { ArrowUp: -1, ArrowDown: 1 }[e.key], mover = way && e.target.closest?.(`${SIDEBAR} ${ROW}[draggable="true"]`);
    if (mover) {
      const all = rowsIn(mover.closest(SIDEBAR)), other = all[all.indexOf(mover) + way];
      if (other) {
        e.preventDefault();
        const same = other.parentElement === mover.parentElement; // crossing into the next list lands on its near end
        moveRow(mover, other.parentElement, way < 0 ? (same ? other : null) : same ? other.nextElementSibling : other);
        e.target.focus(); // moving an element drops focus
      }
    }

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
    if (e.target.closest?.(`${SIDEBAR} ${cls("sidebar-search")} > input`)) searchSidebar(e.target);
    const target = e.target.dataset?.filter;
    if (!target) return;
    const query = e.target.value.trim().toLowerCase();
    for (const item of document.querySelectorAll(`${target} > li`)) item.hidden = !item.textContent.toLowerCase().includes(query);
  });

  document.addEventListener("focusin", (e) => {
    const tip = e.target.closest?.("[data-tip]"), tab = e.target.closest?.(TAB);
    if (tip) describe(tip);
    if (tab?.closest(cls("tabs"))) rove(tab);
    const folded = e.target.closest?.(cls("sidebar-search"))?.closest(`${SIDEBAR}[data-collapsed]`);
    if (folded) collapse(folded, false); // the search icon on the rail opens the sidebar to type in
  });

  // Dragging the sidebar handle: towards the sidebar folds it, away unfolds it.
  document.addEventListener("pointerdown", (e) => {
    const handle = e.target.closest?.(cls("sidebar-handle")), bar = handle?.closest(SIDEBAR);
    if (!bar) return;
    dragged = false;
    handle.setPointerCapture(e.pointerId);
    const from = e.clientX;
    const move = (m) => {
      const by = (m.clientX - from) * rtl(bar);
      if (Math.abs(by) < 16) return;
      dragged = true;
      collapse(bar, by < 0);
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("lostpointercapture", () => handle.removeEventListener("pointermove", move), { once: true });
  });

  // Dragging a row: native drag and drop, so there is nothing to set up beyond draggable="true" on the <li>.
  const unmark = () => document.querySelectorAll("[data-drop]").forEach((el) => el.removeAttribute("data-drop"));
  const dropAt = (e) => {
    const over = e.target.closest?.(ROW), list = over?.parentElement ?? e.target.closest?.(cls("menu"));
    if (!row || !list || list.closest(SIDEBAR) !== row.closest(SIDEBAR)) return null;
    const box = over?.getBoundingClientRect();
    return { list, over, after: !!over && e.clientY > box.top + box.height / 2 };
  };
  document.addEventListener("dragstart", (e) => (row = e.target.closest?.(`${SIDEBAR} ${ROW}[draggable="true"]`) ?? null));
  document.addEventListener("dragover", (e) => {
    const at = dropAt(e);
    if (!at) return;
    e.preventDefault(); // allows the drop
    unmark();
    at.over?.setAttribute("data-drop", at.after ? "after" : "before");
  });
  document.addEventListener("drop", (e) => {
    const at = dropAt(e);
    if (!at) return;
    e.preventDefault();
    moveRow(row, at.list, at.after ? at.over.nextElementSibling : at.over ?? null);
  });
  document.addEventListener("dragend", () => {
    unmark();
    row = null;
  });
  for (const type of ["pointerout", "focusout"]) document.addEventListener(type, (e) => e.target.closest?.("[data-tip-off]")?.removeAttribute("data-tip-off"));
}
