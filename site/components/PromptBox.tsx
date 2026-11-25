"use client";

import { CodeBox } from "@/components/CodeBox";
import { buildPrompt } from "@/lib/prompt";
import { useTheme } from "@/lib/theme";

const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** A copyable setup prompt for AI coding agents. It rewrites itself as the navbar's theme controls change. */
export function PromptBox() {
  const prompt = buildPrompt(useTheme());
  return <CodeBox wrap tabs={[{ label: "Prompt for AI agents", code: prompt, html: escape(prompt) }]} />;
}
