# Session 05: Milestone 2 - Authentication & Identity
**Date**: 2026-01-20
**Objective**: Implement full Authentication flow (Login, JWT, Session) and enforce Multi-tenancy security.

## 📝 Activities

### 1. Backend (API)
- [x] **Auth Controller**: Created `AuthController` exposing `POST /auth/login`.
- [x] **Seeding**: Created and ran `prisma/seed.ts`.
    - **Default Company**: Latios HQ (`latios-hq`)
    - **Default User**: Admin (`admin@latios.com` / `admin123`)
- [x] **Security**: 
    - Enforced `JwtAuthGuard` on `TemplatesController`.
    - **Removed** `getFallbackCompanyId` (Strict Auth only).
    - **Fix**: Implemented `@Public()` decorator to allow access to `/auth/login` while keeping global guard active.
    - **Fix**: Resolved import path issue in `jwt-auth.guard.ts` that caused Public routes to be blocked (401).

### 2. Frontend (Web)
- [x] **Login Page**: Created `/auth/layout.tsx` and `/auth/login/page.tsx`.
    - **Fix**: Darkened UI text colors for better visibility.
- [x] **Auth Logic**: 
    - Implemented Login POST request.
    - Stores `accessToken` in `localStorage` (for API calls) AND `document.cookie` (for Middleware).
- [x] **Middleware**:
    - Created `apps/web/middleware.ts`.
    - **Redirect Loop Fix**: Checks if token exists. 
    - If trying to access `/dashboard` without token -> Redirects to `/auth/login`.
    - If trying to access `/auth` with token -> Redirects to `/dashboard`.
    - Root `/` -> Redirects to `/dashboard`.
- [x] **Logout & UI Refinement**:
    - **Logout**: Implemented `handleLogout` in `Sidebar.tsx`.
    - **Layout**: Fixed "sticky sidebar" issue (margin instead of padding).
- [x] **Template Engine Fixes**:
    - **UX**: Removed all browser `alert()` popups (Verified).
    - **Edit Page**: Fixed `loading is not defined` crash by restoring state. Added Authorization headers.
    - **List Page**: Fixed "Abrir" button clickability (z-index issue resolved).

## 📋 Context
- Authentication is fully functional and **Enforced**.
- Unauthenticated users cannot access the Dashboard.
- API requests without a valid token will fail (401 Unauthorized).
