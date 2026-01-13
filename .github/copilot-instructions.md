# Markdown Previewer Project Instructions

## Project Overview

This is a Next.js application for editing and previewing markdown content with export capabilities.

## Development Guidelines

- Use TypeScript for all new files
- Follow the existing component structure in src/components
- Use Tailwind CSS for styling
- Use Lucide React for icons - do not use emoji characters
- Support both dark and light themes using the ThemeContext

## File Organization

- Place new components in src/components
- Place context providers in src/context
- Place page components in src/app

## Styling Conventions

- Use Tailwind utility classes
- Support dark mode with dark: prefix classes
- Use the prose classes for markdown content styling

## Export Functionality

- Text export: Raw content as .txt file
- Markdown export: Raw content as .md file
- PDF export: Rendered preview captured as PDF
- DOCX export: Structured document with headings and formatting

## Commands

- npm run dev - Start development server
- npm run build - Create production build
- npm start - Run production server
- npm run lint - Run ESLint
