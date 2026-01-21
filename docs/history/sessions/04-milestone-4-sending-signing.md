# Session 04: Milestone 4 - Document Sending & Signing
**Date**: 2026-01-20
**Objective**: Implement the lifecycle for sending documents and enabling public signing.

## 📝 Activities

### 1. Planning & Pivot
- **Decision**: Deprioritized "PDF Backgrounds" in favor of core Sending/Signing flow to accelerate time-to-value.
- **Goal**: Enable tracking of sent documents and public access via secure tokens.

### 2. Backend (Document Engine)
- **Schema**: Defining `Document` model.
- **Module**: Creating `DocumentsModule`.
- **Logic**: 
    - `POST /documents`: Create instance from Template.
    - `POST /documents/:id/send`: Generate token and send email (stub for now).

### 3. Frontend (Signing UI)
- **Public Route**: `/sign/[token]`.
- **Canvas**: Read-only render of the document structure.
- **Interaction**: Input fields for signing.

## ✅ Results
- (Pending)

## ⏭️ Next Steps
- Implement Schema.
- Build Send Flow.
- Build Sign Flow.
