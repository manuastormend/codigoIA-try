import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// Un link por sección de la home, en el mismo orden en que aparecen en la página.
const LINKS = [
  { href: '#temas', label: 'Temas' },
  { href: '#cuarta-temporada', label: 'Lo último' },
  { href: '#todos-los-programas', label: 'Todo el catálogo' },
  { href: '#sobre-el-proyecto', label: 'De qué va esto' },
  { href: '#contacto', label: 'Escribinos' },
]

// Alto del header fijo: la sección queda justo debajo.
const ALTO_HEADER = 72

function irA(href) {
  const el = document.querySelector(href)
  if (!el) return
  const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const top = el.getBoundingClientRect().top + window.scrollY - ALTO_HEADER
  window.scrollTo({ top: Math.max(0, top), behavior: reducir ? 'auto' : 'smooth' })
}

/**
 * Menú (derecha del header): un panel chico que se abre al costado, bajo el
 * botón. Se abre al pasar el cursor por el botón. Al pasar el cursor por un link la página baja sola a esa sección;
 * al hacer clic se queda ahí y el panel se cierra.
 */
export default function Nav() {
  const [open, setOpen] = useState(false)
  const [activo, setActivo] = useState(null)
  const raiz = useRef(null)
  const timer = useRef(null)
  const cierre = useRef(null)
  const ultimoPuntero = useRef(null)
  const boton = useRef(null)

  useEffect(() => {
    if (!open) return
    const alPresionar = (e) => {
      if (raiz.current && !raiz.current.contains(e.target)) setOpen(false)
    }
    const alTeclear = (e) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      boton.current?.focus()
    }
    document.addEventListener('pointerdown', alPresionar)
    document.addEventListener('keydown', alTeclear)
    return () => {
      document.removeEventListener('pointerdown', alPresionar)
      document.removeEventListener('keydown', alTeclear)
      clearTimeout(timer.current)
      clearTimeout(cierre.current)
      setActivo(null)
    }
  }, [open])

  // Con mouse el panel se abre al pasar el cursor y se cierra al salir (con una
  // pequeña espera para no cerrarse si el cursor cruza el espacio entre botón y panel).
  // Con teclado o pantalla táctil se mantiene el clic como alternativa.
  const alEntrar = (e) => {
    if (e.pointerType !== 'mouse') return
    clearTimeout(cierre.current)
    setOpen(true)
  }
  const alSalir = (e) => {
    if (e.pointerType !== 'mouse') return
    clearTimeout(cierre.current)
    cierre.current = setTimeout(() => setOpen(false), 250)
  }

  const resaltar = (href) => setActivo(href)

  return (
    <div
      ref={raiz}
      className="relative"
      onPointerEnter={alEntrar}
      onPointerLeave={alSalir}
    >
      <motion.button
        type="button"
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={open}
        aria-controls="menu-secciones"
        ref={boton}
        onPointerDown={(e) => { ultimoPuntero.current = e.pointerType }}
        onClick={() => {
          // Con mouse ya se abrió al pasar el cursor: el clic no debe cerrarlo.
          if (ultimoPuntero.current === 'mouse') { ultimoPuntero.current = null; setOpen(true); return }
          setOpen((v) => !v)
        }}
        className="group relative z-[60] flex h-5 w-7 flex-col justify-center gap-[5px]"
      >
        <motion.span
          animate={{ rotate: open ? 45 : 0, y: open ? 3.5 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="block h-[2px] w-full shrink-0 origin-center bg-gris transition-colors duration-300 group-hover:bg-lima"
        />
        <motion.span
          animate={{ rotate: open ? -45 : 0, y: open ? -3.5 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="block h-[2px] w-full shrink-0 origin-center bg-gris transition-colors duration-300 group-hover:bg-lima"
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="menu-secciones"
            aria-label="Secciones"
            initial={{ opacity: 0, scale: 0.94, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onMouseLeave={() => {
              clearTimeout(timer.current)
              setActivo(null)
            }}
            style={{ transformOrigin: 'top right' }}
            className="absolute right-0 top-[calc(100%+1.5rem)] z-[60] w-64 rounded-[22px] border border-gris/15 bg-noche/70 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl"
          >
            {LINKS.map((link) => {
              const sel = activo === link.href
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onMouseEnter={() => resaltar(link.href)}
                  onFocus={() => resaltar(link.href)}
                  onClick={(e) => {
                    e.preventDefault()
                    clearTimeout(timer.current)
                    irA(link.href)
                    setOpen(false)
                  }}
                  className={`flex items-center justify-between rounded-[14px] px-3.5 py-2.5 font-display text-lg font-medium transition-colors duration-200 ${
                    sel ? 'bg-lima text-noche' : 'text-gris hover:bg-gris/10'
                  }`}
                >
                  {link.label}
                  <span
                    aria-hidden
                    className={`font-mono text-sm transition-opacity duration-200 ${sel ? 'opacity-100' : 'opacity-0'}`}
                  >
                    ↓
                  </span>
                </a>
              )
            })}
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  )
}
