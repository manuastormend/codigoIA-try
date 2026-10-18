import { useState } from 'react'
import { getProgramasPorTemporada, getTemporadasRecientesPrimero } from '../../servicios/programas'
import RouterLink from '../utils/RouterLink'

// De la más nueva a la más vieja (según `orden` en temporadas.json).
const GRUPOS = getTemporadasRecientesPrimero()

// Punto de color por temporada, tomado de la paleta.
const ACENTOS = ['bg-lima', 'bg-lila', 'bg-naranja', 'bg-azul']

function Chevron() {
  return (
    <svg
      className="h-5 w-5 shrink-0 text-gris/70 transition-transform duration-300 group-open:rotate-180"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 9l7 7 7-7" />
    </svg>
  )
}

/**
 * Explorador de temporadas: un acordeón por temporada (la más reciente abierta)
 * con todos sus programas; cada fila lleva a la ficha del programa.
 */
export default function AllSection() {
  // Acordeón exclusivo: al abrir una temporada se cierra la que estaba abierta.
  const [abierta, setAbierta] = useState(GRUPOS[0]?.id ?? null)

  return (
    <section id="todos-los-programas" className="seccion-curva tx tx-puntos w-full bg-noche py-14 text-gris sm:py-20">
      <div className="mx-auto max-w-4xl px-6 sm:px-10">
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-lima">/Temporadas</p>
        <h2 className="font-display text-3xl font-semibold leading-[1.05] tracking-tight sm:text-4xl">
          Todos los programas
        </h2>
        <p className="mt-3 max-w-xl text-base text-gris/70">
          Elegí una temporada y metete.<span className="sr-only"> Al abrir una temporada se cierra la otra.</span>
        </p>

        <div className="mt-8 flex flex-col gap-3">
          {GRUPOS.map((temporada, i) => (
            <Temporada
              key={temporada.id}
              temporada={temporada}
              indice={i}
              abierta={abierta === temporada.id}
              alAbrir={() => setAbierta(temporada.id)}
              alCerrar={() => setAbierta((actual) => (actual === temporada.id ? null : actual))}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function Temporada({ temporada, indice, abierta, alAbrir, alCerrar }) {
  const programas = getProgramasPorTemporada(temporada.id)
  const acento = ACENTOS[indice % ACENTOS.length]

  return (
    <details
      open={abierta}
      onToggle={(e) => (e.currentTarget.open ? alAbrir() : alCerrar())}
      className="group rounded-3xl border border-gris/15 bg-gris/[0.04] transition-colors open:border-gris/25 open:bg-gris/[0.07]"
    >
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-4 rounded-3xl px-5 py-4 sm:px-6 [&::-webkit-details-marker]:hidden">
        <span aria-hidden className={`h-2.5 w-2.5 shrink-0 rounded-full ${acento}`} />
        <span className="min-w-0 flex-1 font-display text-xl font-semibold leading-none tracking-tight sm:text-2xl">
          {temporada.titulo}
        </span>
        <span className="shrink-0 rounded-full border border-gris/20 px-3 py-1 font-mono text-xs uppercase tracking-wider text-gris/70">
          {programas.length} {programas.length === 1 ? 'EP' : 'EPs'}
        </span>
        <Chevron />
      </summary>

      <div className="flex flex-col gap-2 px-3 pb-4 sm:px-4">
        {programas.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gris/25 p-4 text-sm text-gris/60">
            Todavía no hay programas en esta temporada.
          </p>
        ) : (
          programas.map((programa) => <FilaPrograma key={programa.id} programa={programa} />)
        )}
      </div>
    </details>
  )
}

function FilaPrograma({ programa }) {
  return (
    <RouterLink
      to={`/programa/${programa.id}`}
      className="group/fila flex min-h-12 items-center gap-4 rounded-2xl px-4 py-2.5 transition-colors hover:bg-gris/10"
    >
      <span className="min-w-0 flex-1 font-display text-base font-medium leading-tight transition-colors group-hover/fila:text-lima">
        {programa.titulo}
      </span>
      {programa.duracion && (
        <span className="shrink-0 font-mono text-xs text-gris/55">{programa.duracion}</span>
      )}
      <span aria-hidden className="shrink-0 text-gris/55 transition-all group-hover/fila:translate-x-1 group-hover/fila:text-lima">
        →
      </span>
    </RouterLink>
  )
}
