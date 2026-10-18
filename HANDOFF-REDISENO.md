# HANDOFF — Rediseño visual de Código.IA

_Actualizado: 18/10/2026. Para el grupo Web 1 (FIC, Udelar)._

## 1. Contexto
Sitio de Código.IA (programa de streaming sobre inteligencia artificial, FIC – Udelar). Stack: React 18 + Vite 6 + Tailwind 3.4 + framer-motion, router casero (sin react-router), sin backend. La estructura, las rutas y los datos ya estaban terminados; este trabajo es **solo visual e interactivo**. Detalle de estructura y datos: `HANDOFF.md` y `CODIGO-IA-SPEC.md`. Estado vivo del proyecto: `PROJECT_STATE.md`.

## 2. Objetivo actual
Sitio fresco, divertido y prolijo, fiel a la identidad de marca, accesible para personas no videntes y fluido en celular. Está en producción; ahora toca **integrarlo al repo de Manuela y cerrar lo que falta entre todos**.

## 3. Estado
- **En producción (público, sin login): https://codigoia-design.vercel.app/**
- Rama de producción: `diseno/rendimiento` (commit `9f0e7f0`). Es la única versión vigente y contiene todo el trabajo anterior.
- Vive en el fork `gabrieldelfiino-oss/codigoIA-design` (de Gabi), en el Vercel de Gabi. El repo de Manuela (`manuastormend/codigoIA-try`) **todavía no tiene estos cambios**.
- Frente al `main` de Manuela, la rama está **33 commits adelantada y 0 atrasada** (45 archivos): el pull request entra sin conflictos.
- Los previews de las otras ramas piden login de Vercel.

## 4. Decisiones tomadas
- Paleta: azul `#2400FF`, naranja `#FF6B3B`, lima `#C4FD36`, lila `#C172FF`, noche `#1A1A30`, gris `#FAFAFA`. Tipos: Diagramm (títulos), IBM Plex Sans (cuerpo), IBM Plex Mono (etiquetas `/`), serif itálica para citas.
- Mapa de temas en vidrio y neón: temas en violeta, resaltado lima, conexiones rectas, fondo tipo universo.
- Texturas de puntos y cuadrícula suaves; textos en voseo rioplatense cercano.
- La accesibilidad pesa más que la interacción: el menú abre por clic/Enter y no hace scroll al pasar el cursor; los controles del carrusel están ocultos a la vista pero accesibles (aparecen con Tab).
- La intro está sincronizada: la home aparece recién cuando el logo llega al header.
- Rendimiento sin perder diseño: sin blur ni filtros caros, animaciones en CSS, tipografías livianas, carga diferida.
- Producción se despliega a mano (no con `git push`).

## 5. Trabajo realizado
- Sistema visual limpio, escala más liviana, texturas, transiciones entre secciones, logo con aro naranja.
- **Mapa:** PC con modo inmersivo; celular con versión vertical, pantalla completa en cristal que entra entera, y lista de temas desplegable. Conexión Educación–Chatbots en el aprendizaje agregada.
- **Cabecera e intro:** buscador-lupa, slogan centrado y más grande en el hero que viaja al header, logo que vuelve al inicio, intro del logo más lenta y sincronizada.
- **Home:** banners de celular sin recorte con gesto de deslizar, temporadas como acordeón exclusivo, Contacto lila y desplegable, copyright 2026.
- **Subpáginas:** cada tema muestra sus subtemas y con qué se cruza; texturas, chips violeta y pie de página.
- **Accesibilidad:** título y foco por página, `h1`, "Saltar al contenido", buscador combobox, modal con foco atrapado, lista del mapa en PC, formulario con etiquetas, "reducir movimiento" respetado, contraste subido.
- **Rendimiento:** tipografías de 1,6 MB a ~0,3 MB, animaciones en CSS, mapa sin filtros caros, home armada durante la intro, JS más liviano con carga diferida.

## 6. Pendientes

### Falta hacer como grupo
1. **Integrar al repo de Manuela:** abrir el PR desde el fork y que Manuela lo acepte (pasos abajo). Después **ella debe redesplegar su propio Vercel**: aceptar el PR no actualiza su sitio publicado.
2. **Decidir dónde vive la producción oficial** (hoy es la cuenta de Gabi) y quién administra el dominio.
3. **Decidir** si se saca la conexión Infancia–Chatbots en el aprendizaje, y revisar `programa_tema.json` (Educación muestra "0 programas").
4. **Contenido real:** citas reales (hoy hay lorem), "+20 programas" fijo (hay 16), bios, fechas y datos de episodios, confirmar datos inferidos (año de T2), temas sin nodo (cine, videojuegos, publicidad).
5. **Formulario de contacto:** elegir el servicio de envío (EmailJS, Formspree o backend propio); hoy no envía nada.
6. **Transcripciones y subtítulos** revisados de los videos de YouTube.
7. **Revisión conjunta:** cada integrante mira el sitio en su celular y su compu y anota lo que vea mal; probar entre todos con un lector de pantalla (NVDA o VoiceOver).
8. **Cerrar el PR #1 viejo** del fork (neo-brutalismo) y limpiar las ramas viejas.
9. **Definir cómo se publica:** conectar la rama de producción a Vercel (que `git push` despliegue solo) o seguir a mano.
10. **Sitio Astro paralelo** (`codigo-ia-v3`): decidir si sigue, se unifica con este o se descarta.

### Pendientes técnicos
- Panel del menú hamburguesa: falta una propuesta nueva (unido al botón y translúcido).
- Bajar más el JS (framer-motion) y achicar miniaturas de YouTube en celular.
- `eslint-plugin-jsx-a11y` y axe; código sin uso (`PENULTIMA`, `ControlesReproduccion.jsx`).

### Sitio Astro (otra línea de trabajo)
Copiar `ci.yml` desde `codigo.ia-main`; revisar recortes de fotos T1/T2; confirmar año de T2; cargar minutos y citas de capítulos; revisar fechas del RSS; decidir "Código IA Radio"; elegir dominio para canonical y OG.

## 7. Restricciones
- Solo diseño visual: no cambiar estructura, rutas ni datos salvo acuerdo.
- Español rioplatense en la interfaz. Respetar `prefers-reduced-motion`.
- No tocar el sitio definitivo en producción del equipo (https://codigoia.vercel.app/) sin acordarlo.
- Antes de commitear: `npm run build`. Desarrollo local: `npm run dev` (puerto 5173).

## 8. Riesgos o puntos a revisar
- Producción no se actualiza sola: hay que redesplegar a mano o conectar la rama.
- Todo se probó en un navegador de prueba que frena animaciones: **la fluidez real y la sincronía de la intro solo se juzgan en un dispositivo**. No se probó con lector de pantalla real ni en celular físico.
- Hay varias ramas cercanas; los arreglos entre ramas se portan con cherry-pick y pueden dar conflictos.
- La producción está en el Vercel de Gabi: si Gabi borra el proyecto, se cae el link.

## 9. Próximo paso recomendado
1. Abrir el PR hacia el repo de Manuela (pasos abajo) y que ella lo acepte.
2. Que Manuela redespliegue su Vercel y revisen juntos el sitio en celulares reales.
3. Repartir las tareas de "Falta hacer como grupo".

## 10. Cómo pasarle los cambios a Manuela (pull request)
1. Entrar a https://github.com/gabrieldelfiino-oss/codigoIA-design
2. En el selector de ramas elegir **`diseno/rendimiento`**.
3. Tocar **Contribute** → **Open pull request**.
4. Verificar: *base repository* `manuastormend/codigoIA-try` (rama `main`) y *head repository* `gabrieldelfiino-oss/codigoIA-design` (rama `diseno/rendimiento`). Debe decir **"Able to merge"**.
5. Título sugerido: *Rediseño visual: mapa de temas en vidrio, versión celular, accesibilidad y rendimiento*. En la descripción resumir los cambios y enlazar https://codigoia-design.vercel.app/ y este archivo.
6. **Create pull request** y pasarle el link a Manuela.
7. Manuela revisa y toca **Merge pull request**. Después, **redesplegar su proyecto en Vercel**.

## 11. Archivos y fuentes relevantes
- `PROJECT_STATE.md` (estado vivo), `HANDOFF.md` y `CODIGO-IA-SPEC.md` (estructura y datos), `tailwind.config.js`, `src/index.css`.
- Mapa: `src/components/temas/{ThemeMap,ThemeMapMovil,ThemeSection,ThemePage}.jsx`; datos en `src/data/mapa.json`, `src/servicios/mapa.js`.
- Intro y portada: `src/components/general/{IntroHeader,Nav,SearchBar,Carousel,AllSection,ContactForm,Footer}.jsx`, `src/components/utils/{BrandTitle,Heartbeat,Spin,Orbes,PageHeader}.jsx`, `src/App.jsx`, `src/main.jsx`.
- Textos del formulario y copyright: `src/data/proyecto.json`.
- Referencia visual del mapa: artefacto `claude.ai/artifact/QPh6W9x5jJ3MhLy17DMoBx`.
- Sitio paralelo (Astro): `gabrieldelfiino-oss/codigo-ia-v3` (privado), https://codigo-ia-v3.vercel.app/.
