import { getProgramasPorTemporada, getTemporada, TEMPORADAS } from "../../servicios/programas";
import RouterLink from "../utils/RouterLink";
import Texto from "../utils/Texto";

/**
 * Los episodios de la última temporada, en formato editorial: a la izquierda
 * la temporada (título, pregunta y presentación, de temporadas.json) y
 * "Ver todos"; a la derecha una grilla de 2 columnas con una card por episodio.
 */
export default function AditionalSection() {
  const temporada = getTemporada(TEMPORADAS.ULTIMA);
  const episodios = getProgramasPorTemporada(TEMPORADAS.ULTIMA).slice(0, 4);

  if (episodios.length === 0) return null;

  return (
    <section id="cuarta-temporada" className="seccion-curva tx tx-cuadricula-claro bg-white text-noche">
      <div className="mx-auto max-w-5xl px-6 py-14 sm:px-10 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-naranja">
              /{temporada?.titulo}
            </p>
            <h2 className="font-display text-2xl font-semibold leading-[1.1] tracking-tight sm:text-3xl">
              {temporada?.subtitulo}
            </h2>
            <Texto className="mt-4 max-w-md text-base leading-relaxed text-noche/75">
              {temporada?.descripcion}
            </Texto>
            <a
              href="#todos-los-programas"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-noche px-6 py-3 text-sm font-medium text-gris transition duration-200 hover:-translate-y-0.5 hover:bg-azul"
            >
              Ver todos <span aria-hidden>↓</span>
            </a>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {episodios.map((episodio, i) => (
              <Episodio key={episodio.id} episodio={episodio} numero={i + 1} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const COLORES = [
  "bg-naranja text-noche",
  "bg-lila text-noche",
  "bg-lima text-noche",
  "bg-azul text-gris",
];

function Episodio({ episodio, numero }) {
  return (
    <RouterLink
      to={`/programa/${episodio.id}`}
      className="group flex flex-col rounded-3xl border border-noche/10 bg-gris p-5 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-suave-lg"
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl font-display text-lg font-semibold leading-none ${COLORES[(numero - 1) % COLORES.length]}`}
        >
          {String(numero).padStart(2, "0")}
        </span>
        <span className="pt-1 text-right font-mono text-xs uppercase tracking-widest text-noche/70">
          {episodio.titulo}
        </span>
      </div>
      <h3 className="mt-5 font-display text-xl font-semibold leading-[1.15] tracking-tight sm:text-2xl">
        {episodio.pregunta || episodio.titulo}
      </h3>
      <Texto className="mt-3 text-sm leading-relaxed text-noche/70">{episodio.resumen}</Texto>
      <span className="mt-4 inline-flex items-center gap-2 pt-1 text-sm font-medium transition-colors group-hover:text-azul">
        Ver programa <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
      </span>
    </RouterLink>
  );
}
