# 📡 Diseño de API: Latios Sign Engine

## 1. Filosofía y Estándares
* **Arquitectura**: RESTful API versionada.
* **Prefijo Global**: `/v1/` para garantizar compatibilidad con futuras iteraciones de Latios Core.
* **Autenticación**: Stateless mediante JWT. Los firmantes externos usan tokens de acceso único de corta duración.
* **Aislamiento Multi-tenant**: El `company_id` es obligatorio en el contexto de cada solicitud. Se extrae del JWT para usuarios internos y del mapeo de tokens para firmantes externos.

## 2. Estructura de Mensajes
Todas las comunicaciones deben seguir un formato predecible para facilitar el consumo desde el Frontend o integraciones externas.

### 2.1. Respuesta Exitosa
- `success`: boolean (siempre true)
- `data`: object/array (los datos solicitados)
- `message`: string (breve descripción de la acción)

### 2.2. Respuesta de Error
- `success`: boolean (siempre false)
- `error`: objeto que contiene `code` (string constante), `message` (legible) y `details` (array opcional).

## 3. Mapa de Recursos (V1)

### 3.1. Infraestructura y Tenancy (Auth & Admin)
* `POST /v1/auth/login`: Autenticación de usuarios internos de la empresa.
* `GET /v1/companies/me`: Obtiene la configuración visual (logo, colores) y límites del plan de la empresa actual.
* `PATCH /v1/companies/me`: Actualización de metadata corporativa.

### 3.2. Gestión de Procesos (Business Units)
* `GET /v1/processes`: Lista todos los procesos (ej: RRHH, Legal) asociados al tenant.
* `POST /v1/processes`: Crea un nuevo proceso para agrupar plantillas.
* `DELETE /v1/processes/:id`: Eliminación lógica (soft-delete) de procesos.

### 3.3. Motor de Plantillas (Template Engine)
* `POST /v1/templates`: Guarda la estructura JSON generada por el editor drag & drop.
* `GET /v1/templates/:id`: Recupera la estructura para edición.
* `GET /v1/templates`: Listado con metadatos y versiones.

### 3.4. Ciclo de Vida del Documento
* `POST /v1/documents`: Inicia el flujo de firma. Crea el snapshot inmutable de la plantilla seleccionada.
* `GET /v1/documents/:id`: Metadata del documento y estado actual (Pending, Signed, Canceled).
* `GET /v1/documents/:id/history`: Retorna la tabla de eventos de auditoría (logs).

### 3.5. Public API (Endpoints de Firma)
Endpoints accesibles mediante el token único del enlace de firma.
* `POST /v1/public/verify-identity`: Valida email/celular contra los datos del documento.
* `POST /v1/public/request-otp`: Dispara el envío del código vía Resend.
* `POST /v1/public/execute-sign`: Procesa el garabato de firma, valida el OTP, genera el hash SHA-256 y finaliza el PDF.

## 4. Estrategia de Reutilización (Latios Core)
Para que este engine funcione como el núcleo de firmas de Latios:
1. **Webhook System**: Al completarse una firma, la API debe disparar un evento Webhook a las URLs configuradas en la tabla `companies`.
2. **Document Verification**: El endpoint `GET /v1/public/verify/:hash` permitirá que cualquier tercero valide la integridad de un archivo sin estar autenticado.
3. **Internal SDK**: Las definiciones de esta API deben exportarse como interfaces de TypeScript en `packages/shared-types` para consumo directo en el monorepo.

---
**Nota para el Agente**: Implementar validación de esquemas estricta en cada entrada usando DTOs de NestJS. Ningún campo desconocido debe ser procesado.