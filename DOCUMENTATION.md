# KirokuMD Documentation

## Overview

KirokuMD is a web application built with Next.js that allows users to write, preview, and export markdown documents. The application features a split-view interface with real-time preview, theme switching between dark and light modes, export functionality to multiple formats, and a role-based access control system with admin approval for new users.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Features](#features)
3. [User Management](#user-management)
4. [Project Structure](#project-structure)
5. [Components](#components)
6. [Usage Guide](#usage-guide)
7. [Export Formats](#export-formats)
8. [Theme System](#theme-system)
9. [Dependencies](#dependencies)
10. [Firebase Setup](#firebase-setup)
11. [Configuration](#configuration)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm, yarn, or pnpm package manager
- Firebase project (for authentication and database)

### Installation

1. Clone the repository or navigate to the project directory:

```bash
cd markdown
```

2. Install dependencies:

```bash
npm install
```

3. Set up Firebase (see [Firebase Setup](#firebase-setup) section)

4. Create `.env.local` with your Firebase configuration

5. Start the development server:

```bash
npm run dev
```

6. Open your browser and navigate to `http://localhost:3000`

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

### User Management & Access Control
- **Admin Approval Required**: New users must be approved by an admin before accessing the platform
- **Role-Based Access**: Five user roles with different permissions
  - **Admin**: Full platform access, can manage all users and documents
  - **Owner**: Can create documents and manage access to their files
  - **Editor**: Can edit documents shared with them (cannot create new documents)
  - **Viewer**: Can only view documents shared with them
  - **Commenter**: Can view and comment on documents shared with them
- **Document Sharing**: Owners can share documents with specific users
- **Collaborator Roles**: 
  - **Editor**: Can view and edit the document
  - **Commenter**: Can view and comment on the document
  - **Viewer**: Can only view the document

### Version History
- **Automatic Versioning**: Versions are created when you save documents
- **Auto-Save**: Documents auto-save after 30 seconds of inactivity with changes
- **Max 25 Versions**: Each document retains up to 25 historical versions
- **Version Details**: Each version records:
  - Timestamp of when it was saved
  - User who made the changes (name and email)
  - Full document content at that point
- **Version Preview**: Click on any version to preview its content
- **Rollback**: Restore any previous version with one click
- **Character Diff**: See how much content changed between versions

### Statistics
- Character count display
- Word count display

---

## User Management

### Authentication Flow

KirokuMD uses Firebase Authentication with a custom approval system:

1. **Sign Up**: Users create an account via email/password or Google
2. **Pending Status**: New users are placed in a "pending" state
3. **Admin Approval**: An admin must approve the user before they can access the platform
4. **Access Granted**: Once approved, users can access the dashboard and create documents

**Note**: The first user to sign up automatically becomes an admin with approved status.

### User Roles

KirokuMD uses a 5-role permission system:

| Role | Description | Can Create Documents | Platform Permissions |
|------|-------------|---------------------|---------------------|
| **Admin** | Platform administrator | Yes | Manage all users and roles, approve/reject users, full access to all documents |
| **Owner** | Standard content creator | Yes | Create documents, share with others, manage access to their files |
| **Editor** | Content editor | No | Edit documents shared with them |
| **Viewer** | Read-only user | No | View documents shared with them |
| **Commenter** | Reviewer | No | View and comment on documents shared with them |

#### Role Hierarchy

- **Admin**: Full platform control. Can change any user's data, role, or approval status. Has access to admin panel.
- **Owner**: Can create their own documents and manage who has access to their files. Can share documents with Editors, Viewers, and Commenters.
- **Editor**: Cannot create new documents. Can only edit documents that have been shared with them by an Owner.
- **Viewer**: Cannot create or edit documents. Can only view documents shared with them.
- **Commenter**: Cannot create or edit documents. Can view and add comments to documents shared with them.

### Admin Panel

Accessible at `/admin` for admin users only:

- **View all users**: See registered users with their status and role
- **Filter by status**: View pending, approved, or rejected users
- **Approve users**: Grant platform access to pending users
- **Reject users**: Deny access to pending users
- **Change roles**: Assign any of the 5 roles to users (Admin, Owner, Editor, Viewer, Commenter)
- **Revoke access**: Remove access from approved users

### Document Sharing

Document owners can share their documents with other users:

1. Open a document in the editor
2. Click the **Share** button (only visible to document owner)
3. Enter the user's email address
4. Select permission level:
   - **Viewer**: Read-only access to the document
   - **Commenter**: View and comment on the document
   - **Editor**: Full edit access to the document
5. Click Add to invite the user

**Note**: Only users with Admin or Owner roles can create new documents. Editors, Viewers, and Commenters can only access documents shared with them.

### Version History

KirokuMD automatically tracks document changes with a version history system:

#### How Versioning Works

1. **Manual Save**: Press `Ctrl+S` or click the Save button to create a new version
2. **Auto-Save**: Documents automatically save after 30 seconds of inactivity (if changes were made)
3. **Maximum 25 Versions**: Each document retains up to 25 historical versions; older versions are automatically removed

#### Version Information

Each version records:
- **Version Number**: Sequential number (v1, v2, v3, etc.)
- **Timestamp**: When the version was created
- **Author**: User who made the changes (name and email)
- **Content**: Full document content at that point in time

#### Using Version History

1. Open a document in the editor
2. Click the **History** button (clock icon) in the toolbar
3. Browse the list of versions:
   - See relative timestamps (e.g., "5m ago", "2h ago")
   - View character count differences (+/- chars)
   - Identify who made each change
4. **Preview**: Click the eye icon or the version card to preview that version
5. **Restore**: Click the restore icon to rollback to a previous version

#### Rollback Behavior

When you restore a previous version:
- The document content is replaced with the historical version
- A new version is automatically created (preserving the rollback in history)
- The original versions remain intact

### User Status Pages

| Route | Description |
|-------|-------------|
| `/pending` | Shown to users awaiting admin approval |
| `/access-denied` | Shown to users whose access was rejected |

---

## Project Structure

```
markdown/
├── src/
│   ├── app/
│   │   ├── access-denied/
│   │   │   └── page.tsx     # Access denied page for rejected users
│   │   ├── admin/
│   │   │   └── page.tsx     # Admin panel for user management
│   │   ├── dashboard/
│   │   │   └── page.tsx     # Dashboard with document list
│   │   ├── editor/
│   │   │   └── [id]/
│   │   │       └── page.tsx # Dynamic editor route
│   │   ├── login/
│   │   │   └── page.tsx     # Login page
│   │   ├── pending/
│   │   │   └── page.tsx     # Pending approval page
│   │   ├── signup/
│   │   │   └── page.tsx     # Signup page
│   │   ├── globals.css      # Global styles and prose classes
│   │   ├── layout.tsx       # Root layout with providers
│   │   └── page.tsx         # Landing page
│   ├── components/
│   │   ├── ExportModal.tsx  # Export modal and functionality
│   │   ├── MarkdownApp.tsx  # Legacy standalone editor
│   │   ├── MarkdownEditor.tsx # Text editor component
│   │   ├── MarkdownPreview.tsx # Preview renderer component
│   │   ├── ShareModal.tsx   # Document sharing modal
│   │   ├── ThemeToggle.tsx  # Theme switch button
│   │   ├── VersionHistoryModal.tsx # Version history list modal
│   │   └── VersionPreviewModal.tsx # Version preview modal
│   ├── context/
│   │   ├── AuthContext.tsx  # Firebase auth state management
│   │   └── ThemeContext.tsx # Theme state management
│   ├── lib/
│   │   ├── documents.ts     # Firestore document operations
│   │   ├── firebase.ts      # Firebase initialization
│   │   ├── users.ts         # User management operations
│   │   └── versions.ts      # Version history operations
│   └── types/
│       ├── document.ts      # Document & version TypeScript interfaces
│       └── user.ts          # User TypeScript interfaces
├── public/                   # Static assets
├── .env.local               # Environment variables (not in git)
├── .env.example             # Environment template
├── package.json             # Dependencies and scripts
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── wrangler.toml            # Cloudflare Pages config
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

### AuthContext
React context provider for authentication and user state.

**Exports:**
- `AuthProvider` - Context provider component
- `useAuth()` - Hook returning auth state and methods

**Properties:**
- `user: User | null` - Firebase user object
- `appUser: AppUser | null` - App user with role and status
- `loading: boolean` - Auth state loading indicator
- `isAdmin: boolean` - Whether current user is admin
- `isApproved: boolean` - Whether current user is approved

**Methods:**
- `signIn(email, password)` - Email/password sign in
- `signUp(email, password)` - Create new account
- `signInWithGoogle()` - Google OAuth sign in
- `signOut()` - Sign out current user
- `refreshAppUser()` - Refresh user data from Firestore

### ShareModal
Modal component for managing document collaborators.

**Props:**
- `documentId: string` - ID of document to share
- `documentTitle: string` - Title for display
- `collaborators: Collaborator[]` - Current collaborators
- `currentUserId: string` - Owner's user ID
- `onClose: () => void` - Close handler
- `onUpdate: () => void` - Refresh callback

**Features:**
- Add collaborators by email
- Set permission levels (viewer/commenter/editor)
- Remove existing collaborators
- Change collaborator roles

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

**Firebase Authentication Errors**
- Verify Firebase config values in `.env.local`
- Ensure authentication methods are enabled in Firebase Console
- Check that Firestore security rules allow authenticated access

**User Stuck on Pending Page**
- Check if an admin exists (first user should auto-become admin)
- Verify Firestore `users` collection has the user document
- Admin needs to approve the user in `/admin` panel

**Cannot Access Admin Panel**
- Only users with `role: "admin"` and `status: "approved"` can access
- Check user document in Firestore
- First registered user should automatically be admin

**Document Sharing Not Working**
- Verify collaborator email is correct (case-sensitive)
- Check Firestore security rules are properly configured
- Collaborator must have an approved account on the platform

**Collaborator Cannot Edit**
- Verify collaborator role is set to "editor" not "viewer"
- Owner can change roles in the Share modal

### Performance Tips

- For large documents, consider splitting into smaller sections
- Avoid embedding very large images
- Use code blocks sparingly for complex documents

---

## Firebase Setup

KirokuMD uses Firebase for authentication and document storage. Follow these steps to set up Firebase for your deployment:

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name and follow the setup wizard
4. Once created, click the web icon (`</>`) to add a web app
5. Register your app and copy the configuration values

### 2. Configure Environment Variables

Create a `.env.local` file in your project root with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Enable Authentication Methods

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** authentication
3. Enable **Google** authentication (optional)
   - Configure your OAuth consent screen if prompted
   - Add authorized domains for your deployment

### 4. Set Up Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Choose "Start in production mode"
4. Select a location closest to your users

The application uses the following collections:

| Collection | Purpose |
|------------|---------|
| `users` | User profiles with roles and approval status |
| `documents` | Document metadata and content |
| `documentVersions` | Version history for each document |

**Document Version Structure:**
```javascript
{
  documentId: "abc123",        // Reference to parent document
  versionNumber: 5,            // Sequential version number
  title: "My Document",        // Document title at this version
  content: "# Hello...",       // Full content at this version
  createdAt: Timestamp,        // When this version was created
  createdBy: {
    userId: "user123",
    email: "user@example.com",
    displayName: "John Doe"
  }
}
```

### 5. Configure Security Rules

In Firestore, go to **Rules** and set up the following security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is approved
    function isApproved() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.status == 'approved';
    }
    
    // Helper function to check if user is admin
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' 
             && isApproved();
    }

    // Users collection
    match /users/{userId} {
      // Users can read their own data
      allow read: if request.auth != null && request.auth.uid == userId;
      // Users can create their own profile (first time setup)
      allow create: if request.auth != null && request.auth.uid == userId;
      // Only admins can update user data (for approval/role changes)
      allow update: if request.auth != null && isAdmin();
      // Admins can read all users
      allow read: if request.auth != null && isAdmin();
    }

    // Documents collection
    match /documents/{documentId} {
      // Owner can read/write their documents
      allow read, write: if request.auth != null 
                         && isApproved()
                         && request.auth.uid == resource.data.userId;
      // Create new document
      allow create: if request.auth != null 
                    && isApproved()
                    && request.auth.uid == request.resource.data.userId;
      // Collaborators can read documents shared with them
      allow read: if request.auth != null 
                  && isApproved()
                  && resource.data.collaborators != null
                  && request.auth.token.email in resource.data.collaborators[*].email;
      // Collaborators with editor role can update
      allow update: if request.auth != null 
                    && isApproved()
                    && resource.data.collaborators != null
                    && request.auth.token.email in resource.data.collaborators[*].email;
    }

    // Document versions collection
    match /documentVersions/{versionId} {
      // Allow read if user has access to the parent document
      allow read: if request.auth != null && isApproved();
      // Allow create if user is approved (version validation done in app)
      allow create: if request.auth != null && isApproved();
      // Allow delete for cleanup (pruning old versions)
      allow delete: if request.auth != null && isApproved();
    }
  }
}
```

These rules ensure:
- Users must be authenticated AND approved to access the platform
- Only admins can approve users and change roles
- Document owners have full control over their documents
- Collaborators can access shared documents based on their role
- New documents must have the creator's userId

### 6. Deploy Environment Variables

When deploying to Cloudflare Pages or other platforms, add your Firebase environment variables to the platform's environment settings:

1. Go to your deployment platform's dashboard
2. Navigate to Settings > Environment Variables
3. Add each `NEXT_PUBLIC_FIREBASE_*` variable with its value
4. Redeploy your application

---

## Deployment

### Cloudflare Pages

KirokuMD can be deployed to Cloudflare Pages. Follow these steps:

1. Connect your repository to Cloudflare Pages
2. Set the build command: `npm run build`
3. Set the output directory: `.next`
4. Configure the compatibility settings (see below)

#### Node.js Compatibility Error

When deploying to Cloudflare Pages, you may encounter the following error:

```
Node.JS Compatibility Error
no nodejs_compat compatibility flag set
```

**Why this happens:**

Next.js and some of its dependencies (like `jspdf`, `html2canvas`, and `docx` used for export functionality) require Node.js APIs that are not available in Cloudflare Workers by default. Cloudflare Workers run in a V8 isolate environment, which differs from a standard Node.js runtime.

**How to fix it:**

1. Create a `wrangler.toml` file in your project root with the following content:

```toml
name = "kirokumd"
compatibility_date = "2025-09-01"
compatibility_flags = ["nodejs_compat"]

[vars]
NODE_VERSION = "18"
```

2. In the Cloudflare Pages dashboard:
   - Go to your project Settings
   - Navigate to Functions
   - Set Compatibility date to `2025-09-01`
   - Add `nodejs_compat` to Compatibility flags
   - Save and redeploy

The `nodejs_compat` flag enables Node.js compatibility mode, which provides polyfills for common Node.js APIs within the Cloudflare Workers environment.

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
