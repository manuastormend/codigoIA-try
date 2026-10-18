import proyecto from '../../data/proyecto.json'
import Imagotipo from '../utils/Imagotipo'

/**
 * Pie de página: fondo noche imagotipo oficial,
 * links a redes y copyright (todo desde proyecto.json).
 */
export default function Footer() {
  return (
    <footer className="seccion-curva w-full bg-noche px-6 pb-12 pt-16 text-gris sm:px-10">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <Imagotipo className="w-36 text-gris" label={proyecto.nombre} />

        <div className="flex gap-6 font-mono text-xs uppercase tracking-widest">
          <a
            href={proyecto.redes.youtube}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-gris/25 px-4 py-2 transition-colors hover:border-lima hover:text-lima"
          >
            /YouTube<span className="sr-only"> (abre en una pestaña nueva)</span>
          </a>
          <a
            href={proyecto.redes.instagram}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-gris/25 px-4 py-2 transition-colors hover:border-lima hover:text-lima"
          >
            /Instagram<span className="sr-only"> (abre en una pestaña nueva)</span>
          </a>
        </div>

        <span className="font-mono text-xs uppercase tracking-widest text-gris/70">{proyecto.copyright}</span>
      </div>
    </footer>
  )
}
