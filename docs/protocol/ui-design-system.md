# Sistema de Diseño UI: Reglas y Estándares
**Última actualización:** 24/01/2026

Este documento define los estándares visuales y de interacción para la plataforma Latios Sign, asegurando consistencia entre módulos.

## 1. Navegación en Wizards ("Pasos")
Para flujos de múltiples pasos (como "Nuevo Envío"):
*   **Stepper Principal:** Debe ser la fuente de verdad de la navegación.
*   **Sin Botones Redundantes:** No colocar botones de texto ("Volver", "Atrás") dentro del área de contenido si existe un stepper navegable.
*   **Flechas de Apoyo:** Se permite el uso de flechas (`ChevronLeft`, `ChevronRight`) flanqueando el stepper para mejorar la accesibilidad y claridad del flujo secuencial.
*   **Validación de Avance:** La navegación hacia adelante debe restringirse (disabled) hasta que se cumpla la condición del paso actual.

## 2. Tarjetas de Selección (Selectable Cards)
Utilizadas para elegir opciones (Equipos, Plantillas, Tipos).
*   **Estructura Base:**
    ```tsx
    className="rounded-xl border border-gray-200 bg-white p-4 transition-all cursor-pointer"
    ```
*   **Estado Hover:**
    *   Sombra suave: `hover:shadow-md`
    *   Borde ligeramente más oscuro: `hover:border-gray-300`
    *   **PROHIBIDO:** Usar `scale-*` (zoom) para efectos de hover en elementos de grid. Causa distracción visual.
*   **Estado Seleccionado (Active):**
    *   Borde de color primario: `border-brand-500` + `ring-1 ring-brand-500`
    *   Fondo tenue: `bg-brand-50` (u opacidad baja `bg-brand-50/50`)
    *   Indicador: Icono `CheckCircle2` o similar en la esquina superior derecha o alineado al icono principal.

## 3. Animaciones
*   **Transiciones de Estado:** Usar `transition-all duration-200` o `duration-300` para cambios de color, borde y opacidad.
*   **Entradas (Mount):** 
    *   Usar con precaución. Prefabricar animaciones CSS (`animate-in fade-in`) solo para modales o contenido que carga asíncronamente.
    *   **Evitar:** Animaciones de entrada en elementos que el usuario ve repetidamente en una misma sesión (ej: pasos de un wizard rápido), ya que generan fricción percibida.

## 4. Formularios y Inputs
*   **Inputs:** Bordes `gray-200`, Focus `ring-2 ring-brand-500`.
*   **Labels:** `text-xs font-semibold uppercase tracking-wide text-gray-700`.
*   **Botones Primarios:** `bg-brand-600 hover:bg-brand-700 text-white shadow-sm`.
*   **Botones Secundarios:** `bg-white border border-gray-300 text-gray-700 hover:bg-gray-50`.

## 5. Iconografía
*   Librería: `lucide-react`.
*   Tamaños estándar: `size={16}` (acciones pequeñas), `size={20}` (iconos estándar), `size={40}` (placeholders o headers de tarjetas).
*   Estilo: Trazos finos (`strokeWidth={2}` o default).

---
*Aplicar estas reglas en todos los nuevos componentes para mantener la integridad visual del dashboard.*
