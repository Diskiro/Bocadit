# Bocadit Mini Donas - Sistema de Diseño (DESIGN.md)

Documentación del sistema de diseño visual, composición y arquitectura de componentes de **Bocadit Mini Donas**, basado en la referencia de marca de repostería artesanal y las especificaciones exactas del catálogo original.

---

## 1. Identidad Visual y Paleta de Colores

- **Fondo General (Crema Cálido):** `#FFF8EC` (`--bg-cream`)
- **Superficies de Tarjeta:** `#FFFFFF` (`--bg-white`) con fondos interiores en `#FFFDF9`
- **Texto y Botones Principales (Chocolate Oscuro):** `#4A150D` (`--color-chocolate`)
  - Hover / Estados oscuros: `#350D06` (`--color-chocolate-dark`)
  - Texto secundario y descripciones: `#8E6D64` (`--color-chocolate-muted`)
  - Metadatos y placeholder: `#B39990` (`--color-chocolate-dim`)
- **Detalles y Acentos (Rosa Dulce):**
  - Franja superior de anuncio: `#FFDEE6` (`--color-pink-soft`)
  - Acentos y sprinkles: `#FF86A4` (`--color-pink-accent`)
  - Insignia "Favoritas": `#FF6584` (`--color-pink-badge`)
- **Bordes Finos (Beige Suave):** `#E8CDB0` (`--border-beige`) y `#F3E5D8` (`--border-beige-light`)

---

## 2. Tipografía y Jerarquía

- **Títulos y Encabezados:** `'Fraunces', serif` (Google Fonts). Tipografía serif gruesa, redonda y cálida, de alta personalidad artesanal.
  - Hero Display: `52px` (peso 800), `line-height: 1.06`.
  - Títulos de Sección: `30px` - `32px` (peso 800).
  - Nombre de Producto: `18.5px` (peso 700).
- **Lectura, Navegación y UI:** `'Plus Jakarta Sans', sans-serif` (Google Fonts).
  - Cuerpos de texto: `15px` - `17px`.
  - Selector de porciones y botones: `11px` - `14.5px` (pesos 500, 600 y 700).

---

## 3. Composición y Estructura

1. **Encabezado Compacto Sticky:**
   - Barra superior fija en el scroll (`position: sticky; top: 0; z-index: 100`).
   - Logotipo Bocadit ampliado y nítido (`56px` en escritorio, `48px` en móvil) conservando proporciones.
   - Botón *"Hacer pedido →"* equilibrado a la derecha.
   - **Franja rosa no fija:** Se ubica fuera del encabezado y se desplaza de forma natural con el contenido, evitando robar espacio de lectura.
   - Margen de desplazamiento (`scroll-margin-top: 85px`) para que el encabezado nunca tape los títulos al navegar por anclas.

2. **Sección Principal (Hero):**
   - **Escritorio:** Diseño de dos columnas. Izquierda: Título y texto de bienvenida. Derecha: Vaso protagonista completo.
   - **Móvil:** La imagen protagonista se coloca arriba mostrando el vaso completo (`aspect-ratio: 480 / 211; object-fit: contain`) y el texto se ubica debajo.

3. **Catálogo y Controles:**
   - Título *"Nuestro menú"* con motivo floral/chispas rosa.
   - Buscador redondeado con texto *"Buscar un sabor…"*.
   - Filtros de categoría: *"Mini donas"* (activo por defecto con fondo chocolate y texto crema), *"Snacks"* y *"Crepas"*.

4. **Tarjetas de Producto Unificadas (Agrupación por Sabor):**
   - Altura de contenedor de imagen unificada (`200px` en escritorio, `220px` en móvil).
   - Ajuste `object-fit: contain` con imágenes en alta resolución cuadrada (1184×1184) sin sufijo de recorte, garantizando que el vaso se vea íntegro desde la tapa hasta la base.
   - Selector de presentaciones (8 y 16 piezas) con estado activo claramente delimitado (`#FFF4E5` con borde chocolate).
   - Botón *"Elegir →"* de altura y posición uniforme (`height: 40px; margin-top: auto`).

5. **Flujo de Pedido y Contacto:**
   - Botón flotante de carrito con contador de artículos y monto acumulado.
   - Drawer lateral de pedido (*Order Drawer*) con desglose de productos y total en tiempo real.
   - **Destino Oficial de WhatsApp:** `+52 56 1538 1502` (`https://wa.me/525615381502`), enviando el mensaje formateado con los sabores, porciones y monto total.

6. **Catálogo Fiel (26 Items Originales Exactos):**
   - 10 Sabores de Mini Donas (20 items en 8 y 16 piezas): Chocolate, Lechera, Azúcar y canela, Moka, Fresa, Chocolate blanco y coco, Café, Sabor Mazapán, Nutella, Chai.
   - 2 Snacks (4 items originales): Papa Gajo 200g y 10 Nuggets de Pollo.
   - 2 Crepas (2 items originales): Crepa de Nutella y Crepa de Queso y Jamón.
