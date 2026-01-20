# Prompt Template – Latios

Usa este formato para cualquier desarrollo o cambio.

---

## Objetivo
(Qué se quiere construir o modificar)

## Contexto Latios
- Sistema multi-tenant
- Todas las tablas usan empresa_id
- Seguridad por PostgreSQL RLS
- Arquitectura monorepo (Next + Nest + Postgres)

## Alcance
(Qué incluye esta solicitud)

## Fuera de alcance
(Qué NO debe tocarse)

## Entidades involucradas
(Lista de tablas o dominios)

## Reglas obligatorias
- No romper multi-tenant
- No duplicar usuarios, empresas, archivos o permisos
- Toda acción relevante genera Evento
- Toda query debe filtrar por empresa_id

## Cambios esperados
- Migraciones necesarias
- Nuevos endpoints
- Cambios de UI

## Integraciones
(Si aplica: email, firma, WhatsApp, etc.)

## Seguridad
- Qué permisos requiere
- Qué roles pueden usarlo

## Casos de prueba mínimos
- Empresa A no puede ver Empresa B
- Usuario sin permiso no puede ejecutar acción
- Auditoría se registra
