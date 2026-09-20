import type { ViewerCategory } from "../types/file";

const MARKDOWN_EXT = new Set(["md", "markdown"]);
const PLAIN_TEXT_EXT = new Set(["txt", "log", "csv", "env", "ini", "toml", "rst"]);
const IMAGE_EXT = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "ico"]);
const DOCUMENT_EXT = new Set(["docx", "odt"]);

// Extension -> syntax-highlighter language id.
const CODE_LANG_MAP: Record<string, string> = {
  js: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "tsx",
  py: "python",
  java: "java",
  c: "c",
  cpp: "cpp",
  cc: "cpp",
  h: "c",
  hpp: "cpp",
  rs: "rust",
  dart: "dart",
  kt: "kotlin",
  lua: "lua",
  r: "r",
  go: "go",
  php: "php",
  rb: "ruby",
  swift: "swift",
  sh: "bash",
  bash: "bash",
  sql: "sql",
  yaml: "yaml",
  yml: "yaml",
  xml: "xml",
  tex: "latex",
};

export function getExtension(filename: string): string {
  const idx = filename.lastIndexOf(".");
  if (idx === -1 || idx === filename.length - 1) return "";
  return filename.slice(idx + 1).toLowerCase();
}

export function classifyFile(filename: string): {
  category: ViewerCategory;
  language: string | null;
} {
  const ext = getExtension(filename);

  if (MARKDOWN_EXT.has(ext)) return { category: "markdown", language: null };
  if (ext === "json") return { category: "json", language: "json" };
  if (ext === "html" || ext === "htm") return { category: "html", language: "markup" };
  if (ext === "css" || ext === "scss") return { category: "css", language: ext === "scss" ? "scss" : "css" };
  if (IMAGE_EXT.has(ext)) return { category: "image", language: null };
  if (ext === "pdf") return { category: "pdf", language: null };
  if (DOCUMENT_EXT.has(ext)) return { category: "document", language: null };
  if (ext in CODE_LANG_MAP) return { category: "code", language: CODE_LANG_MAP[ext] };
  if (PLAIN_TEXT_EXT.has(ext)) return { category: "text", language: null };

  // No extension at all — try treating well-known dotfiles as text.
  if (ext === "") return { category: "text", language: null };

  return { category: "unsupported", language: null };
}

// Very small heuristic to avoid trying to render huge files as syntax-
// highlighted / markdown content, which can freeze the tab.
export const LARGE_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
