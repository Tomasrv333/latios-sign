# Latios – AI Context

## Qué es Latios

Latios es una plataforma SaaS multi-tenant diseñada para ser el **sistema operativo empresarial** de pequeñas y medianas empresas.

No es un ERP monolítico tradicional.  
Es una **plataforma base (Latios Core)** sobre la cual se instalan módulos como:
- gestión documental
- firma electrónica
- portal del empleado
- flujos de aprobación
- CRM
- ventas
- compras
- inventarios

Cada empresa (tenant) vive dentro de Latios, comparte la misma infraestructura, pero tiene sus datos aislados por `empresa_id` y políticas de seguridad a nivel de base de datos.

El objetivo es que toda la información, procesos y relaciones de una empresa vivan dentro de Latios.

---

## Arquitectura actual

Latios se construye como un **monorepo** con:

- `apps/web` → Next.js (frontend)
- `apps/api` → NestJS (backend)
- PostgreSQL → Base de datos principal (dockerizada en dev)
- Migraciones → Versionamiento del esquema
- Archivos → S3 / MinIO (fuera de la DB)

---

## Modelo multi-tenant

Latios usa un modelo **multi-tenant por fila (row-based)**:

- Todas las tablas funcionales incluyen `empresa_id`
- Todas las queries deben filtrar por `empresa_id`
- PostgreSQL Row Level Security (RLS) garantiza aislamiento real

Además existe un modelo híbrido:
- Tenants pequeños → DB compartida
- Tenants enterprise → DB dedicada (mismo esquema)

El backend decide a qué DB conectarse según el tenant.

---

## Núcleo Latios (Latios Core)

El Core provee:

- Empresas (tenants)
- Usuarios
- Roles y permisos (RBAC)
- Empleados
- Archivos
- Eventos y auditoría
- Notificaciones
- Planes y suscripciones
- Integraciones externas por empresa

Los módulos (documentos, firmas, CRM, etc.) **no implementan seguridad ni auth por su cuenta**: usan el Core.

---

## Principios no negociables

1. **Multi-tenant por diseño**
   Ningún módulo puede acceder a datos sin `empresa_id`.

2. **Seguridad en base de datos**
   PostgreSQL RLS protege incluso si hay bugs en el código.

3. **Auditoría**
   Toda acción relevante genera un Evento.

4. **Modularidad**
   Los módulos nunca duplican:
   - usuarios
   - empresas
   - archivos
   - permisos

5. **Evolución por migraciones**
   Nunca se cambia la DB “a mano”.

---

## MVP actual

Latios MVP =

**Latios Core + Gestión Documental + Firma Electrónica**

Eso permite vender:
> “Gestión y firma de documentos empresariales en la nube”.

---

## Perfil del usuario

El fundador/desarrollador principal es una sola persona.  
El sistema debe ser:
- simple de operar
- fácil de desplegar
- claro de mantener
- sin dependencias innecesarias

---

## Qué no es Latios

Latios NO es:
- un ERP contable
- un proyecto a medida por cliente
- una app aislada

Es una **plataforma SaaS**.
