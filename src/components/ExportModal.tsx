"use client";

import { useState } from "react";
import { X, FileText, FileCode, FileType, FileDown, Check } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";

interface ExportModalProps {
  content: string;
  filename: string;
  onClose: () => void;
}

type ExportFormat = "txt" | "md" | "pdf" | "docx";

export default function ExportModal({ content, filename, onClose }: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const exportAsText = () => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `${filename}.txt`);
  };

  const exportAsMarkdown = () => {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    saveAs(blob, `${filename}.md`);
  };

  const exportAsPDF = async () => {
    const previewElement = document.getElementById("markdown-preview");
    if (!previewElement) return;

    const canvas = await html2canvas(previewElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#faf9f7",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${filename}.pdf`);
  };

  const exportAsDocx = async () => {
    const lines = content.split("\n");
    const children: Paragraph[] = [];

    for (const line of lines) {
      if (line.startsWith("# ")) {
        children.push(
          new Paragraph({
            text: line.substring(2),
            heading: HeadingLevel.HEADING_1,
          })
        );
      } else if (line.startsWith("## ")) {
        children.push(
          new Paragraph({
            text: line.substring(3),
            heading: HeadingLevel.HEADING_2,
          })
        );
      } else if (line.startsWith("### ")) {
        children.push(
          new Paragraph({
            text: line.substring(4),
            heading: HeadingLevel.HEADING_3,
          })
        );
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        children.push(
          new Paragraph({
            children: [new TextRun(line.substring(2))],
            bullet: { level: 0 },
          })
        );
      } else if (line.startsWith("**") && line.endsWith("**")) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line.slice(2, -2),
                bold: true,
              }),
            ],
          })
        );
      } else if (line.trim() === "") {
        children.push(new Paragraph({ text: "" }));
      } else {
        children.push(
          new Paragraph({
            children: [new TextRun(line)],
          })
        );
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${filename}.docx`);
  };

  const handleExport = async () => {
    if (!selectedFormat) return;
    
    setIsExporting(true);
    
    try {
      switch (selectedFormat) {
        case "txt":
          exportAsText();
          break;
        case "md":
          exportAsMarkdown();
          break;
        case "pdf":
          await exportAsPDF();
          break;
        case "docx":
          await exportAsDocx();
          break;
      }
      setExportComplete(true);
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const formats = [
    { 
      id: "txt" as ExportFormat, 
      label: "Plain Text", 
      ext: ".txt",
      description: "Raw text without formatting",
      icon: FileText 
    },
    { 
      id: "md" as ExportFormat, 
      label: "Markdown", 
      ext: ".md",
      description: "Original markdown syntax",
      icon: FileCode 
    },
    { 
      id: "pdf" as ExportFormat, 
      label: "PDF Document", 
      ext: ".pdf",
      description: "Formatted document for print",
      icon: FileType 
    },
    { 
      id: "docx" as ExportFormat, 
      label: "Word Document", 
      ext: ".docx",
      description: "Editable word processor format",
      icon: FileDown 
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md mx-4 border"
        style={{ 
          background: "var(--bg-primary)",
          borderColor: "var(--border-primary)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <span 
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Export Document
          </span>
          <button
            onClick={onClose}
            className="p-1 transition-opacity hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <p 
            className="text-xs mb-4"
            style={{ color: "var(--text-muted)" }}
          >
            Select a format for your document
          </p>

          <div className="space-y-2">
            {formats.map((format) => (
              <button
                key={format.id}
                onClick={() => setSelectedFormat(format.id)}
                className="w-full flex items-center gap-3 p-3 border transition-all"
                style={{ 
                  borderColor: selectedFormat === format.id 
                    ? "var(--accent)" 
                    : "var(--border-subtle)",
                  background: selectedFormat === format.id 
                    ? "var(--bg-secondary)" 
                    : "transparent"
                }}
              >
                <format.icon 
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: "var(--text-muted)" }}
                />
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {format.label}
                    </span>
                    <span 
                      className="text-xs"
                      style={{ color: "var(--text-ghost)" }}
                    >
                      {format.ext}
                    </span>
                  </div>
                  <span 
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {format.description}
                  </span>
                </div>
                {selectedFormat === format.id && (
                  <Check 
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: "var(--accent)" }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div 
          className="flex items-center justify-end gap-3 px-5 py-4 border-t"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm transition-opacity hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={!selectedFormat || isExporting}
            className="px-4 py-2 text-sm transition-opacity disabled:opacity-40"
            style={{ 
              background: "var(--accent)",
              color: "var(--bg-primary)"
            }}
          >
            {exportComplete ? "Exported" : isExporting ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
}
