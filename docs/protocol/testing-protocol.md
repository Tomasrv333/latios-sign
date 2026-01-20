# 🧪 Protocolo de Pruebas (QA)

Para garantizar un software confiable y seguro, el agente debe seguir estos criterios de testing:

## 1. Pruebas Unitarias (Jest)
* **Ubicación**: Junto al archivo fuente (ej: `hashing.service.spec.ts`).
* **Cobertura Obligatoria**:
    * Servicios de cálculo de hash $SHA-256$.
    * Lógica de validación de tokens OTP.
    * Mapeo de coordenadas en el generador de PDF.

## 2. Pruebas End-to-End (Cypress)
* **Escenario Crítico**: "Flujo Completo de Firma".
    1. Login de gestor.
    2. Creación de plantilla.
    3. Envío de documento.
    4. Validación de identidad del firmante.
    5. Firma y validación OTP.
    6. Verificación de visualización del comprobante final.

## 3. Seguridad
* **Multi-tenant Test**: Intentar acceder a un documento de la Empresa B con un token de la Empresa A; el sistema debe retornar `403 Forbidden`.