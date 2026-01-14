"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownPreviewProps {
  content: string;
}

export default function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div
        id="markdown-preview"
        className="flex-1 overflow-auto prose font-preview"
        style={{ background: "var(--bg-primary)" }}
      >
        {content ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        ) : (
          <p style={{ color: "var(--text-ghost)", fontStyle: "italic" }}>
            Preview will appear here...
          </p>
        )}
      </div>
    </div>
  );
}
