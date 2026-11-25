// A deliberately small highlighter: one regex pass per language, no dependency.
// ponytail: regex tokens, not a parser. Swap in shiki if the snippets ever need real grammar.
export type Lang = "html" | "css" | "swift" | "bash" | "js";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const span = (kind: string, text: string) => `<span class="tok-${kind}">${text}</span>`;

const keywords: Record<Exclude<Lang, "html">, string> = {
  css: "import|layer|theme|media|property",
  swift: "import|struct|var|let|func|some|return|true|false|nil|self|public|private|in|if|else",
  bash: "npm|npx|pnpm|yarn|bun|node|swift|cp|cd",
  js: "import|from|export|const|let|function|return|default|new|await|async",
};
const comment: Record<Exclude<Lang, "html">, string> = {
  css: String.raw`\/\*[\s\S]*?\*\/`,
  swift: String.raw`\/\/.*$`,
  bash: "#.*$",
  js: String.raw`\/\/.*$`,
};

export function highlight(code: string, lang: Lang): string {
  const text = esc(code);
  if (lang === "html") {
    // comment | tag name | attribute name | string
    return text.replace(
      /(&lt;!--[\s\S]*?--&gt;)|(&lt;\/?)([\w-]+)|([\w:-]+)(?==")|("[^"]*")/g,
      (m, com, open, tag, attr, str) =>
        com ? span("com", com) : tag ? open + span("tag", tag) : attr ? span("attr", attr) : str ? span("str", str) : m,
    );
  }
  // comment | string | keyword | call or at-rule
  const pattern = new RegExp(String.raw`(${comment[lang]})|("[^"\n]*"|'[^'\n]*')|(@?\b(?:${keywords[lang]})\b)|(\.[a-zA-Z]\w*(?=\())`, "gm");
  return text.replace(pattern, (m, com, str, kw, fn) =>
    com ? span("com", com) : str ? span("str", str) : kw ? span("kw", kw) : fn ? span("fn", fn) : m,
  );
}

export type CodeTab = { label: string; code: string; html: string };
export const tab = (label: string, lang: Lang, code: string): CodeTab => ({ label, code, html: highlight(code, lang) });
