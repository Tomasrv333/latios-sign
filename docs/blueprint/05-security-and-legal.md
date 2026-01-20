# 🛡️ Seguridad e Integridad Legal

## Criptografía e Integridad
* **Hashing**: Se utilizará el algoritmo $SHA-256$ para generar una huella digital única del documento al momento de la firma.
* **Validación de Integridad**: Cada acceso al portal de auditoría debe recalcular el hash del archivo en storage y compararlo con el valor en la base de datos. Si difieren, se debe emitir una alerta de "Documento Alterado".

## Inmutabilidad de Plantillas
* **Snapshotting**: Al emitir un documento, el sistema debe copiar el `JSON` de la estructura de la plantilla en el registro del documento. Las ediciones posteriores a la plantilla original NO deben afectar documentos que ya están en proceso de firma o firmados.

## Trazabilidad de Auditoría
Se debe registrar obligatoriamente en la tabla de eventos:
1. **Evento**: Tipo de acción (Apertura, Validación OTP, Firma, Descarga).
2. **Actor**: ID del usuario o datos del firmante (email/celular).
3. **Huella Técnica**: Dirección IP, User Agent del navegador y Timestamp sincronizado.
4. **Evidencia**: En el caso de OTP, el código enviado y el código ingresado.