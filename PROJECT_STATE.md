# PROJECT_STATE — Rediseño visual Código IA

_Actualizado: 18/10/2026 (Montevideo). Rama de producción: `diseno/rendimiento` (commit `9f0e7f0`)._

**PROYECTO:** Rediseño visual del sitio de Código IA (FIC, Udelar), grupo Web 1. La estructura, las rutas y los datos ya estaban terminados: solo se toca lo visual y la interacción. Repo de trabajo: fork `gabrieldelfiino-oss/codigoIA-design` (remote `origin`). El repo de Manuela (`manuastormend/codigoIA-try`) es el original y todavía **no tiene estos cambios**.

**OBJETIVO:** Sitio estético, fresco y divertido, limpio y prolijo ("no un montón"), fiel al manual de marca, accesible para personas no videntes y fluido en celular.

**ESTADO:** En producción, público y sin login: **https://codigoia-design.vercel.app/** (rama `diseno/rendimiento`, commit `9f0e7f0`). Es la única versión vigente. La rama tiene todo el trabajo anterior más la optimización de rendimiento. Frente al `main` del repo de Manuela está **33 commits adelantada y 0 atrasada** (45 archivos): un pull request entraría sin conflictos (verificado con la API de GitHub el 18/10/2026).

**COMPLETADO (confirmado, probado en el navegador de prueba, build OK):**
- Pasos 1–4: sistema visual limpio, transiciones entre secciones, logo con aro naranja, mapa de temas de vidrio y neón (temas en violeta, conexiones rectas, fondo tipo universo).
- Mapa en PC: modo inmersivo (la sección se oscurece, aura, chispas, ondas). Mapa en celular: versión vertical propia, pantalla completa en cristal que entra entera en la pantalla visible, lista de temas desplegable. Conexión Educación–Chatbots en el aprendizaje agregada.
- Cabecera: buscador como lupa, slogan que sale del título centrado del hero y viaja al header, logo vuelve al inicio.
- Hero: slogan centrado y más grande (como en el repo de Manuela). Intro del logo más lenta (2,2 s de viaje) y **sincronizada**: la home aparece recién cuando el logo llega, y el fondo de la intro se desvanece durante el viaje.
- Textos en tono rioplatense, formulario con preguntas como etiquetas, copyright 2026, escala más liviana, texturas de puntos y cuadrícula, Contacto lila y desplegable, temporadas como acordeón exclusivo, banners de celular sin recorte con gesto de deslizar.
- Carrusel: las flechas y la pausa ya no se ven, pero siguen disponibles para teclado y lector de pantalla (aparecen con Tab). Los puntitos siguen visibles.
- Subpáginas: conexiones del mapa en cada tema, texturas, isotipo con hover, chips violeta, pie de página.
- Accesibilidad: "re perdido" legible para lectores, título de página + foco al `h1` + anuncio por ruta, `h1` en la home, "Saltar al contenido", buscador combobox, modal del mapa con foco atrapado, lista del mapa en PC, enlaces externos avisados, contraste subido, "reducir movimiento" respetado en todo el sitio.
- Rendimiento: tipografías de 1,6 MB a ~0,3 MB (WOFF2 subset latino) y precarga; latido y giro del isotipo en CSS puro; sin `backdrop-filter` ni filtros SVG en los nodos del mapa; fondos del hero con degradés en vez de blur; pulsos del mapa solo con el mapa a la vista; scroll por cuadro; páginas internas y mapas con carga diferida (JS de 454 a 411 KB); la home se arma oculta durante la intro.

**EN CURSO:** nada abierto.

**PENDIENTE (equipo de diseño / código):**
- Panel del menú hamburguesa: la versión unida al botón y translúcida no gustó; falta una propuesta nueva.
- Reducir más el JS (framer-motion es lo más pesado que queda) y achicar las miniaturas de YouTube en celular.
- Probar con lector de pantalla real (NVDA, VoiceOver) y en celulares físicos; sumar `eslint-plugin-jsx-a11y` y axe.
- Código sin uso: `PENULTIMA`, `ControlesReproduccion.jsx`.

**FALTA HACER COMO GRUPO (decisiones y trabajo de contenido, no solo de código):**
1. **Integrar los cambios al repo de Manuela:** abrir el pull request desde el fork y que ella lo acepte (pasos en `HANDOFF-REDISENO.md`). Después, **ella debe redesplegar su propio proyecto de Vercel**: aceptar el PR no actualiza su sitio publicado.
2. **Decidir dónde vive la producción oficial:** hoy `codigoia-design.vercel.app` pertenece a la cuenta de Gabi. Acordar si el sitio final sale de ahí o del Vercel de Manuela, y quién administra el dominio.
3. **Decidir** si se saca la conexión Infancia–Chatbots en el aprendizaje (está en el sitio, no en el boceto de referencia) y revisar las asignaciones de programa a tema en `programa_tema.json` (Educación muestra "0 programas").
4. **Contenido real:** reemplazar las citas con lorem de `citas.json`; corregir el "+20 programas" fijo (hay 16); completar bios, fechas y datos de episodios; confirmar datos inferidos (año de T2 y similares); definir los temas que no tienen nodo (cine, videojuegos, publicidad).
5. **Formulario de contacto:** elegir el servicio de envío (EmailJS, Formspree o backend propio); hoy solo es interfaz.
6. **Transcripciones y subtítulos** revisados de los videos (los producen quienes graban; es parte de la accesibilidad).
7. **Revisión conjunta:** que cada integrante mire el sitio en su celular y en su compu, y anote lo que se vea mal; probar con un lector de pantalla entre todos.
8. **Cerrar el PR #1 viejo** (neo-brutalismo) del fork a mano y limpiar ramas que ya no se usen (`diseno/header-interactivo`, `diseno/mapa-3d`, `diseno/transiciones`, `diseno/limpio-fresco`, etc.).
9. **Definir cómo se publica de ahora en más:** conectar la rama de producción a Vercel para que `git push` despliegue solo, o seguir desplegando a mano.
10. **Sitio Astro paralelo** (otra línea, `codigo-ia-v3`): decidir si sigue, si se unifica con este o se descarta; sus pendientes están en el handoff.

**DECISIONES:**
- Trabajar en el fork; ir por partes. Solo diseño visual y de interacción.
- Paleta: azul `#2400FF`, naranja `#FF6B3B`, lima `#C4FD36`, lila `#C172FF`, noche `#1A1A30`, gris `#FAFAFA`. Tipos: Diagramm (títulos), IBM Plex Sans (cuerpo), IBM Plex Mono (etiquetas `/`), serif itálica para citas.
- Temas en violeta, resaltado en lima neón, conexiones del mapa siempre rectas. Texturas suaves, nunca sobrecargadas. Voseo y jerga rioplatense cercana pero entendible.
- La accesibilidad pesa más que la interacción: el menú abre por clic/Enter (hover como extra) y no hace scroll al pasar el cursor. Los controles del carrusel se ocultan visualmente pero siguen accesibles.
- Rendimiento sin perder diseño: se quitan filtros y blur caros reemplazándolos por equivalentes baratos; las animaciones infinitas van en CSS.
- La intro se sincroniza con el logo: la home no aparece hasta que el logo llega.
- Producción se despliega manualmente con `create_deployment` (target production); hoy desde `diseno/rendimiento`.
- En PC el modo inmersivo oscurece la sección del mapa, no toda la página.

**DECISIONES DESCARTADAS:**
- Neo-brutalismo con halftone (PR #1): "da trucho", cargado y cuadrado. No volver a proponerlo.
- Dar acceso o pushear al repo de la compañera.
- Esferas opacas en el mapa; conexiones curvas que cuelgan; panel de hamburguesa unido y translúcido (queda pendiente repensarlo).
- "← Pa'l inicio" y "Conocelo/a →" (se usó "← Volver a casa" y "Conocé su perfil →").
- Oscurecer toda la página en PC al interactuar con el mapa (complica el orden de capas y los bordes curvos).
- Pausar el carrusel solo con hover o foco: no cumple WCAG 2.2.2; se mantiene un botón de pausa (oculto, accesible).

**RESTRICCIONES:**
- No pushear a `upstream`. Español rioplatense en la interfaz.
- Respetar `prefers-reduced-motion`; mantener los links a `/temas/:id` y los datos de `mapa.json`.
- Vercel: proyecto `prj_r08sECYGJbG0saUD5aDlSHHFdzen` (scope `casita3`). Cada push puede generar un preview con URL nueva e inmutable (a veces hay que crearlo a mano); solo el dominio de producción es estable y público.
- `gh pr create/close` puede estar bloqueado; usar el navegador.
- Desarrollo: `npm run dev` (puerto 5173). Antes de commitear: `npm run build`.

**RIESGOS:**
- La producción no se actualiza sola con `git push`.
- Hay varias ramas con historiales cercanos; los arreglos entre ramas se portan con cherry-pick y pueden dar conflictos.
- Nada se probó con lector de pantalla real ni en un celular físico; el navegador de prueba frena animaciones, así que la fluidez real (cuadros por segundo) y la sincronía de la intro solo se pueden juzgar en un dispositivo.
- Producción está en el Vercel de Gabi, no en el de Manuela.

**SUPUESTOS:**
- Gabi quiere el aro naranja del logo también en subpáginas (no confirmado).
- El año de T2 y los datos de episodios vienen del sitio original y no se verificaron.

**FUENTES / ARCHIVOS CLAVE:**
- `HANDOFF-REDISENO.md` (traspaso al grupo), `HANDOFF.md` y `CODIGO-IA-SPEC.md` (estructura y datos), `tailwind.config.js`, `src/index.css` (variables, texturas `.tx*`, vidrio `.mapa-vidrio`, animaciones, intro, `.boton-oculto`).
- Mapa: `src/components/temas/{ThemeMap,ThemeMapMovil,ThemeSection,ThemePage}.jsx`; datos en `src/data/mapa.json`, `src/servicios/mapa.js`.
- Intro y portada: `src/components/general/{IntroHeader,Nav,SearchBar,Carousel,AllSection,ContactForm,Footer}.jsx`, `src/components/utils/{BrandTitle,Heartbeat,Spin,Orbes,PageHeader}.jsx`, `src/App.jsx`, `src/main.jsx`, `src/servicios/medios.js`.
- Textos de formulario y copyright: `src/data/proyecto.json`. Tipografías WOFF2: `src/assets/fonts/*.woff2`.
- Referencia visual del mapa: artefacto `claude.ai/artifact/QPh6W9x5jJ3MhLy17DMoBx`.
- Investigación de accesibilidad: informe con fuentes W3C (WCAG 2.2, guía de patrones ARIA), WebAIM, MDN, Adrian Roselli (resumen en el chat de la sesión).
- Sitio paralelo (Astro): repo `gabrieldelfiino-oss/codigo-ia-v3` (privado), https://codigo-ia-v3.vercel.app/.

**CAMBIOS RECIENTES (18/10/2026):** optimización de rendimiento; intro sincronizada con el viaje del logo (2,2 s); slogan del hero centrado y más grande; viaje del slogan al header por tiempo (continuo); controles del carrusel ocultos pero accesibles; producción movida a `diseno/rendimiento`; comprobado que la rama entra al repo de Manuela sin conflictos.

**PRÓXIMO PASO:** Abrir el pull request hacia el repo de Manuela, que ella lo acepte y redesplegue; en paralelo, revisar el sitio en celulares reales y repartir las tareas de la lista "Falta hacer como grupo".
