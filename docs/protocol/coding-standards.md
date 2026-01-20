# 💻 Estándares de Codificación

## General
* **TypeScript Estricto**: Prohibido el uso de `any`. Definir interfaces o tipos para cada objeto.
* **Clean Code**: Aplicar principios SOLID. Funciones pequeñas con una única responsabilidad.

## Backend (NestJS)
* **DTOs**: Uso obligatorio de Data Transfer Objects para la validación de entrada.
* **Dependency Injection**: No instanciar clases manualmente; usar el contenedor de NestJS.
* **Aislamiento Tenant**: Todo servicio que consulte la DB debe recibir y aplicar el `company_id`.

## Frontend (Next.js)
* **Componentes Funcionales**: Uso exclusivo de Hooks.
* **Atomic Design**: Organizar componentes en átomos, moléculas y organismos en `packages/ui`.
* **Rendimiento**: Evitar re-renders innecesarios en el editor Drag & Drop usando `useMemo` y `useCallback`.