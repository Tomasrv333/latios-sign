# 🎨 Especificaciones UI/UX: Latios Sign Engine

> **Referencia Visual:** Este sistema de diseño se basa en la estética "Clean & Soft Corporate" observada en la referencia visual (Mediso Dashboard). Buscamos una interfaz moderna, limpia, con componentes claramente definidos por tarjetas, sombras suaves y una paleta de colores profesional pero amigable.

## 1. Filosofía de Diseño
* **Claridad ante todo:** La información crítica (estado del documento, acciones requeridas) debe ser inmediatamente obvia. El "ruido visual" se reduce al mínimo.
* **Suavidad Empresarial:** Usamos bordes redondeados y sombras muy difusas para evitar una apariencia corporativa rígida o anticuada. La interfaz debe sentirse "cómoda" de usar.
* **Jerarquía por Profundidad:** Usamos el sistema de tarjetas y elevación (sombras) para agrupar información. El fondo es el nivel más bajo, las tarjetas el nivel medio, y los modales/dropdowns el nivel más alto.
* **Consistencia:** Todos los componentes (botones, inputs, tarjetas) deben seguir las mismas reglas de radio de borde, padding y tipografía definidas aquí.

---

## 2. Design Tokens (Los Átomos)

### 2.1. Paleta de Colores
Usaremos variables CSS (o utilidades de Tailwind personalizadas) para mantener la consistencia.

**Colores Primarios (Marca & Acción)**
Basado en el verde suave de la referencia, pero adaptable a la marca Latios.
* `Brand-500` (Principal): `#00B074` (Aproximación al verde de referencia. Usado en botones primarios, estados activos del sidebar, iconos clave).
* `Brand-600` (Hover): Un tono ligeramente más oscuro para interacciones hover.
* `Brand-100` (Tint/Fondo): Una versión muy clara con baja opacidad para fondos de elementos activos o alertas suaves.

**Neutros (Fondos & Textos)**
* `Bg-Main`: `#F8F9FA` (Gris muy claro para el fondo general de la aplicación, detrás de las tarjetas).
* `Bg-Surface`: `#FFFFFF` (Blanco puro para el fondo de tarjetas, modales y el sidebar).
* `Text-Primary`: `#2D3748` (Gris carbón oscuro para títulos y datos importantes. Evitar negro puro `#000000`).
* `Text-Secondary`: `#718096` (Gris medio para subtítulos, etiquetas de inputs y texto de cuerpo secundario).
* `Border-Light`: `#E2E8F0` (Gris muy sutil para bordes de tarjetas e inputs inactivos).

**Semánticos (Estados)**
* `Success`: Verde (similar al Brand-500).
* `Warning`: Amarillo/Naranja suave (para estados "Pendiente").
* `Error`: Rojo suave (para estados "Rechazado" o errores de validación).

### 2.2. Tipografía
Utilizar una tipografía Sans-serif moderna, limpia y altamente legible (ej: **Inter**, Roboto, o similar).

**Pesos:**
* `Regular (400)`: Texto de cuerpo, etiquetas.
* `Medium (500)`: Botones, navegación, subtítulos destacados.
* `SemiBold (600)`: Títulos de página (H1), títulos de tarjetas (H2).

**Escala (Referencia Tailwind):**
* `text-xs`: Etiquetas pequeñas, metadatos secundarios.
* `text-sm`: Cuerpo de texto estándar, inputs.
* `text-base`: Títulos de tarjetas, botones estándar.
* `text-lg / text-xl`: Títulos principales de sección.
* `text-2xl`: Títulos de página o contadores numéricos grandes (como en el dashboard de referencia).

### 2.3. Sombras y Profundidad (Elevation)
Las sombras son cruciales para la estética "suave". Deben ser difusas, de color gris azulado, y nunca negras duras.

* **Nivel 0 (Plano):** Fondo general.
* **Nivel 1 (Surface/Card):** Sombra muy sutil para separar las tarjetas del fondo.
    * *Ejemplo Tailwind:* `shadow-sm` o una personalizada `box-shadow: 0 2px 4px rgba(0,0,0,0.05)`.
* **Nivel 2 (Dropdown/Hover):** Sombra media para elementos interactivos o al pasar el mouse sobre una tarjeta.
    * *Ejemplo Tailwind:* `shadow`.
* **Nivel 3 (Modal/Floating):** Sombra más pronunciada y difusa para elementos que flotan sobre todo lo demás (modales, alertas).
    * *Ejemplo Tailwind:* `shadow-lg`.

### 2.4. Bordes y Radios
* **Radio de Borde (Border Radius):** Esencial para la estética amigable.
    * `rounded-lg` (aprox 8px-12px): El estándar para Tarjetas, Inputs de formulario y el contenedor principal del Sidebar.
    * `rounded-full`: Para botones primarios, etiquetas de estado (badges) y avatares de usuario.
* **Grosor de Borde:**
    * Los bordes deben ser delgados (`1px`) y sutiles (`Border-Light`) cuando no están activos.

### 2.5. Espaciado (Spacing)
Usar una escala basada en un grid de 4pt u 8pt.
* **Paddings Internos (Tarjetas):** Generosos para dejar respirar el contenido. Mínimo `p-4` o `p-6` en Tailwind para contenedores principales.
* **Gap entre Elementos:** Separación clara entre tarjetas y secciones del dashboard para evitar el abarrotamiento.

---

## 3. Guía de Componentes (Moléculas)

### 3.1. Layout General y Sidebar
* **Sidebar:** Fondo blanco (`Bg-Surface`). El ítem activo debe tener un fondo tintado (`Brand-100`) y el texto/icono en color primario (`Brand-500`). Los ítems inactivos en `Text-Secondary`.
* **Área de Contenido:** Fondo gris claro (`Bg-Main`). Los módulos de contenido son siempre tarjetas blancas.

### 3.2. Tarjetas (Cards)
* El bloque de construcción fundamental (como se ve en "Patient List", "Diagnosis Breakdown").
* **Estilo:** Fondo `Bg-Surface`, radio `rounded-lg`, sombra Nivel 1.
* **Estructura:** Debe tener un título claro (`Text-Primary`, weight 600) y un padding interno consistente.

### 3.3. Botones
* **Botón Primario:** Fondo `Brand-500`, texto blanco, `rounded-full`. Sombra muy sutil al hover.
* **Botón Secundario/Outline:** Fondo transparente, borde delgado `Brand-500` (o gris), texto `Brand-500` (o gris).
* **Botón de Icono:** Solo icono, color `Text-Secondary`, cambia a `Brand-500` o un fondo gris claro al hover.

### 3.4. Inputs y Formularios
* **Estado Normal:** Fondo gris muy claro (`Bg-Main` o un tono más claro), borde sutil (`Border-Light`), `rounded-lg`, texto `text-sm`.
* **Estado Focus:** El borde cambia al color `Brand-500` y se añade un "ring" (anillo) de sombra sutil del color de la marca para indicar foco claramente pero con suavidad.

---

## 4. Especificaciones para Funcionalidades Latios

### 4.1. Editor de Plantillas (Drag & Drop)
Esta área requiere un tratamiento especial para diferenciar el "lienzo" de la interfaz.

* **El Lienzo (Canvas):** Debe tener un fondo visualmente distinto al de las tarjetas estándar, quizás un gris ligeramente más oscuro que el `Bg-Main` o una textura de cuadrícula muy sutil para indicar que es un área de edición.
* **Elementos Arrastrables (Draggables):**
    * **En reposo:** Parecen componentes de UI normales dentro de una barra lateral.
    * **Al arrastrar (On Drag):** Deben elevarse (Sombra Nivel 3), aumentar ligeramente su opacidad o escala, y el cursor debe cambiar a "grabbing".
* **Zonas de Soltar (Dropzones):** Cuando un elemento se arrastra sobre una zona válida, esta debe resaltarse claramente con un borde discontinuo del color `Brand-500` y un fondo tintado muy suave.

### 4.2. Vista de Firma (El Enlace Evolutivo)
Esta vista debe ser la más limpia de todas, sin el sidebar de navegación principal para enfocar al usuario en la tarea.

* **Centrado:** El documento debe ser el protagonista, presentado dentro de una tarjeta grande y limpia centrada en la pantalla.
* **Acciones Claras:** Los botones de "Firmar" o "Validar OTP" deben ser grandes, primarios (`Brand-500`) y estar ubicados en una posición prominente (ej: barra inferior fija o cabecera).
* **Vista de Auditoría (Post-firma):** Mantiene la misma estructura limpia, pero el footer del documento ahora muestra el QR y los hashes, y los botones de acción cambian a "Descargar PDF" y "Ver Detalles de Trazabilidad".