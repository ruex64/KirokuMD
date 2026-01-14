# KirokuMD Project Instructions

## Project Overview

KirokuMD is a Next.js application for editing and previewing markdown content with a quiet documentation aesthetic inspired by Japanese minimalism.

## Design Philosophy

- Quiet documentation aesthetic
- Minimal friction, sustained focus, visual calm
- No bright brand colors, no emojis, no animated icons
- Interface should feel like writing in a notebook

## Development Guidelines

- Use TypeScript for all new files
- Follow the existing component structure in src/components
- Use Tailwind CSS for styling
- Use Lucide React for icons - do not use emoji characters
- Support both dark and light themes using CSS variables
- Use the defined color palette (no pure black or pure white)

## File Organization

- Place new components in src/components
- Place context providers in src/context
- Place page components in src/app

## Styling Conventions

- Use Tailwind utility classes
- Use CSS custom properties for theme colors
- Support dark mode with the .dark class
- Use the prose classes for markdown content styling
- Editor: JetBrains Mono font
- Preview: Noto Serif JP font

## Export Functionality

- Text export: Raw content as .txt file
- Markdown export: Raw content as .md file
- PDF export: Rendered preview captured as PDF
- DOCX export: Structured document with headings and formatting

## UI Constraints

- No emojis
- No colorful badges
- No animated icons
- No heavy shadows
- No markdown toolbar clutter

## Commands

- npm run dev - Start development server
- npm run build - Create production build
- npm start - Run production server
- npm run lint - Run ESLint
