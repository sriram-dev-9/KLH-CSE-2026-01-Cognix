import type { FileEntry, FolderEntry, LoadedFile, TreeEntry } from "../types/file";
import { unzipSync } from "fflate";
import mammoth from "mammoth";
import { classifyFile, LARGE_FILE_BYTES } from "./fileType";

export function supportsFileSystemAccess(): boolean {
  return typeof window !== "undefined" && "showDirectoryPicker" in window;
}

function sortEntries(entries: TreeEntry[]): TreeEntry[] {
  return [...entries].sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "directory" ? -1 : 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
}

// Reads exactly one level of a directory handle. Children directories are
// created "unloaded" — their own children are enumerated lazily the first
// time they're expanded, so opening a huge folder doesn't walk the whole
// tree up front.
export async function readDirectoryShallow(
  handle: FileSystemDirectoryHandle,
  parentPath: string
): Promise<TreeEntry[]> {
  const out: TreeEntry[] = [];
  for await (const [name, child] of (handle as any).entries()) {
    const path = parentPath ? `${parentPath}/${name}` : name;
    if (child.kind === "directory") {
      const folder: FolderEntry = {
        kind: "directory",
        name,
        path,
        handle: child as FileSystemDirectoryHandle,
        children: [],
        loaded: false,
      };
      out.push(folder);
    } else {
      const file: FileEntry = {
        kind: "file",
        name,
        path,
        handle: child as FileSystemFileHandle,
      };
      out.push(file);
    }
  }
  return sortEntries(out);
}

export async function buildRootFolder(
  handle: FileSystemDirectoryHandle
): Promise<FolderEntry> {
  const children = await readDirectoryShallow(handle, "");
  return {
    kind: "directory",
    name: handle.name,
    path: "",
    handle,
    children,
    loaded: true,
  };
}

// Immutably returns a new tree with the target folder's children populated.
export function updateFolderChildren(
  root: FolderEntry,
  targetPath: string,
  children: TreeEntry[]
): FolderEntry {
  function walk(entry: FolderEntry): FolderEntry {
    if (entry.path === targetPath) {
      return { ...entry, children, loaded: true };
    }
    return {
      ...entry,
      children: entry.children.map((c) =>
        c.kind === "directory" ? walk(c) : c
      ),
    };
  }
  return walk(root);
}

const TEXTUAL_CATEGORIES = new Set(["markdown", "text", "code", "json", "html", "css"]);

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

function odtToHtml(buffer: ArrayBuffer): string {
  const files = unzipSync(new Uint8Array(buffer));
  const content = files["content.xml"];
  if (!content) throw new Error("This ODT file does not contain content.xml.");

  const xml = new DOMParser().parseFromString(new TextDecoder().decode(content), "application/xml");
  if (xml.querySelector("parsererror")) throw new Error("The ODT document contains invalid XML.");

  function render(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) return escapeHtml(node.nodeValue ?? "");
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const element = node as Element;
    const children = Array.from(element.childNodes).map(render).join("");
    switch (element.localName) {
      case "h": {
        const level = Math.min(Number(element.getAttribute("text:outline-level")) || 2, 6);
        return `<h${level}>${children}</h${level}>`;
      }
      case "p": return `<p>${children}</p>`;
      case "line-break": return "<br />";
      case "s": return " ".repeat(Number(element.getAttribute("text:c")) || 1);
      case "list": return `<ul>${children}</ul>`;
      case "list-item": return `<li>${children}</li>`;
      case "tab": return "\t";
      default: return children;
    }
  }

  return `<!doctype html><html><head><style>body{font:16px/1.6 system-ui,sans-serif;max-width:850px;margin:32px auto;padding:0 24px;color:#20242b}h1,h2,h3,h4,h5,h6{line-height:1.2}pre{white-space:pre-wrap}</style></head><body>${render(xml.documentElement)}</body></html>`;
}

async function documentToHtml(file: File, extension: string): Promise<string> {
  const buffer = await file.arrayBuffer();
  if (extension === "docx") return (await mammoth.convertToHtml({ arrayBuffer: buffer })).value;
  return odtToHtml(buffer);
}

export async function loadFile(entry: FileEntry): Promise<LoadedFile> {
  const { category, language } = classifyFile(entry.name);
  const base: LoadedFile = {
    entry,
    category,
    language,
    size: 0,
    textContent: null,
    objectUrl: null,
    error: null,
  };

  try {
    const file = await entry.handle.getFile();
    const size = file.size;

    if (category === "unsupported") {
      return { ...base, size };
    }

    if (category === "image" || category === "pdf") {
      const url = URL.createObjectURL(file);
      return { ...base, size, objectUrl: url };
    }

    if (category === "document") {
      if (size > LARGE_FILE_BYTES) {
        return { ...base, size, error: `This document is ${formatBytes(size)}, which is too large to preview safely.` };
      }
      return { ...base, size, textContent: await documentToHtml(file, entry.name.split(".").pop()?.toLowerCase() ?? "") };
    }

    if (TEXTUAL_CATEGORIES.has(category)) {
      if (size > LARGE_FILE_BYTES) {
        return {
          ...base,
          size,
          error: `This file is ${formatBytes(size)}, which is too large to preview safely. Files over ${formatBytes(
            LARGE_FILE_BYTES
          )} are skipped to keep the app responsive.`,
        };
      }
      const text = await file.text();
      return { ...base, size, textContent: text };
    }

    return { ...base, size };
  } catch (err) {
    return {
      ...base,
      error: err instanceof Error ? err.message : "Failed to read file.",
    };
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
