# LATIOS CORE  
**Sistema Operativo Empresarial para PYMEs**

---

## 1. Visión

Latios es una plataforma SaaS multi-tenant diseñada para convertirse en la **columna vertebral digital** de pequeñas y medianas empresas.

No es un ERP tradicional.  
Es un **sistema operativo empresarial** sobre el cual se instalan módulos que cubren las funciones esenciales de cualquier empresa: personas, documentos, procesos, clientes, dinero y cumplimiento legal.

El objetivo es que una empresa opere, crezca y se audite completamente dentro de Latios.

---

## 2. Principio fundamental

Toda empresa es un organismo compuesto por:
- Personas
- Información
- Procesos
- Relaciones comerciales
- Cumplimiento legal

Latios modela estos elementos como **dominios universales** y permite que múltiples aplicaciones (módulos) los utilicen sin duplicar información.

---

## 3. Arquitectura conceptual

Latios está compuesto por dos capas:

### 3.1 Plataforma Latios (SaaS Core)
Gestiona:
- Tenants (empresas)
- Usuarios
- Roles y permisos
- Facturación y planes
- Archivos
- Auditoría
- Integraciones
- Seguridad
- APIs

### 3.2 Core de cada empresa
Cada empresa (tenant) contiene:
- Empleados
- Documentos
- Flujos
- Clientes
- Contratos
- Operaciones

Los módulos viven aquí.

---

## 4. Modelo Multi-tenant

Todas las empresas comparten:
- La misma base de datos
- La misma API
- El mismo sistema

Pero todos los datos están aislados por: empresa_id


Cada tabla funcional debe incluir `empresa_id`.

---

## 5. Núcleo Latios (Latios Core)

Entidades fundamentales:

### Empresa
Representa un tenant.
- id
- nombre
- plan
- estado

### Usuario
Persona que accede al sistema.
- id
- empresa_id
- email
- password_hash
- estado

### Rol y Permisos (RBAC)
Controla acceso universal.
- roles
- permisos
- asignaciones

### Empleado
Representa una persona dentro de la empresa.
- id
- empresa_id
- usuario_id (opcional)
- cargo
- jefe

### Archivo
Repositorio central de documentos.
- id
- empresa_id
- nombre
- tipo
- hash
- storage_path

### Evento (Auditoría)
Toda acción relevante genera eventos.
- usuario
- empresa
- tipo
- fecha
- IP

### Notificaciones
Canal universal de comunicación.
- email
- push
- sms
- webhooks

### Planes y suscripciones
Control de monetización.
- planes
- empresas
- estados

---

## 6. Módulos

Los módulos son aplicaciones independientes que usan el Core.

Ejemplos:

| Módulo | Función |
|------|-------|
| Gestión documental | Contratos, políticas, formatos |
| Firma electrónica | Validación legal de documentos |
| Portal del empleado | Solicitudes, noticias, certificados |
| Flujos | Aprobaciones, procesos internos |
| CRM | Clientes y oportunidades |
| Ventas | Cotizaciones y contratos |
| Compras | Proveedores y órdenes |
| Inventarios | Stock y activos |

Cada módulo:
- Usa usuarios, empresas, archivos y permisos del Core
- Nunca duplica autenticación ni datos base

---

## 7. Integraciones

Cada empresa puede conectar servicios externos:

Ejemplos:
- WhatsApp
- Email
- SMS
- Stripe
- Google
- Firma digital
- ERP externos

Modelo:
- EmpresaIntegracion
- empresa_id
- tipo
- token_encriptado
- config


Esto permite que cada empresa tenga:
- Sus propias API keys
- Sus propios webhooks
- Sus propios proveedores

---

## 8. Seguridad

Latios usa:

- Autenticación centralizada
- JWT o OAuth2
- RBAC (roles y permisos)
- Auditoría completa por empresa
- Aislamiento por empresa_id
- Encriptación de secretos

Los módulos no implementan seguridad por su cuenta.

---

## 9. Almacenamiento de archivos

Todos los archivos viven en un servicio externo:
- S3
- MinIO
- GCS
- Azure Blob

Latios solo guarda:
- metadatos
- hash
- ruta

---

## 10. MVP de Latios

El MVP es:

**Latios Core + Gestión Documental + Firma Electrónica**

Incluye:
- Empresas
- Usuarios
- Roles
- Archivos
- Documentos
- Flujos de firma
- Auditoría legal
- Almacenamiento
- Billing básico

Esto permite vender:
> “Gestión documental y firmas para empresas”

---

## 11. Estrategia de crecimiento

1. Lanzar Documentos + Firma
2. Agregar Portal del Empleado
3. Agregar Flujos
4. Agregar CRM
5. Agregar Ventas
6. Agregar Compras e Inventarios

Todos sobre el mismo Core.

---

## 12. Modelo de negocio

- Core Latios: suscripción base por empresa
- Módulos: activación por separado
- Integraciones: algunas premium

Esto maximiza:
- ingresos recurrentes
- lock-in
- valor por cliente

---

## 13. Objetivo final

Latios debe convertirse en:
> El sistema donde vive toda la información, procesos y relaciones de una empresa.

Cambiar de Latios debe ser tan costoso como cambiar de sistema operativo.
