# KirokuMD

A minimal markdown editor for quiet documentation. Built with Next.js, featuring a split-view interface, dark and light themes, and export functionality.

## Design Philosophy

KirokuMD applies a quiet documentation aesthetic inspired by Japanese minimalism. The interface is designed to feel like writing in a notebook and viewing a clean archive, prioritizing minimal friction, sustained focus, and visual calm.

## Features

- Split-view interface with editor and live preview
- Focus mode for distraction-free writing
- Dark and light theme support with smooth transitions
- Export to TXT, MD, PDF, and DOCX formats
- Toggleable document metadata panel
- Character and word count statistics
- Japanese labels for editor and preview panes

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
- React Markdown with remark-gfm
- Lucide React Icons
- jsPDF and html2canvas for PDF export
- docx for Word document export
- Inter, Noto Serif JP, and JetBrains Mono fonts

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
