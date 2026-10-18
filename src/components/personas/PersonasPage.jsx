import { useEffect, useRef } from "react";
import { getProgramasDePersona } from "../../servicios/personas";
import { getProgramaPorId } from "../../servicios/programas";
import { iniciales } from "../../servicios/citas";
import RouterLink from "../utils/RouterLink";
import Texto from "../utils/Texto";

const ETIQUETA = "font-mono text-xs uppercase tracking-widest";
const NOMBRES_LINKS = { instagram: "Instagram", linkedin: "LinkedIn", web: "Sitio web" };

function Dato({ titulo, children }) {
  if (!children) return null;
  return (
    <div>
      <dt className={`${ETIQUETA} text-lima`}>{titulo}</dt>
      <dd className="mt-1 text-gris/90">{children}</dd>
    </div>
  );
}

/**
 * Modal con la ficha de una persona: foto, profesión, institución, relación con
 * la IA, biografía, links y los programas en los que participó.
 */
export default function PersonasPage({ persona, onCerrar }) {
  const botonCerrar = useRef(null);

  useEffect(() => {
    const alTeclear = (e) => e.key === "Escape" && onCerrar();
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", alTeclear);
    botonCerrar.current?.focus();
    return () => {
      document.body.style.overflow = overflowPrevio;
      window.removeEventListener("keydown", alTeclear);
    };
  }, [onCerrar]);

  const programas = getProgramasDePersona(persona.id)
    .map(getProgramaPorId)
    .filter(Boolean);
  const links = Object.entries(persona.links ?? {}).filter(([, url]) => url);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-noche/40 p-4 backdrop-blur-md sm:p-8"
      onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}
    >
      <article
        role="dialog"
        aria-modal="true"
        aria-label={persona.nombre}
        className="tx tx-puntos relative w-full max-w-3xl rounded-3xl border border-gris/20 bg-noche/70 text-gris shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl"
      >
        <button
          ref={botonCerrar}
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full border border-gris/30 bg-noche/40 font-mono text-lg transition-colors hover:border-lima hover:bg-lima hover:text-noche"
        >
          ✕
        </button>

        <header className="flex items-center gap-5 border-b border-gris/15 p-6 pr-16 sm:p-8 sm:pr-20">
          <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-lila font-display text-3xl font-semibold text-noche sm:h-24 sm:w-24">
            {persona.foto ? (
              <img src={persona.foto} alt="" className="h-full w-full object-cover" />
            ) : (
              iniciales(persona.nombre)
            )}
          </div>
          <div className="min-w-0">
            <p className={`${ETIQUETA} text-lima`}>/Invitado</p>
            <h2 className="mt-1 font-display text-3xl font-bold uppercase leading-none tracking-tight sm:text-4xl">
              {persona.nombre}
            </h2>
            {persona.profesion && (
              <p className="mt-2 text-sm text-gris/75 sm:text-base">{persona.profesion}</p>
            )}
          </div>
        </header>

        <div className="grid gap-8 p-6 sm:p-8">
          <dl className="grid gap-5 sm:grid-cols-2">
            <Dato titulo="Institución">{persona.institucion}</Dato>
            <Dato titulo="Actividad actual">{persona.actividadActual}</Dato>
          </dl>

          {persona.relacionIA && (
            <div>
              <h3 className={`${ETIQUETA} mb-2 text-lima`}>/Relación con la IA</h3>
              <Texto className="text-gris/85">{persona.relacionIA}</Texto>
            </div>
          )}

          {persona.biografia && (
            <div>
              <h3 className={`${ETIQUETA} mb-2 text-lima`}>/Biografía</h3>
              <Texto className="text-gris/85">{persona.biografia}</Texto>
            </div>
          )}

          {links.length > 0 && (
            <div>
              <h3 className={`${ETIQUETA} mb-3 text-lima`}>/Links</h3>
              <div className="flex flex-wrap gap-2">
                {links.map(([tipo, url]) => (
                  <a
                    key={tipo}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-gris/30 px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors hover:border-lima hover:text-lima"
                  >
                    {NOMBRES_LINKS[tipo] ?? tipo} ↗<span className="sr-only"> (abre en una pestaña nueva)</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {programas.length > 0 && (
            <div>
              <h3 className={`${ETIQUETA} mb-3 text-lima`}>/Programas</h3>
              <ul className="flex flex-col gap-2">
                {programas.map((programa) => (
                  <li key={programa.id}>
                    <RouterLink
                      to={`/programa/${programa.id}`}
                      onClick={onCerrar}
                      className="block rounded-2xl border border-gris/20 px-4 py-3 font-display text-lg font-medium transition-colors hover:border-lima hover:text-lima"
                    >
                      {programa.titulo}
                    </RouterLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
