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

### Milestone 2: Identity & Multi-tenancy (Completed)
- [x] **Auth Dependencies**
    - [x] Install `@nestjs/passport`, `@nestjs/jwt`, `passport-jwt`.
- [x] **Auth Module**
    - [x] Generate `modules/auth`.
    - [x] Implement `AuthService` (Login with Email/Password).
    - [x] Implement `JwtStrategy`.
- [x] **Multi-tenancy**
    - [x] Implement `TenantGuard` (Extract `companyId` from User).
    - [x] Ensure all DB queries use `companyId`.

---

## 🧠 Context
- **Discovery**: The existing repo used raw `pg` and had an incomplete packages structure.
- **Goal**: Align the template with Latios Sign specs (Prisma + Typed Packages).
