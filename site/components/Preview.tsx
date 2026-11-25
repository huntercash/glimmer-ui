import type { Example } from "@/lib/registry";

/** Renders an example's HTML live. The markup is our own registry content, never user input. */
export function Preview({ example }: { example: Pick<Example, "html" | "preview" | "layout" | "tall"> }) {
  const classes = ["preview", example.layout === "block" && "preview-block", example.tall && "preview-tall"];
  // <gl-chart> redraws itself as soon as its script loads, which can be before React hydrates: the markup is expected to differ.
  return <div className={classes.filter(Boolean).join(" ")} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: example.preview ?? example.html }} />;
}
