"use client";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function MarkdownEditor({ 
  value, 
  onChange, 
  placeholder = "Begin writing your record." 
}: MarkdownEditorProps) {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 w-full px-4 py-2 resize-none editor-textarea font-editor text-sm"
        style={{
          background: "var(--bg-secondary)",
          color: "var(--text-primary)",
        }}
        spellCheck={false}
      />
    </div>
  );
}
