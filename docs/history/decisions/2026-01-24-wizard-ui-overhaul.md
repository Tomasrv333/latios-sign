# Registro de Decisiones de Diseño y UI: Document Sending Wizard & Editor
**Fecha:** 24 de Enero, 2026
**Autor:** Antigravity (IA Assistant)

## 1. Contexto
El objetivo fue mejorar la experiencia de usuario (UX) en el flujo de envío de documentos ("Wizard") y en el editor de plantillas. Se buscaba una interfaz más limpia, moderna y funcional, eliminando redundancias y asegurando la consistencia visual.

## 2. Decisiones Clave

### A. Navegación del Wizard
*   **Problema:** La navegación dependía de botones de texto explícitos ("← Volver a...") que ensuciaban la interfaz y duplicaban la funcionalidad del stepper.
*   **Decisión:** Se eliminaron todos los enlaces de texto de "Volver" dentro del cuerpo de los pasos.
*   **Implementación:**
    *   Se potenciaron los **Steps Superiores** como indicadores de progreso interactivos.
    *   Se añadieron **Flechas Laterales (< >)** flanqueando el stepper.
        *   *Izquierda (<):* Regresa al paso anterior (oculta en el paso 1).
        *   *Derecha (>):* Avanza al siguiente paso (habilitada solo si la validación del paso actual pasa).
*   **Resultado:** Una cabecera de navegación compacta y autocontenida que libera espacio en el área de contenido principal.

### B. Diseño de Tarjetas (Cards)
*   **Problema:** Las tarjetas de selección de Equipo y Plantilla tenían estilos inconsistentes, bordes gruesos y efectos de escala ("zoom") al pasar el mouse que se sentían anticuados o "fastidiosos".
*   **Decisión:** Estandarizar visualmente todas las tarjetas con el estilo del formulario final (`RecipientForm`).
*   **Reglas de Estilo:**
    *   **Bordes:** `border-gray-200` (sutil) en estado normal.
    *   **Selección:** `ring-1 ring-brand-500` con fondo `bg-brand-50` muy tenue.
    *   **Tipografía:** Títulos en `text-gray-900` font-semibold; descripciones en `text-gray-500` text-xs/sm.
    *   **Interacción:** Eliminar `transform scale-105`. Mantener solo cambios de color y sombra suave (`hover:shadow-md`).
    *   **Iconografía:** Usar iconos de `lucide-react` (Building2, FileText) con fondos de color pastel para diferenciar entidades.

### C. Editor de Plantillas: Asignación de Equipos
*   **Problema:** No existía forma de cambiar el equipo propietario (`processId`) de una plantilla desde el editor.
*   **Decisión:** Integrar un selector de equipos directamente en la barra de herramientas del editor.
*   **Implementación:**
    *   Componente `TeamDropdown` en `EditorToolbar`.
    *   Ubicación: Izquierda de los selectores de firma.
    *   Lógica:
        *   **Admins:** Seleccionan cualquier proceso.
        *   **Leaders:** Solo seleccionan sus procesos asignados.
        *   **Persistencia:** El `processId` se guarda y carga desde el backend junto con la estructura de la plantilla.

### D. Animaciones
*   **Problema:** Las animaciones de entrada (`animate-in fade-in slide-in`) resultaban repetitivas y molestas ("fastidiosas") en pasos frecuentes como la selección de equipo.
*   **Decisión:** Eliminar animaciones de entrada en componentes de selección de alto tráfico (`TeamSelector`). Mantener transiciones suaves (`transition-colors`) solo para estados de hover/focus.

## 3. Estado Actual
El sistema ahora cuenta con un flujo de creación coherente donde:
1.  El usuario selecciona Equipo -> Plantilla -> Destinatario sin distracciones.
2.  El editor permite una gestión contextual completa (diseño + asignación de propiedad).
3.  La interfaz comparte un lenguaje visual unificado (bordes, sombras, colores) basado en el sistema de diseño "Latios".
