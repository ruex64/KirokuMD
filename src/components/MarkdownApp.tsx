"use client";

import { useState } from "react";
import { FileText, PanelLeft, PanelRight } from "lucide-react";
import MarkdownEditor from "./MarkdownEditor";
import MarkdownPreview from "./MarkdownPreview";
import ExportMenu from "./ExportMenu";
import ThemeToggle from "./ThemeToggle";

const DEFAULT_CONTENT = `# Welcome to Markdown Previewer

This is a **markdown previewer** with live preview and export functionality.

## Features

- Live preview as you type
- Dark and light mode support
- Export to multiple formats:
  - Plain text (.txt)
  - Markdown (.md)
  - PDF (.pdf)
  - Word document (.docx)

## Markdown Examples

### Text Formatting

You can make text **bold**, *italic*, or ***both***.

### Lists

#### Unordered List
- Item 1
- Item 2
- Item 3

#### Ordered List
1. First item
2. Second item
3. Third item

### Code

Inline \`code\` looks like this.

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

### Blockquote

> This is a blockquote.
> It can span multiple lines.

### Table

| Feature | Status |
|---------|--------|
| Editor | Done |
| Preview | Done |
| Export | Done |

### Link

[Visit GitHub](https://github.com)

---

Start editing on the left panel to see the live preview here!
`;

export default function MarkdownApp() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [showEditor, setShowEditor] = useState(true);
  const [showPreview, setShowPreview] = useState(true);

  const toggleEditor = () => {
    if (showEditor && !showPreview) {
      setShowPreview(true);
    }
    setShowEditor(!showEditor);
  };

  const togglePreview = () => {
    if (showPreview && !showEditor) {
      setShowEditor(true);
    }
    setShowPreview(!showPreview);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Markdown Previewer
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Panel Toggle Buttons */}
          <button
            onClick={toggleEditor}
            className={`p-2 rounded-lg transition-colors ${
              showEditor
                ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
            }`}
            title={showEditor ? "Hide Editor" : "Show Editor"}
          >
            <PanelLeft className="w-5 h-5" />
          </button>
          <button
            onClick={togglePreview}
            className={`p-2 rounded-lg transition-colors ${
              showPreview
                ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
            }`}
            title={showPreview ? "Hide Preview" : "Show Preview"}
          >
            <PanelRight className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-2" />

          <ThemeToggle />

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-2" />

          <ExportMenu content={content} filename="markdown-document" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {showEditor && (
          <div
            className={`${
              showPreview ? "w-1/2" : "w-full"
            } border-r border-gray-200 dark:border-gray-800`}
          >
            <MarkdownEditor value={content} onChange={setContent} />
          </div>
        )}

        {showPreview && (
          <div className={`${showEditor ? "w-1/2" : "w-full"}`}>
            <MarkdownPreview content={content} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-4 py-2 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 text-center text-xs text-gray-500 dark:text-gray-400">
        <span>
          {content.length} characters | {content.split(/\s+/).filter(Boolean).length} words
        </span>
      </footer>
    </div>
  );
}
