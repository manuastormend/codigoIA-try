import { useCallback, useEffect, useRef, useState } from 'react'
import { animate, motion } from 'framer-motion'
import BrandTitle from '../utils/BrandTitle'
import Heartbeat from '../utils/Heartbeat'
import Nav from './Nav'
import SearchBar from './SearchBar'

// Cuánto se queda el título grande centrado (ya asentado) antes de
// "convertirse" en header. Se suma al tiempo que tarda en aparecer
// difuminado (ver transition en BrandTitle, ~1.1s) para que no se corten.
const INTRO_DURATION_MS = 2200

// Cuánto dura el viaje del logo al header (debe coincidir con layout.duration en
// BrandTitle y con la animación .intro-desvanecer de index.css).
const DURACION_VIAJE_MS = 2200

// Cuántos px hay que bajar para que el slogan empiece su viaje al header.
const UMBRAL_SLOGAN_PX = 10

// `skip`: la intro ya se vio en esta carga (ej. al volver desde la ficha de un
// programa); arranca directo en el header chico, sin animación ni espera.
export default function IntroHeader({ onIntroDone, skip = false }) {
  // Fases de la intro, sincronizadas con el viaje del logo:
  //  1) el logo grande queda centrado (INTRO_DURATION_MS);
  //  2) `viajando`: el logo pasa al header y se mueve hasta su lugar (animación de
  //     layout), mientras el fondo de la intro sigue ahí y se va desvaneciendo;
  //  3) `llego`: el logo terminó de llegar. Recién ahí aparece la home, el buscador
  //     y el menú, así nada se adelanta al logo.
  const [viajando, setViajando] = useState(skip)
  const [llego, setLlego] = useState(skip)
  const llegoRef = useRef(skip)
  const headerRef = useRef(null)
  const sloganRef = useRef(null)

  const terminar = useCallback(() => {
    if (llegoRef.current) return
    llegoRef.current = true
    setLlego(true)
    onIntroDone?.()
  }, [onIntroDone])

  useEffect(() => {
    if (skip) return
    const timer = setTimeout(() => setViajando(true), INTRO_DURATION_MS)
    return () => clearTimeout(timer)
  }, [skip])

  // Cuando el logo termina de llegar, BrandTitle avisa (onLayoutAnimationComplete).
  // Respaldo: si el aviso no llega (p. ej. con "reducir movimiento" no hay viaje), se
  // da por terminado igual al pasar la duración del viaje.
  useEffect(() => {
    if (!viajando || llegoRef.current) return
    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const respaldo = setTimeout(terminar, reducir ? 0 : DURACION_VIAJE_MS + 700)
    return () => clearTimeout(respaldo)
  }, [viajando, terminar])

  // Viaje del slogan: sale del título del hero (a su tamaño y en su lugar), se
  // achica y va hacia arriba y al centro del header, mientras el título se
  // desvanece. Avanza (p: 0 → 1) con el scroll por el hero y también cuando el
  // carrusel pasa a otro banner. Solo en pantallas anchas (en las chicas no
  // entra entre logo y buscador). Con "reducir movimiento" no hay tramo
  // intermedio. Todo se escribe directo en los elementos, sin re-renders.
  useEffect(() => {
    if (!llego) return
    const raiz = document.documentElement
    const ancho = window.matchMedia('(min-width: 1280px)')
    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)')
    const estado = { scroll: 0, slide: 0 }
    // Último lugar conocido del título (coordenadas del documento): sirve de
    // punto de partida aun cuando el banner del slogan no está a la vista.
    const titulo = { x: Math.max(0, (window.innerWidth - 880) / 2), y: 380, ancho: 880 }
    let viaje = null

    const pintar = () => {
      const el = sloganRef.current
      if (!el) return
      if (!ancho.matches) {
        el.style.opacity = '0'
        raiz.style.setProperty('--eslogan-h2', '0')
        return
      }
      const h2 = document.getElementById('eslogan-hero')
      if (h2) {
        const r = h2.getBoundingClientRect()
        titulo.x = r.left
        titulo.y = r.top + r.height / 2 + window.scrollY
        titulo.ancho = r.width
      }
      let p = Math.max(estado.scroll, estado.slide)
      if (reducir.matches) p = p > 0.5 ? 1 : 0
      const w = el.offsetWidth || 1
      const escala0 = Math.min(3.4, Math.max(1, (titulo.ancho * 0.92) / w))
      const x0 = titulo.x + titulo.ancho / 2
      const y0 = titulo.y - window.scrollY
      const x1 = window.innerWidth / 2
      const y1 = (headerRef.current?.offsetHeight ?? 72) / 2
      const e = p // la suavidad ya la da la animación por tiempo (ease-out)
      el.style.transform = `translate(${(x0 + (x1 - x0) * e).toFixed(1)}px, ${(y0 + (y1 - y0) * e).toFixed(1)}px) translate(-50%, -50%) scale(${(escala0 + (1 - escala0) * e).toFixed(3)})`
      el.style.opacity = Math.min(1, p * 6).toFixed(3)
      raiz.style.setProperty('--eslogan-h2', Math.min(1, p / 0.4).toFixed(3))
    }

    let marco = 0
    const programar = () => {
      if (marco) return
      marco = requestAnimationFrame(() => {
        marco = 0
        pintar()
      })
    }
    // El viaje del slogan lo dispara el scroll pero lo mueve el tiempo: al pasar un
    // umbral corre una animación fluida de 0,7 s (y la inversa al volver arriba).
    // Así no depende de cuántos eventos de scroll lleguen (con la rueda del mouse
    // llegan pocos y se veía a saltos).
    let objetivoScroll = estado.scroll
    let viajeScroll = null
    const alScrollear = () => {
      const objetivo = window.scrollY > UMBRAL_SLOGAN_PX ? 1 : 0
      if (objetivo === objetivoScroll) return
      objetivoScroll = objetivo
      viajeScroll?.stop()
      viajeScroll = animate(estado.scroll, objetivo, {
        duration: reducir.matches ? 0 : 0.7,
        ease: [0.22, 1, 0.36, 1],
        onUpdate: (v) => {
          estado.scroll = v
          pintar()
        },
      })
    }
    const alCambiarSlide = (ev) => {
      viaje?.stop()
      viaje = animate(estado.slide, ev.detail?.hero ? 0 : 1, {
        duration: reducir.matches ? 0 : 0.85,
        ease: [0.22, 1, 0.36, 1],
        onUpdate: (v) => {
          estado.slide = v
          pintar()
        },
      })
    }

    // Estado inicial (si la página carga ya scrolleada) sin animar.
    estado.scroll = window.scrollY > UMBRAL_SLOGAN_PX ? 1 : 0
    objetivoScroll = estado.scroll
    programar()
    window.addEventListener('scroll', alScrollear, { passive: true })
    window.addEventListener('resize', programar)
    window.addEventListener('carrusel-slide', alCambiarSlide)
    return () => {
      viaje?.stop()
      viajeScroll?.stop()
      cancelAnimationFrame(marco)
      window.removeEventListener('scroll', alScrollear)
      window.removeEventListener('resize', programar)
      window.removeEventListener('carrusel-slide', alCambiarSlide)
      raiz.style.removeProperty('--eslogan-h2')
    }
  }, [llego])

  // Logo = "volver al inicio": sube al principio y vuelve al primer banner.
  const alInicio = (e) => {
    e.preventDefault()
    window.dispatchEvent(new Event('carrusel-inicio'))
    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reducir ? 'auto' : 'smooth' })
  }

  return (
    <>
      {/* Header fijo: vacío mientras dura la intro, se llena cuando termina */}
      <header
        ref={headerRef}
        className="fixed left-0 top-0 z-50 flex w-full items-center justify-between bg-noche px-6 py-5 sm:px-10"
      >
        {viajando && (
          <a href="/" aria-label="Código.IA: volver al inicio" onClick={alInicio} className="block rounded-md">
            <BrandTitle variant="small" alTerminarViaje={terminar} />
          </a>
        )}

        {/* Slogan del header: su posición, tamaño y opacidad los escribe el efecto de arriba. */}
        {llego && (
          <p
            ref={sloganRef}
            aria-hidden="true"
            style={{ opacity: 0 }}
            className="pointer-events-none absolute left-0 top-0 hidden whitespace-nowrap font-display text-[15px] font-medium text-gris xl:block"
          >
            El programa que te ayuda a no estar <Heartbeat className="text-lima">re perdido</Heartbeat> con la IA
          </p>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: llego ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="ml-auto flex min-w-0 items-center gap-4 sm:gap-8"
        >
          {llego && <SearchBar />}
          {llego && <Nav />}
        </motion.div>
      </header>

      {/* Fondo de la intro. El título grande vive acá solo hasta que empieza el viaje:
          al desmontarse (viajando = true) en el mismo render en que BrandTitle "small" se
          monta en el header, Framer Motion anima el viaje entre ambos vía layoutId. El
          fondo sigue durante todo el viaje y se desvanece justo para cuando el logo llega. */}
      {!llego && (
        <div
          className={`fixed inset-0 flex items-center justify-center bg-noche bg-grid-azul ${
            viajando ? 'intro-desvanecer' : ''
          }`}
        >
          {!viajando && <BrandTitle variant="large" />}
        </div>
      )}
    </>
  )
}
