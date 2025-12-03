# Design Guidelines: Content Creation Tool

## Design Approach
**System-Based Approach** drawing from Linear's clarity and Notion's organized workspace patterns. This is a utility-focused creator tool prioritizing efficiency, clear information hierarchy, and focused content generation workflows.

## Typography System
- **Primary Font**: Inter (Google Fonts) for interface elements
- **Monospace Font**: JetBrains Mono for generated script content
- **Hierarchy**:
  - Page Titles: text-2xl font-semibold
  - Section Headers: text-lg font-medium
  - Labels: text-sm font-medium
  - Body/Input Text: text-base
  - Helper Text: text-sm text-gray-600

## Layout System
**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, and 16 (e.g., p-4, gap-6, m-8)

**Main Layout Structure**:
- Top navigation bar (h-16) with app branding and user actions
- Two-column workspace layout on desktop (lg:grid-cols-[300px_1fr])
  - Left sidebar: Project list, templates, saved drafts (w-[300px], sticky)
  - Main content area: Active creation workspace with generous padding (p-8)
- Single column stack on mobile

**Content Area Organization**:
- Tabbed interface for different content types (Scripts, Titles, Descriptions, Thumbnails)
- Form-based inputs with clear visual separation between sections (space-y-6)
- Generated content displayed in distinct output cards with copy/edit actions

## Component Library

**Core Components**:
- **Input Fields**: Full-width text inputs and textareas with labels above, focus rings, character counters where relevant
- **Content Cards**: Generated results in white/elevated cards with rounded corners (rounded-lg), subtle shadows, clear "Copy" and "Edit" action buttons
- **Action Buttons**: Primary actions (Generate, Save) prominent; secondary actions (Cancel, Reset) subtle
- **Multi-select Pills**: For platform selection (YouTube, Rumble, etc.) and tags/keywords
- **Progress Indicators**: Linear progress bars for generation status
- **Dropdown Menus**: Tone selector, length options, template chooser

**Navigation**:
- Clean top bar with minimal branding, new project button, settings icon
- Left sidebar with project folders/list view, search functionality
- Tabbed content sections within workspace

**Forms & Data Display**:
- Stacked form layout with consistent label positioning
- Input groups for related fields (e.g., video topic + target audience)
- Preview panels showing formatted output
- Side-by-side comparison view for multiple variations

**Icons**: Use Heroicons (solid for filled actions, outline for navigation)

## Key Interaction Patterns
- Click-to-edit inline editing for saved content
- Real-time character count feedback
- One-click copy to clipboard with visual confirmation
- Auto-save draft indicators
- Keyboard shortcuts for power users (Cmd+Enter to generate)

## Workspace Features
- **Template Cards**: Grid of pre-made templates (2-column on tablet, 3-column on desktop)
- **Content History**: Chronological list of recently generated items with thumbnails
- **Batch Generation**: Option to generate multiple variations at once, displayed in grid format

## Animations
Minimal and purposeful only:
- Smooth fade-in for generated content (duration-300)
- Slide-down for notifications/alerts
- No decorative animations

## Images
No hero images needed - this is a functional workspace application. Focus on clean, organized interface design.

**Overall Aesthetic**: Clean, focused, creator-friendly workspace that prioritizes content visibility and generation workflow efficiency. Think Linear's precision meets Notion's organizational clarity.