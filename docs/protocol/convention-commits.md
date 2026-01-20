# 📝 Protocolo de Commits

El agente debe sugerir o realizar commits siguiendo el estándar de **Conventional Commits**. Esto es vital para la generación automática de changelogs y el mantenimiento del monorepo.

## Estructura
`<tipo>(<alcance>): <descripción>`

## Tipos Permitidos
* **feat**: Nueva funcionalidad (ej: `feat(api): add otp generation service`).
* **fix**: Corrección de un error (ej: `fix(web): layout shift in dnd editor`).
* **docs**: Cambios en la documentación.
* **style**: Cambios estéticos que no afectan la lógica (formatos de código).
* **refactor**: Cambios en el código que no añaden funciones ni corrigen errores.
* **test**: Añadir o corregir pruebas (Jest/Cypress).
* **chore**: Actualización de dependencias o tareas de build.

## Reglas Adicionales
1. El mensaje debe estar en inglés o español (según prefiera el usuario), pero siempre consistente.
2. El alcance (`scope`) debe referirse a la aplicación o paquete afectado (`api`, `web`, `shared-types`).