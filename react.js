"use client";
// React components for the parts of Glimmer that have behaviour. Everything else is a class on a plain element
// (<button className="btn btn-primary">), which needs no wrapper. Importing this also loads charts.js and
// behaviors.js, so <gl-chart> and toast() work.
import { createElement as h, Fragment, useEffect, useId, useRef, useState } from "react";
import { chart } from "./charts.js";
import { config } from "./behaviors.js";

export { config, toast } from "./behaviors.js";

/** A chart. It is drawn on the server like any other markup, then becomes interactive in the browser:
    <Chart type="line" data={{ labels, series }} options={{ smooth: true }} zoom /> */
export function Chart({ type, data, options, zoom, ...rest }) {
  // The first drawing only: after that the element redraws itself from its attributes, at its real width.
  const [html] = useState(() => {
    try {
      return chart(type, data, options);
    } catch {
      return ""; // the element shows the error message once it loads
    }
  });
  return h("gl-chart", {
    ...rest, type, data: JSON.stringify(data), options: options ? JSON.stringify(options) : undefined, zoom: zoom ? "" : undefined,
    suppressHydrationWarning: true, dangerouslySetInnerHTML: { __html: html },
  });
}

/** Tabs with their panels: <Tabs tabs={[{ label: "Overview", content: <p>…</p> }, …]} /> */
export function Tabs({ tabs, defaultIndex = 0, className = "", ...rest }) {
  const [at, setAt] = useState(defaultIndex), id = useId(), buttons = useRef([]);
  const onKeyDown = (e) => {
    const n = tabs.length, flip = getComputedStyle(e.currentTarget).direction === "rtl" ? -1 : 1;
    const step = { ArrowRight: flip, ArrowLeft: -flip }[e.key];
    const next = e.key === "Home" ? 0 : e.key === "End" ? n - 1 : step ? (at + step + n) % n : -1;
    if (next < 0) return;
    e.preventDefault();
    setAt(next);
    buttons.current[next]?.focus();
  };
  return h(Fragment, null,
    h("div", { ...rest, className: `${config.prefix}tabs ${className}`.trim(), role: "tablist", onKeyDown },
      tabs.map((tab, i) => h("button", {
        key: i, ref: (el) => (buttons.current[i] = el), className: `${config.prefix}tab`, role: "tab", type: "button",
        id: `${id}tab${i}`, "aria-controls": `${id}panel${i}`, "aria-selected": i === at, tabIndex: i === at ? 0 : -1, onClick: () => setAt(i),
      }, tab.label))),
    tabs.map((tab, i) => h("div", { key: i, role: "tabpanel", id: `${id}panel${i}`, "aria-labelledby": `${id}tab${i}`, hidden: i !== at }, tab.content)));
}

// Modal and Drawer are the native <dialog>, opened and closed by a prop. onClose fires however it was closed
// (Escape, a form with method="dialog", or the prop), so keep your state in step there.
const dialog = (kind) => function Dialog({ open, onClose, className = "", children, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);
  return h("dialog", { ...rest, ref, className: `${config.prefix}${kind} ${className}`.trim(), onClose }, children);
};

/** <Modal open={open} onClose={() => setOpen(false)}>…</Modal> */
export const Modal = dialog("modal");
/** <Drawer open={open} onClose={() => setOpen(false)}>…</Drawer> */
export const Drawer = dialog("drawer");
