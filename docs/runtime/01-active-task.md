# 🚀 Active Task: Latios Sign Engine Remediation

**Current Phase**: Phase 1 - Remediation & Alignment
**Architect**: @Antigravity

---

## 📅 Roadmap Overview

### Milestone 1: Fix & Configure Monorepo (Completed)
- [x] **Shared Packages**
    - [x] **Refactor**: Rename `packages/shared` -> `packages/shared-types`.
    - [x] **Init**: Add `package.json` and `tsconfig.json` to `shared-types`.
    - [x] **New**: Initialize `packages/ui` for the Design System.
- [x] **Database Migration (Prisma)**
    - [x] **Install**: Add `prisma` and `@prisma/client` to `apps/api`.
    - [x] **Init**: Run `npx prisma init` in `apps/api`.
    - [x] **Cleanup**: Remove legacy `src/db/db.service.ts` (raw pg).
- [x] **Verification**
    - [x] Ensure `pnpm dev` runs all apps with the new structure.

### Milestone 3: Template Engine (MVP) (Completed)
- [x] **Frontend (Web)**
    - [x] **Layout**: Implement "Mediso" Sidebar and Shell in `apps/web`.
    - [x] **Frontend**: Setup Drag & Drop Editor <!-- id: 23 -->
    - [x] **Backend**: Generate `TemplatesModule` <!-- id: 24 -->
    - [x] **Backend**: Define `Template` Schema <!-- id: 25 -->
    - [x] **Backend**: Implement Template CRUD <!-- id: 26 -->
    - [x] **Integration**: Connect Editor Save Button <!-- id: 27 -->
        - [x] Lift state from Editor to CreatePage
        - [x] Add Name Input to UI
        - [x] Update Backend to accept `structure`
        - [x] Wire up API call
        - [x] **Fix**: Bypass Proxy issues by connecting directly to `127.0.0.1:3001`.
    - [x] **Frontend**: Template List View <!-- id: 28 -->
        - [x] Create `/dashboard/templates/page.tsx`
        - [x] Fetch and display templates
    - [x] **Frontend**: Template Edit View <!-- id: 29 -->
        - [x] Create `/dashboard/templates/[id]/page.tsx`
        - [x] Fetch template and hydrate Editor
        - [x] Update save logic to PATCH
    - [x] **Frontend**: Template Renderer (Preview) <!-- id: 30 -->
        - [x] Create `TemplateRenderer` component
        - [x] Add Preview Modal to Edit Page
    - [x] **Frontend**: Delete Template <!-- id: 31 -->
        - [x] Add Delete button to List View
        - [x] Add Delete button to Edit View
        - [x] Wire up API call

### Milestone 2: Identity & Access Management (Implemented)
- [x] **Frontend (Web)**
    - [x] Create `auth/login/page.tsx` and Layout.
    - [x] Integrate with `api/auth/login`.
    - [x] Store JWT Token (Cookie + LocalStorage).
    - [x] **Middleware**: Protect `/dashboard` routes.
- [x] **Backend (API)**
    - [x] Verify `AuthModule` (Done).
    - [x] Enforce `JwtAuthGuard` globally (except login).
    - [x] Remove `getFallbackCompanyId` (Strict Auth enforced).

### Current Status
- **Backend**: Strict Auth enabled.
- **Frontend**: Middleware protects Dashboard. Login sets session.
- **Next**: Verify functionality.

---

## 🧠 Context
- **Discovery**: The existing repo used raw `pg` and had an incomplete packages structure.
- **Goal**: Align the template with Latios Sign specs (Prisma + Typed Packages).
