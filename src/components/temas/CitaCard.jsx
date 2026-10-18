import { formatTiempo, iniciales } from "../../servicios/citas";
import { getTemporada } from "../../servicios/programas";

/** Cita destacada: quién la dijo, el texto y un botón que abre el video en ese momento. */
export default function CitaCard({ cita, onReproducir }) {
  const { persona, programa } = cita;
  if (!persona || !programa) return null;
  const temporada = getTemporada(programa.temporadaId);

  return (
    <figure className="min-w-0 overflow-hidden rounded-3xl border border-noche/10 bg-white text-noche shadow-suave transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-suave-lg">
      <figcaption className="flex flex-wrap items-center gap-3 p-5">
        <span
          aria-hidden
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-azul font-display text-base font-semibold text-gris"
        >
          {iniciales(persona.nombre)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-semibold leading-tight">{persona.nombre}</p>
          {persona.profesion && (
            <p className="text-sm text-noche/70">{persona.profesion}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onReproducir(cita)}
          className="w-full shrink-0 rounded-full bg-azul px-5 py-2.5 text-center text-sm font-medium text-gris transition duration-200 hover:-translate-y-0.5 hover:bg-noche sm:w-auto"
        >
          ▶ Escuchá este momento ({formatTiempo(cita.inicio)})
        </button>
      </figcaption>
      <blockquote className="px-6 pb-6 pt-1 font-serif text-xl italic leading-relaxed sm:text-2xl">
        “{cita.texto}”
      </blockquote>
      <p className="border-t border-noche/10 bg-gris px-6 py-3 font-mono text-[11px] uppercase tracking-wider text-noche/70">
        {temporada?.titulo} · {programa.titulo}
      </p>
    </figure>
  );
}
