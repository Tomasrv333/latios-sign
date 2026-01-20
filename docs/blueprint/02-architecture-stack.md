# 🏗️ Stack Tecnológico y Arquitectura

## Estructura de Repositorio
* **Monorepo**: Gestionado con `pnpm workspaces` y orquestado por **Turborepo** para optimizar builds y ejecución de tareas.

## Aplicaciones (`/apps`)
* **API (NestJS)**:
    * Arquitectura modular.
    * Uso de **Prisma ORM** para la interacción con PostgreSQL.
    * Validación de datos con `class-validator`.
* **WEB (Next.js 14+)**:
    * App Router.
    * Tailwind CSS para el diseño de interfaces.
    * Gestión de estados complejos para el editor Drag & Drop.

## Infraestructura y Servicios
| Componente | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Base de Datos** | PostgreSQL (Neon/Supabase) | Persistencia relacional y multi-tenancy. |
| **Storage** | Supabase Storage | Almacenamiento de PDFs y activos de plantillas. |
| **Emails/OTP** | Resend | Envío de códigos de validación y notificaciones. |
| **Manipulación PDF** | `pdf-lib` | Generación dinámica de documentos y estampa de firmas. |

## Diagrama de Flujo de Datos