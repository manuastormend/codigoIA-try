import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getBajada, getProgramasPorTemporada, TEMPORADAS } from "../../servicios/programas";
import { getYoutubeThumbnail } from "../../servicios/youtube";
import Isotipo from "../utils/Isotipo";
import Heartbeat from "../utils/Heartbeat";
import Orbes from "../utils/Orbes";
import Spin from "../utils/Spin";
import RouterLink from "../utils/RouterLink";

const AUTO_ADVANCE_MS = 6000;
const HERO_ADVANCE_MS = 10000;

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" aria-hidden="true">
      <path d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 5 12 5 12 5s-6 0-7.7.3A2.7 2.7 0 0 0 2.4 7.2 28 28 0 0 0 2 12a28 28 0 0 0 .4 4.8 2.7 2.7 0 0 0 1.9 1.9C6 19 12 19 12 19s6 0 7.7-.3a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22 12a28 28 0 0 0-.4-4.8ZM10 15V9l5 3-5 3Z" />
    </svg>
  );
}

// Slide fija de presentación: es un slide más del carrusel.
const HERO_SLIDE = { id: "hero", tipo: "hero" };

const BTN_PRIMARIO =
  "inline-flex items-center gap-2 rounded-full bg-lima px-6 py-3 text-sm font-medium text-noche transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-10px_rgba(196,253,54,0.7)]";
const BTN_SECUNDARIO =
  "inline-flex items-center gap-2 rounded-full border border-gris/40 px-6 py-3 text-sm font-medium text-gris transition duration-200 hover:bg-gris hover:text-noche";

/**
 * Carrusel grande con los episodios de la última temporada (TEMPORADAS.ULTIMA).
 * El primer slide es la presentación del programa; luego siguen los episodios.
 * Avanza solo (se pausa con el cursor encima, con el foco adentro o si la
 * persona pidió menos movimiento); los botones y los puntos permiten moverse.
 */
export default function SeasonCarousel({ activo = true }) {
  const episodios = getProgramasPorTemporada(TEMPORADAS.ULTIMA);
  const slides = [HERO_SLIDE, ...episodios];
  const [index, setIndex] = useState(0);
  const [pausado, setPausado] = useState(false);
  // Pausa explícita (botón): a diferencia de pausar con el cursor o el foco,
  // dura hasta que la persona vuelve a iniciar la rotación (WCAG 2.2.2).
  const [detenido, setDetenido] = useState(false);
  const [reducir] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (!activo || slides.length < 2 || pausado || detenido || reducir) return;
    const duration = slides[index]?.tipo === "hero" ? HERO_ADVANCE_MS : AUTO_ADVANCE_MS;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % slides.length), duration);
    return () => clearTimeout(timer);
  }, [activo, index, slides.length, pausado, detenido, reducir]);

  // Le avisa al header si se está viendo el banner del slogan (cuando no, el
  // slogan viaja al header) y vuelve al primer banner al tocar el logo.
  const esHero = slides[index]?.tipo === "hero";
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("carrusel-slide", { detail: { hero: esHero } }));
  }, [esHero]);
  useEffect(() => {
    const alInicio = () => setIndex(0);
    window.addEventListener("carrusel-inicio", alInicio);
    return () => window.removeEventListener("carrusel-inicio", alInicio);
  }, []);

  const actual = slides[index];
  if (!actual) return null;

  // Mientras rota solo, los cambios de banner no se anuncian; detenido o con el
  // foco adentro, sí (aria-live "polite").
  const rotando = slides.length > 1 && !pausado && !detenido && !reducir;
  const anterior = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const siguiente = () => setIndex((i) => (i + 1) % slides.length);

  // Gesto de deslizar (en celular): un barrido horizontal cambia de banner; el
  // scroll vertical de la página sigue funcionando (pan-y).
  const gesto = {
    drag: "x",
    dragConstraints: { left: 0, right: 0 },
    dragElastic: 0.18,
    style: { touchAction: "pan-y" },
    onDragEnd: (_, { offset, velocity }) => {
      if (offset.x < -60 || velocity.x < -500) siguiente();
      else if (offset.x > 60 || velocity.x > 500) anterior();
    },
  };

  return (
    <section
      id="carrusel"
      aria-roledescription="carrusel"
      aria-label="Programas de la última temporada"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
      className="relative h-[min(560px,calc(100svh-5rem))] min-h-[520px] w-full overflow-hidden bg-noche text-gris sm:h-[74vh] sm:min-h-[500px]"
    >
      <h1 className="sr-only">Código.IA: el programa que te ayuda a no estar re perdido con la IA</h1>
      {/* Controles del carrusel: no se ven, pero siguen ahí para teclado y lector de
          pantalla (aparecen al enfocarlos con Tab). Quien usa mouse o toque tiene los
          puntos, el gesto de deslizar y la pausa al pasar el cursor. */}
      <div className="absolute bottom-16 right-6 z-10 flex gap-2 sm:bottom-20 sm:right-12">
        <button
          type="button"
          onClick={() => setDetenido((d) => !d)}
          aria-label={detenido ? "Iniciar rotación de banners" : "Detener rotación de banners"}
          className="boton-oculto grid place-items-center rounded-full text-gris"
        >
          {detenido ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>
          )}
        </button>
        <button type="button" onClick={anterior} aria-label="Banner anterior" className="boton-oculto grid place-items-center rounded-full text-gris">
          ←
        </button>
        <button type="button" onClick={siguiente} aria-label="Banner siguiente" className="boton-oculto grid place-items-center rounded-full text-gris">
          →
        </button>
      </div>
      <div aria-live={rotando ? "off" : "polite"} aria-atomic="false" className="absolute inset-0">
      <AnimatePresence mode="wait">
        {actual.tipo === "hero" ? (
          <motion.div
            key={actual.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} de ${slides.length}`}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            {...gesto}
            className="absolute inset-0 bg-noche"
          >
            <Orbes />
            <div aria-hidden="true" className="tx tx-puntos absolute inset-0" />
            <Spin
              className="pointer-events-none absolute -right-32 -top-32 h-[70vw] max-h-[560px] w-[70vw] max-w-[560px] text-gris/[0.06]"
              durationSeconds={60}
            >
              <Isotipo className="h-full w-full" />
            </Spin>

            <div className="relative flex h-full flex-col items-center justify-center px-6 pb-40 pt-8 text-center sm:px-12 sm:pb-44">
              <span className="mb-6 inline-flex w-fit items-center rounded-full border border-gris/25 px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-gris/80">
                Un programa de FIC · Udelar
              </span>
              {/* --eslogan-h2 (0 → 1) lo escribe IntroHeader: el título se desvanece
                  mientras el slogan sale de acá y viaja al header. */}
              <h2
                id="eslogan-hero"
                className="max-w-5xl font-display text-[2.6rem] font-semibold leading-[1.02] tracking-tight sm:text-6xl xl:text-7xl"
                style={{ opacity: "calc(1 - var(--eslogan-h2, 0))" }}
              >
                El programa que te ayuda a no estar{" "}
                <Heartbeat className="text-lima">re perdido</Heartbeat> con la IA
              </h2>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <a href="https://www.youtube.com/@ProyectoFIC_codigoIA" className={BTN_PRIMARIO}>
                  <YoutubeIcon />
                  Mirá los programas
                </a>
                <span className="rounded-full border border-gris/25 px-4 py-2 font-mono text-xs uppercase tracking-wider text-gris/70">
                  +20 programas
                </span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={actual.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} de ${slides.length}`}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            {...gesto}
            className="absolute inset-0 bg-noche"
          >
            {/* En celular la miniatura va entera arriba (16:9, sin recortar) y el
                texto debajo; desde sm queda de fondo a pantalla completa. */}
            <div className="absolute inset-x-0 top-0 aspect-video sm:inset-0 sm:aspect-auto">
              <img
                src={getYoutubeThumbnail(actual.linkYoutube, "maxresdefault")}
                alt=""
                draggable={false}
                className="h-full w-full object-cover opacity-80 sm:opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-noche via-noche/10 to-transparent sm:via-noche/60" />
            </div>

            <div className="absolute inset-x-6 bottom-32 top-[calc(56.25vw-1.25rem)] overflow-hidden sm:inset-x-12 sm:bottom-40 sm:top-auto sm:overflow-visible">
              <span className="mb-2 inline-flex rounded-full bg-lila px-3.5 py-1 font-mono text-xs uppercase tracking-wider text-noche sm:mb-4">
                Programa {String(index).padStart(2, "0")}
              </span>
              <h2 className="max-w-2xl font-display text-2xl font-semibold leading-[1.05] sm:text-5xl">
                {actual.titulo}
              </h2>
              <p className="mt-2 line-clamp-2 max-w-xl text-sm text-gris/85 sm:mt-4 sm:line-clamp-none sm:text-lg">
                {getBajada(actual)}
              </p>

              <div className="mt-4 flex flex-wrap gap-2 sm:mt-6 sm:gap-3">
                <RouterLink to={`/programa/${actual.id}`} className={BTN_PRIMARIO}>
                  Mirá el programa
                </RouterLink>
                {actual.linkYoutube && (
                  <a
                    href={actual.linkYoutube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={BTN_SECUNDARIO}
                  >
                    <YoutubeIcon />
                    Miralo en YouTube<span className="sr-only"> (abre en una pestaña nueva)</span>
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      {/* Controles: puntos / anterior / siguiente */}
      <div className="absolute bottom-16 left-6 right-6 flex items-center justify-between gap-4 sm:bottom-20 sm:left-12 sm:right-12">
        <div className="flex items-center">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={s.tipo === "hero" ? "Ir a la presentación" : `Ir a ${s.titulo}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => setIndex(i)}
              className="group flex h-6 min-w-6 items-center justify-center px-1"
            >
              <span
                className={[
                  "block h-2 rounded-full transition-all duration-300",
                  i === index ? "w-8 bg-lima" : "w-2 bg-gris/40 group-hover:bg-gris/70",
                ].join(" ")}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
