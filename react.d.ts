import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import type { ChartKinds, ChartType } from "./charts.js";

export { config, toast } from "./behaviors.js";
export type { ToastOptions } from "./behaviors.js";

export type ChartProps<T extends ChartType> = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  type: T;
  data: ChartKinds[T][0];
  options?: ChartKinds[T][1];
  /** Lets charts over labels, times or candles zoom and pan. */
  zoom?: boolean;
};
/** A chart: drawn on the server, interactive in the browser. */
export function Chart<T extends ChartType>(props: ChartProps<T>): ReactElement;

export type TabsProps = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  tabs: { label: ReactNode; content: ReactNode }[];
  defaultIndex?: number;
};
/** Tabs with their panels, arrow-key navigation included. */
export function Tabs(props: TabsProps): ReactElement;

export type DialogProps = Omit<ComponentPropsWithoutRef<"dialog">, "open"> & {
  open: boolean;
  /** Fires however the dialog was closed (Escape, a form with method="dialog", or the prop). Set your state to false here. */
  onClose?: ComponentPropsWithoutRef<"dialog">["onClose"];
};
export function Modal(props: DialogProps): ReactElement;
export function Drawer(props: DialogProps): ReactElement;
