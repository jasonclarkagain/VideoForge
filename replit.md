# ContentForge - AI Video Content Creator

## Overview
ContentForge is an AI-powered content creation tool designed for video creators on platforms like YouTube, Rumble, BitChute, Odysee, TikTok, and Instagram. It helps generate scripts, titles, descriptions, thumbnail concepts, and video ideas using AI.

## Tech Stack
- **Frontend**: React with TypeScript, TanStack Query, Wouter routing
- **Backend**: Express.js with TypeScript
- **AI**: OpenAI via Replit AI Integrations (no API key required)
- **Styling**: Tailwind CSS with Shadcn UI components
- **Storage**: In-memory storage (MemStorage)

## Project Structure
```
client/
├── src/
│   ├── components/
│   │   ├── generators/     # Content generation forms
│   │   │   ├── script-generator.tsx
│   │   │   ├── title-generator.tsx
│   │   │   ├── description-generator.tsx
│   │   │   ├── thumbnail-generator.tsx
│   │   │   └── ideas-generator.tsx
│   │   ├── ui/             # Shadcn UI components
│   │   ├── app-sidebar.tsx # Project navigation
│   │   ├── content-card.tsx
│   │   ├── loading-card.tsx
│   │   ├── platform-selector.tsx
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   ├── pages/
│   │   └── workspace.tsx   # Main workspace page
│   └── App.tsx             # Root component with layout
server/
├── index.ts                # Server entry point
├── routes.ts               # API routes
├── storage.ts              # In-memory data storage
└── openai.ts               # AI content generation
shared/
└── schema.ts               # Shared TypeScript types and Zod schemas
```

## Features
1. **Script Generator**: Create video scripts with customizable tone, length, and platform targeting
2. **Title Generator**: Generate SEO-optimized title variations with scoring
3. **Description Generator**: Platform-aware descriptions with character limits
4. **Thumbnail Concepts**: AI-generated thumbnail design ideas
5. **Ideas Generator**: Brainstorm video ideas based on niche and trends
6. **Project Management**: Organize content into projects
7. **Draft Saving**: Save generated content for later use
8. **Dark Mode**: Full light/dark theme support

## API Endpoints
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create a project
- `DELETE /api/projects/:id` - Delete a project
- `GET /api/drafts?projectId=` - Get drafts for a project
- `POST /api/drafts` - Save a draft
- `POST /api/generate/script` - Generate video script
- `POST /api/generate/titles` - Generate title options
- `POST /api/generate/descriptions` - Generate descriptions
- `POST /api/generate/thumbnails` - Generate thumbnail concepts
- `POST /api/generate/ideas` - Generate video ideas

## Running the App
The app runs with `npm run dev` which starts both the Express backend and Vite frontend on port 5000.

## Design Guidelines
- Uses Inter font for UI elements
- Uses JetBrains Mono for code/script content
- Purple primary color (#7C3AED)
- Clean, minimal workspace-focused design
- Follows Linear/Notion-style organization patterns
