# Markdown Previewer

A modern markdown editor and previewer built with Next.js, featuring live preview, dark/light mode support, and export functionality.

## Features

- Split-view interface with editor and live preview
- Dark and light mode theme support
- Export to multiple formats (TXT, MD, PDF, DOCX)
- Real-time markdown rendering
- GitHub Flavored Markdown support
- Character and word count statistics

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm package manager

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Tech Stack

- Next.js with App Router
- TypeScript
- Tailwind CSS
- React Markdown
- Lucide React Icons
- jsPDF and html2canvas for PDF export
- docx for Word document export

## Project Structure

```
src/
├── app/           # Next.js app directory
├── components/    # React components
└── context/       # React context providers
```

## Documentation

See [DOCUMENTATION.md](DOCUMENTATION.md) for detailed documentation.

## License

MIT
