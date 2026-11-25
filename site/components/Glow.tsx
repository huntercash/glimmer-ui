"use client";

// Loads the kit's optional scripts once for the whole site: the pointer glow, the behaviours and the <gl-chart> element.
import "../../glow.js";
import "../../charts.js";
import { toast } from "../../behaviors.js";

// The toast example's preview is plain HTML with an inline handler, which can only reach globals.
if (typeof window !== "undefined") Object.assign(window, { glimmerToast: toast });

export function Glow() {
  return null;
}
