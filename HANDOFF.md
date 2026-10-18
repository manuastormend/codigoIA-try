# HANDOFF — Código IA (sitio web del programa)

## 1. Contexto
Sitio estilo blog/catálogo en español rioplatense (voseo) para el programa de streaming **Código IA** (FIC – Udelar, sobre inteligencia artificial). Vive en la carpeta del usuario `C:\Users\Usuario\Desktop\codigoIA-2`. Stack: React 18 + Vite 6 + Tailwind 3.4 + framer-motion, router casero (sin react-router), sin backend. El detalle completo está en `CODIGO-IA-SPEC.md` (actualizado hoy, 17/10/2026).

## 2. Objetivo actual
**La estructura de la página está terminada. El foco ahora es modificar el diseño visual** (colores, tipografía, espaciados, motivos, jerarquía, animaciones) de lo que ya existe, sin cambiar contenido ni arquitectura. **Ya no se trata de copiar más piezas de las referencias** (artifact de Design, `codigoia.vercel.app`, HTMLs de WhatsApp): solo usarlas como inspiración visual si el usuario lo pide.

## 3. Estado
Funcionando (sin compilar por mi parte; el usuario compila y prueba):
- **Home:** intro animada → header fijo con `SearchBar` + `Nav` → `SeasonCarousel` → `ThemeSection` (mapa de nodos) → `AditionalSection` (última temporada) → `AllSection` (acordeón por temporada) → `AboutSection` (acordeón) → `ContactForm` → `Footer`.
- **`/programa/:id`:** título arriba; video grande + resumen + desplegables a la izquierda; invitados a la derecha (iniciales, abren el modal `PersonasPage`).
- **`/temas/:id`:** título, citas destacadas (`CitaCard`) con botón "Reproducir" que abre `VideoFlotante` en el minuto de la cita, y lista de programas.
- **Menú:** panel chico a la derecha; al pasar el cursor hace scroll suave a cada sección.
- Datos normalizados: programas (16), temporadas (4), temas (22), programa_tema (41), personas (28), participacion, recursos, citas (16), proyecto, mapa.

## 4. Decisiones tomadas
- Todo el JS de lógica vive en **`src/servicios/`** (router, programas, temas, mapa, personas, citas, buscar, texto, youtube). `src/utils/` quedó solo con `Logos/` y `Tipografías/`.
- En la ficha, los invitados siempre con iniciales; la foto solo aparece en el modal.
- Ficha sin "Dónde verlo", sin "Más Código.IA", sin biografías (van en el modal) y sin botón "Volver".
- `ThemeSection` sin la lista "Todos los nodos": el mapa se ve solo en pantallas `lg`+.
- `AditionalSection` lee texto de `temporadas.json` / `programas.json` (no hardcodeado).
- Interpretación de "las tabs" de `AditionalSection`: las cards con miniatura naranja; hoy son tarjetas con número de color, pregunta, resumen y link a la ficha.

## 5. Trabajo realizado (esta sesión)
Limpieza de código y migración a los 8 JSON nuevos; mapa de nodos replicado de `codigoia.vercel.app/temas`; `ThemePage`; buscador del header; favicon oscuro sobre transparente; citas + video flotante; acordeón "Sobre el proyecto"; `AllSection` como explorador de temporadas; ficha de programa rediseñada; modal `PersonasPage` translúcido; menú tipo panel con scroll al hover; renombre de `TEMPORADAS`; carpeta `servicios/`; spec reescrito.

## 6. Pendientes
2. Acceso a temas en móvil: el mapa se oculta por debajo de `lg` y no hay alternativa.
3. Temas `cine`, `videojuegos`, `publicidad` sin nodo en el mapa (no se llega a Diego Parker ni Álvaro Moré desde el mapa).
4. Revisar asignaciones programa→tema en `programa_tema.json` (criterio provisorio en Música/Amor).
8. Formulario de contacto sin envío real (TODO en `ContactForm.jsx`).
9. Instagram ya no se linkea desde la ficha (se quitó "Dónde verlo").
10. Hosting: falta rewrite a `index.html` (Vercel) para entrar directo a `/programa/...` y `/temas/...`.

## 7. Restricciones
- No cambiar estructura, rutas ni datos: solo diseño visual.
- Mantener lo dinámico: nada de textos o ids de temporada hardcodeados si salen de los JSON.
- Paleta: azul `#2400FF`, naranja `#FF6B3B`, lima `#C4FD36`, lila `#C172FF`, noche `#1A1A30`, gris `#FAFAFA`; sin colores muy resaltados, coherentes con el resto.
- Español rioplatense.


## 9. Próximo paso recomendado
Pedir al usuario que compile (`npm run dev`) y revise lo último (imports tras mover a `servicios/`, menú con scroll al hover, ficha, modal). Luego **preguntarle qué parte del diseño quiere cambiar primero** (Home, ficha, página de tema, menú, etc.) y qué dirección busca (más color, más aire, otra tipografía…), y trabajar sección por sección tocando solo clases/estilos, sin modificar estructura, datos ni rutas.

## 10. Archivos y fuentes relevantes
- Proyecto: `C:\Users\Usuario\Desktop\codigoIA-2` · spec: `CODIGO-IA-SPEC.md`.
- Datos: `src/data/*.json` · lógica: `src/servicios/*.js` · estilos/tokens: `tailwind.config.js`, `src/index.css`.
- Componentes clave: `src/components/{general,temas,program,personas,adicional,utils}`.
- Referencias de diseño (solo inspiración visual, ya no se copia contenido): artifact `claude.ai/artifact/61389a49-3e7f-4959-a389-1b04bbfc5f4c` (archivos `project/TemporadasDesktop.dc.html`, `Desktop.dc.html`, `ProgramaDosDesktop.dc.html`, `SobreDesktop.dc.html`), `codigoia.vercel.app`, y los HTML locales de WhatsApp "Boceto del sitio" / "Boceto con Citas destacadas y Mapa de temas" (aún sin leer).
