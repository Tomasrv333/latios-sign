# ADR-0001 – Estrategia Multi-tenant

## Estado
Aceptado

## Contexto

Latios es una plataforma SaaS que debe alojar múltiples empresas (tenants) en una sola infraestructura.  
Se requiere:
- aislamiento de datos
- bajo costo inicial
- escalabilidad
- opción enterprise

---

## Decisión

Latios usará un modelo **híbrido**:

### Modo estándar (default)
- Una sola base de datos PostgreSQL
- Un solo esquema
- Todas las tablas incluyen `empresa_id`
- PostgreSQL Row Level Security (RLS) fuerza aislamiento

### Modo enterprise
- Tenants grandes pueden vivir en una base dedicada
- Mismo esquema
- La app decide la conexión según `empresa_id` y `plan`

---

## Justificación

- DB compartida reduce costos, complejidad y tiempos de onboarding.
- RLS proporciona aislamiento real incluso ante bugs.
- DB dedicada permite cumplir requisitos legales y de rendimiento para clientes grandes.
- El modelo híbrido evita reescrituras futuras.

---

## Consecuencias

- Todas las tablas funcionales deben incluir `empresa_id`
- Todas las queries deben filtrar por `empresa_id`
- Se debe implementar RLS en PostgreSQL
- Se debe implementar un Tenant Router en NestJS

---

## Riesgos mitigados

| Riesgo | Mitigación |
|------|-----------|
| Fuga de datos | PostgreSQL RLS |
| Cuello de botella | Escalado vertical + particiones + DB dedicadas |
| Backups por cliente | Exportaciones o DB dedicadas |
| Requerimientos legales | Modo enterprise |

---

## Decisiones futuras relacionadas

- ADR-0002: Autenticación y JWT
- ADR-0003: Almacenamiento de archivos
- ADR-0004: Estrategia de migraciones
