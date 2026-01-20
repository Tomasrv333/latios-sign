# 🎯 Visión del Producto: Latios Sign Engine

## Propósito
Latios Sign Engine es una plataforma SaaS diseñada para la gestión integral de firmas electrónicas y digitales. El objetivo es proporcionar a las empresas del ecosistema Latios una herramienta legalmente vinculante, segura y altamente personalizable para la formalización de documentos.

## Modelo de Negocio: SaaS Multi-tenant
* **Aislamiento Total**: Cada empresa (tenant) posee su propio espacio lógico, usuarios, procesos y documentos.
* **Jerarquía Organizacional**:
    * **Empresa**: Entidad legal principal.
    * **Procesos**: Categorías funcionales (RRHH, Legal, Ventas) para organizar documentos.
    * **Plantillas**: Formatos reutilizables vinculados a un proceso específico.

## Objetivos del MVP
1. **Editor Drag & Drop**: Permitir la creación de formatos altamente personalizables (tablas, imágenes, campos de firma).
2. **Firma Electrónica y Digital**: Implementar validación por OTP (voluntad de firma) y trazabilidad mediante hashes criptográficos.
3. **Comprobante de Auditoría**: Generación automática de un certificado de evidencias con un QR de validación.
4. **Enlace Evolutivo**: Un único token que sirve para firmar y, posteriormente, para consultar la auditoría del documento.