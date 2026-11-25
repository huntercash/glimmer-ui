/** Set `config.prefix = "gl-"` when you use css/prefixed.css, so toast() builds prefixed markup. */
export const config: { prefix: string };

export type ToastOptions = {
  type?: "primary" | "secondary" | "success" | "warning" | "danger";
  /** Milliseconds before it is removed. 0 keeps it until you call .remove() on the returned element. Default 4000. */
  duration?: number;
  /** Stack at the top of the page instead of the bottom. */
  top?: boolean;
  /** Stack at the start edge (left, or right in right-to-left pages) instead of the end. */
  start?: boolean;
};

/** Shows a message in the corner. The message is inserted as text, never as HTML. */
export function toast(message: string, options?: ToastOptions): HTMLDivElement;

/** Optional: sets up tooltips and tab stops inside `root` straight away instead of on first focus. Not for markup a framework is about to hydrate. */
export function init(root?: ParentNode): void;

/** Sent from a sidebar row before it is dragged (or moved with Alt+↑/↓) to a new place. `before` is the row it will land
    in front of, or null for the end of `list`. Call preventDefault() to stop the move and do it in your own state. */
export type MoveEvent = CustomEvent<{ list: HTMLElement; before: Element | null }>;
declare global {
  interface GlobalEventHandlersEventMap {
    "gl-move": MoveEvent;
  }
}
