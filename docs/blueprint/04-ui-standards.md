# UI Standardization Guidelines

## Overview
This document outlines the standardized UI components and styles for Latios Sign to ensure a consistent user experience across the application.

## 1. Buttons (`Button`)
All buttons must use the standardized `Button` component from `@latios/ui`.

### Variants
- **Primary** (`variant="primary"`): Used for main actions.
  - Style: `bg-brand-600` (Mediso Green), White Text.
  - Hover: `bg-brand-700`.
  - Active: `bg-brand-800`.
- **Secondary** (`variant="secondary"`): Used for alternative actions (Cancel, Go back).
  - Style: White background, `border-gray-300`, Gray Text.
- **Ghost** (`variant="ghost"`): Used for low-priority actions or inside other components.

### Sizes
| Size | Height | Padding | Text Class | Usage |
|------|--------|---------|------------|-------|
| `sm` | 32px (`h-8`) | `px-3` | `text-xs` | Table actions, dense UIs |
| `md` | 40px (`h-10`) | `px-4` | `text-sm` | **Default**. Header actions, forms |
| `lg` | 44px (`h-11`) | `px-8` | `text-base`| Landing pages, major CTAs |

### Usage Example
```tsx
import { Button } from '@latios/ui';
import { Plus } from 'lucide-react';

<Button size="md" onClick={handleClick}>
    <Plus size={18} />
    Crear Documento
</Button>
```

## 2. Cards (`Card`)
All content containers must use the standardized `Card` component from `@latios/ui`.

### Style Specs
- **Background**: `bg-white`
- **Border**: `border border-gray-200`
- **Radius**: `rounded-xl`
- **Shadow**: `shadow-sm`

### Structure
- **Header** (Optional): If `title` or `actions` are provided, a header section is rendered with `bg-gray-50/50` and a bottom border.
- **Body**: The `children` are rendered in a `p-6` container.

### Usage Example
```tsx
import { Card } from '@latios/ui';

<Card title="Documentos Recientes" actions={<Button size="sm">Ver todo</Button>}>
    <List>...</List>
</Card>
```
