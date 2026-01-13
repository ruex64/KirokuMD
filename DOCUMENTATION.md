# Markdown Previewer Documentation

## Overview

Markdown Previewer is a web application built with Next.js that allows users to write, preview, and export markdown documents. The application features a split-view interface with real-time preview, theme switching between dark and light modes, and export functionality to multiple formats.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Features](#features)
3. [Project Structure](#project-structure)
4. [Components](#components)
5. [Usage Guide](#usage-guide)
6. [Export Formats](#export-formats)
7. [Theme System](#theme-system)
8. [Dependencies](#dependencies)
9. [Configuration](#configuration)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm, yarn, or pnpm package manager

### Installation

1. Clone the repository or navigate to the project directory:

```bash
cd markdown
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Production Build

To create a production build:

```bash
npm run build
npm start
```

---

## Features

### Split-View Interface
- Left panel: Markdown editor with syntax highlighting placeholder support
- Right panel: Live preview of rendered markdown
- Toggle buttons to show/hide either panel independently
- Full-width mode for either editor or preview

### Theme Support
- Light mode with clean, readable styling
- Dark mode for reduced eye strain
- Automatic theme detection based on system preferences
- Theme preference persistence in local storage

### Export Options
- Plain Text (.txt): Raw text export without formatting
- Markdown (.md): Original markdown syntax preserved
- PDF (.pdf): Rendered preview exported as PDF document
- Word Document (.docx): Structured export with headings and formatting

### Live Preview
- Real-time markdown rendering as you type
- Support for GitHub Flavored Markdown (GFM)
- Code block syntax highlighting
- Table rendering
- Task list support

### Statistics
- Character count display
- Word count display

---

## Project Structure

```
markdown/
├── src/
│   ├── app/
│   │   ├── globals.css      # Global styles and prose classes
│   │   ├── layout.tsx       # Root layout with ThemeProvider
│   │   └── page.tsx         # Main page component
│   ├── components/
│   │   ├── ExportMenu.tsx   # Export dropdown and functionality
│   │   ├── MarkdownApp.tsx  # Main application component
│   │   ├── MarkdownEditor.tsx # Text editor component
│   │   ├── MarkdownPreview.tsx # Preview renderer component
│   │   └── ThemeToggle.tsx  # Theme switch button
│   └── context/
│       └── ThemeContext.tsx # Theme state management
├── public/                   # Static assets
├── package.json             # Dependencies and scripts
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── DOCUMENTATION.md         # This file
```

---

## Components

### MarkdownApp
The main container component that orchestrates the entire application.

**Responsibilities:**
- Manages markdown content state
- Controls panel visibility (editor/preview)
- Renders header, main content area, and footer
- Displays character and word counts

### MarkdownEditor
A textarea-based editor for writing markdown content.

**Props:**
- `value: string` - Current markdown content
- `onChange: (value: string) => void` - Content change handler

**Features:**
- Monospace font for code-like editing experience
- Placeholder text for empty state
- Full height container utilization

### MarkdownPreview
Renders the markdown content as formatted HTML.

**Props:**
- `content: string` - Markdown content to render

**Features:**
- Uses react-markdown for parsing
- Supports GitHub Flavored Markdown via remark-gfm
- Styled with prose classes for typography

### ExportMenu
Dropdown menu for exporting content in various formats.

**Props:**
- `content: string` - Markdown content to export
- `filename?: string` - Base filename for exports (default: "document")

**Features:**
- Click-outside detection for closing
- Four export format options
- Visual icons for each format

### ThemeToggle
Button component for switching between light and dark themes.

**Features:**
- Sun icon for dark mode (click to switch to light)
- Moon icon for light mode (click to switch to dark)
- Smooth transition effects

### ThemeContext
React context provider for theme state management.

**Exports:**
- `ThemeProvider` - Context provider component
- `useTheme()` - Hook returning `{ theme, toggleTheme }`

**Features:**
- System preference detection
- Local storage persistence
- HTML class manipulation for dark mode

---

## Usage Guide

### Writing Markdown

The editor supports standard markdown syntax:

**Headings**
```markdown
# Heading 1
## Heading 2
### Heading 3
```

**Text Formatting**
```markdown
**bold text**
*italic text*
***bold and italic***
~~strikethrough~~
```

**Lists**
```markdown
- Unordered item
- Another item

1. Ordered item
2. Another item
```

**Code**
```markdown
Inline `code` here

\`\`\`javascript
const code = "block";
\`\`\`
```

**Links and Images**
```markdown
[Link text](https://example.com)
![Alt text](image-url.png)
```

**Tables**
```markdown
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
```

**Blockquotes**
```markdown
> This is a quote
```

### Panel Controls

- Click the left panel icon to toggle the editor visibility
- Click the right panel icon to toggle the preview visibility
- At least one panel will always remain visible

---

## Export Formats

### Plain Text (.txt)
Exports the raw markdown content as a plain text file. No rendering or formatting is applied.

### Markdown (.md)
Exports the markdown content with its original syntax preserved. Useful for sharing or version control.

### PDF (.pdf)
Captures the rendered preview panel and exports it as a PDF document. The export:
- Maintains the visual styling from the preview
- Supports multi-page documents for long content
- Uses A4 paper format

### Word Document (.docx)
Converts markdown to a Word document with:
- Heading levels (H1, H2, H3)
- Bold text formatting
- Bullet lists
- Plain paragraphs

Note: Complex formatting like tables, code blocks, and images may have limited support in DOCX export.

---

## Theme System

### How It Works

1. On initial load, the system checks for:
   - Saved preference in localStorage
   - System color scheme preference
   - Falls back to light mode

2. Theme changes:
   - Toggle the `dark` class on the HTML element
   - Save preference to localStorage
   - Update all styled components

### Customizing Themes

Theme colors can be modified in `globals.css`:

**Light Mode Variables**
```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}
```

**Dark Mode Variables**
Applied via the `.dark` class on prose elements and Tailwind's dark mode utilities.

---

## Dependencies

### Production Dependencies

| Package | Purpose |
|---------|---------|
| next | React framework |
| react | UI library |
| react-dom | React DOM renderer |
| react-markdown | Markdown to React converter |
| remark-gfm | GitHub Flavored Markdown support |
| lucide-react | Icon library |
| jspdf | PDF generation |
| html2canvas | HTML to canvas conversion |
| docx | Word document generation |
| file-saver | File download utility |

### Development Dependencies

| Package | Purpose |
|---------|---------|
| typescript | Type checking |
| tailwindcss | CSS framework |
| eslint | Code linting |
| @types/react | React type definitions |
| @types/file-saver | File-saver type definitions |

---

## Configuration

### Tailwind CSS

The project uses Tailwind CSS with the following customizations:
- Dark mode enabled via class strategy
- Custom prose styling for markdown content
- Extended color palette for theme support

### TypeScript

Strict mode is enabled with the following key settings:
- `strict: true`
- Path alias `@/*` maps to `./src/*`

### ESLint

Next.js default ESLint configuration with React and TypeScript rules.

---

## Troubleshooting

### Common Issues

**PDF Export Shows Blank Pages**
- Ensure the preview panel is visible before exporting
- Check that content is not empty
- Allow time for images to load if present

**Theme Not Persisting**
- Verify localStorage is not blocked
- Clear localStorage and refresh if corrupted
- Check browser privacy settings

**Export Not Downloading**
- Check browser download settings
- Ensure pop-up blockers are not interfering
- Verify sufficient disk space

**Preview Not Updating**
- Check for JavaScript errors in console
- Refresh the page
- Verify markdown syntax is valid

### Performance Tips

- For large documents, consider splitting into smaller sections
- Avoid embedding very large images
- Use code blocks sparingly for complex documents

---

## Browser Support

The application supports modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Internet Explorer is not supported.

---

## License

This project is available for use under standard open source terms.

---

## Support

For issues and feature requests, please create an issue in the project repository.
