# Cognix — Local File Viewer

Cognix is a browser-based local file explorer and viewer. Pick a folder on
your computer, browse it as a collapsible file tree, and click any file to
view it — Markdown rendered, code syntax-highlighted, images and PDFs
previewed, JSON pretty-printed, and HTML shown in a sandboxed preview.

Everything happens entirely in your browser tab. There is no backend, no
API, no database, and no upload step of any kind.

## What it does

- Select a folder via the browser's native folder picker.
- Browse its contents as a collapsible, alphabetically-sorted file tree
  (folders before files at each level).
- Click a file to view it in the right-hand panel, with a type-appropriate
  renderer.
- Folder contents are read lazily: opening a folder only lists its
  immediate children, and a file's contents are only read when you click
  it — so pointing this at a large project directory stays responsive.

## Installation

```bash
npm install
```

## Running it

Development server (hot reload):

```bash
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`) in a
Chromium-based browser.

Production build:

```bash
npm run build
npm run preview
```

## Supported browsers

Cognix relies on the browser's **File System Access API**
(`window.showDirectoryPicker`), which is currently only implemented by
Chromium-based browsers:

- Google Chrome
- Microsoft Edge
- Brave

Other browsers (Firefox, Safari) do not yet support this API. If you open
Cognix in an unsupported browser, it will show a clear message explaining
that local folder access isn't available rather than failing silently.

## Why your files stay local

Cognix never sends file contents anywhere:

- Folder access uses `window.showDirectoryPicker()`, which returns a
  handle scoped to your local file system — the browser reads directly
  from disk into the page's memory.
- File contents are only read when you open a file
  (`FileSystemFileHandle.getFile()`), never eagerly for the whole tree.
- Images and PDFs are shown via `URL.createObjectURL()`, a local blob URL
  that never leaves the browser; these URLs are revoked when you switch
  files or close the tab, to avoid memory leaks.
- There is no `fetch`/`XMLHttpRequest` call anywhere in the app, no
  backend server, and no third-party script that could exfiltrate data.
  You can verify this yourself by inspecting the Network tab — you'll see
  no requests when browsing files.

## Supported file types

| Type | Extensions | Rendered as |
| --- | --- | --- |
| Markdown | `.md`, `.markdown` | Fully rendered (headings, bold/italic, lists, links, blockquotes, tables, code blocks, inline code, horizontal rules) via `react-markdown` + GFM |
| Plain text | `.txt`, `.log`, `.csv` | Scrollable monospace text |
| Source code | `.js` `.jsx` `.ts` `.tsx` `.py` `.java` `.c` `.cpp` `.h` `.hpp` `.rs` `.go` `.php` `.rb` `.swift` `.sh` `.bash` `.sql` `.yaml` `.yml` `.xml` | Syntax-highlighted, with line numbers, preserved indentation, horizontal + vertical scroll |
| JSON | `.json` | Pretty-printed and syntax-highlighted; falls back to raw content with an error indicator if the file isn't valid JSON |
| HTML | `.html`, `.htm` | Sandboxed `<iframe>` preview (scripts disabled) with a toggle to view raw source |
| CSS | `.css`, `.scss` | Syntax-highlighted source |
| Images | `.png` `.jpg` `.jpeg` `.gif` `.webp` `.svg` `.bmp` `.ico` | Rendered inline, scaled to fit while preserving aspect ratio |
| PDF | `.pdf` | Rendered via the browser's native PDF viewer in an iframe |
| Anything else | — | Clear "cannot be previewed" message with file name, extension, and size |

## Known limitations

- **Chromium-only.** Firefox and Safari don't implement the File System
  Access API yet, so folder selection isn't available there.
- **CSV is shown as plain text**, not as a parsed/formatted table — good
  enough for a quick look, not a spreadsheet viewer.
- **Very large text/code files (>5 MB) are skipped** with an explanatory
  message rather than rendered, to keep the tab responsive.
- **No file editing or writing** — this is a read-only viewer.
- **No search** across the folder tree (yet).
- Folder structure is re-read from disk each time you add a folder; the
  app doesn't watch the file system for external changes while it's open.

## Project structure

```
src/
├── components/
│   ├── Header.tsx
│   ├── FileExplorer.tsx
│   ├── FileTree.tsx
│   ├── FileTreeItem.tsx
│   ├── FileViewer.tsx
│   └── viewers/
│       ├── MarkdownViewer.tsx
│       ├── CodeViewer.tsx
│       ├── TextViewer.tsx
│       ├── JsonViewer.tsx
│       ├── HtmlViewer.tsx
│       ├── ImageViewer.tsx
│       ├── PdfViewer.tsx
│       └── UnsupportedViewer.tsx
├── types/
│   └── file.ts
├── utils/
│   ├── fileSystem.ts
│   └── fileType.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Testing it yourself

Any folder works — point it at a real project of yours, or create a
scratch folder with a mix of files to exercise every viewer:

```
test-content/
├── src/
│   ├── App.tsx
│   └── utils.py
├── docs/
│   └── notes.md
├── data.json
├── page.html
├── style.css
├── photo.png
├── readme.txt
└── archive.zip      (exercises the "unsupported" viewer)
```

Click "+ Add Folder", pick that directory, and click through the tree.
