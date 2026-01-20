# Session 03: Milestone 3 - Template Engine & Environment Stabilization
**Date**: 2026-01-19
**Objective**: Implement the Template Engine (Backend) and Drag & Drop Editor (Frontend), while resolving persistent environment instability.

## 📝 Activities

### 1. Environment & Utilities
- **Prisma Stabilization**:
    - Identified version mismatch (Prisma CLI 7.2.0 vs Client).
    - Downgraded to stable `prisma@5.10.2` and `@prisma/client@5.10.2`.
    - Fixed `.env` loading issues for `DATABASE_URL` (Port 5433).
    - Bypassed npx issues by using local node_modules binaries.
- **Dependency Fixes**:
    - Installed missing auth dependencies (`@nestjs/passport`, `@nestjs/jwt`, `bcrypt`, etc.).
    - Downgraded `apps/web` to Tailwind CSS v3 to align with `@latios/ui`.

### 2. Backend (Template Engine)
- **Module**: Created `TemplatesModule`.
- **Schema**: Defined `Template` model in `schema.prisma` with `structure` (JSON) and `isPublished` fields.
- **Controller**: Implemented standard CRUD operations.
- **Database**: Validated schema push and client generation.

### 3. Frontend (Editor & UI)
- **Dependencies**: Added `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` for drag-and-drop.
- **Components**:
    - `EditorLayout`: Split screen container.
    - `Toolbox`: Draggable items source (Text, Date, Signature).
    - `Canvas`: Droppable A4 area.
    - `SortableBlock`: Reorderable items.
- **Page**: Implemented `/dashboard/templates/create` route.
- **Fixes**:
    - Added `@latios/ui` to `apps/web` dependencies.
    - Configured `transpilePackages` in `next.config.ts`.
    - Fixed `globals.css` imports for Tailwind v3.

## ✅ Results
- `pnpm dev` runs successfully.
- API serves Template CRUD.
- Web displays the Drag & Drop Editor at `/dashboard/templates/create`.
- **MVP Editor Completed**:
    - Absolute positioning drag and drop (Canvas).
    - Grid Snapping (20px).
    - Block Resizing.
    - Block Handles for better UX.
    - Editable Document Title.
    - Real-time Saving.
    - Exact Layout Preview.

## ⏭️ Next Steps
- **Milestone 4**: Document Sending & Signing Engine.
    - Sending documents to email.
    - Signing interface for recipients.
    - PDF Generation.
