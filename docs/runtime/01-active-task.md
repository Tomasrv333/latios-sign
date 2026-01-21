# Task Checklist

## Milestone 1: Core Backend & Data Model (Completed)
- [x] Define Prisma Schema (User, Company, Template, Document)
- [x] Seed Initial Data (Test Users, Company)
- [x] Create Core Modules (Auth, Documents, Templates)
- [x] Implement PDF Handling Logic (Basic)

## Milestone 2: Authentication & Dashboard (Completed)
- [x] Implement Login with JWT
- [x] Create Dashboard Layout (Sidebar, Header)
- [x] Implement "My Documents" View
- [x] Implement Documents Statistics

## Milestone 3: Template Engine (Completed)
- [x] Create Template Builder UI (Drag & Drop)
- [x] Implement Tool Box (Text, Date, Signature)
- [x] Save Template Structure to DB
- [x] Render Template logic (Editor & Viewer)

## Milestone 4: Signing Process & RBAC (Completed)
- [x] Public Signing Interface (`/sign/:token`)
- [x] Role-Based Access Control (RBAC)
    - [x] Roles: Admin, Leader, Manager, Member
    - [x] Leader sees all, Manager sees own
- [x] Manager Preview Modal (No Editor Access)
- [x] UI Standardization (Buttons, Cards)

## Milestone 5: Advanced Template Editor (Current)
- [x] **UI/UX General Improvements**
    - [x] Fix Header Z-Index/Overlap.
    - [x] Refine Templates Page UX (Title, Icons, Roles, Custom Delete Modal, Layout).
    - [x] **Clean Interface**: Removed Right Sidebar, moved functionality to Header.
    - [x] **Header Polish**: Reordered icons (Delete left), improved Title Input styles (No border, visible icon).
    - [x] **Configuration Modal**: 
        - [x] Removed vertical borders.
        - [x] Standardized Inputs (reused `Input` component).
        - [x] Improved contrast of separators.
    - [x] **Unified Block Settings**: Minimalist hover controls with "Settings" dropdown (Add Row/Col, Delete).
    - [x] **Visual Polish**: Hidden borders by default, standardized inputs.
    - [x] **Save Confirmation**: Added safety check before saving.
- [x] **New Tools**
    - [x] **Table Tool**: Fully editable via new Settings Menu.
    - [x] **Image Tool**: Upload/Resize.
    - [x] **Separator**: Visual Divider.
- [x] **Rich Text & Advanced Properties**
    - [x] Update Data Model (`styles` object).
    - [x] Create `BlockToolbar` component (Floating).
- [x] **Rich Text & Advanced Properties**
    - [x] Update Data Model (`styles` object).
    - [x] Create `BlockToolbar` component (Floating).
    - [x] Implement Text Styling (Font, Size, Color, Weight, Italic).
    - [x] Implement Image Styling (Border Radius, etc.).
    - [x] Selection State Management in Canvas.
    - [x] Refine Toolbar Position (Fix Overlap).
    - [x] Fix Preview Styles matching.
    - [x] Toolbar Interaction Polish (Settings Trigger, Unified Menu).
    - [x] Remove Global Focus Borders (Visual Polish).
- [x] **Functional Fixes**
    - [x] Drag & Drop Logic.
    - [x] Preview Modal Z-Index (Portals).
    - [x] Fix Drag Overlay artifacts (White box on canvas drag).
