import { iniciales } from "../../servicios/citas";

const AVATARES = ["bg-lila", "bg-lima", "bg-naranja", "bg-azul text-gris"];

/**
 * Invitados en versión compacta para celular y tablet (< lg). Va entre el título
 * y el video: tarjetas chicas (avatar redondo + nombre + "Conocé su perfil →"), una arriba de
 * la otra y en orden alfabético.
 * En PC se sigue usando la columna de tarjetas grandes del costado.
 *
 * Al tocar una tarjeta se abre el perfil (onAbrir recibe la persona).
 */
export default function InvitadosCompactos({ invitados, onAbrir }) {
  if (!invitados?.length) return null;
  // En orden alfabético por nombre (sin distinguir tildes ni mayúsculas).
  const ordenados = [...invitados].sort((a, b) =>
    a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
  );
  return (
    <section aria-label="Invitados" className="lg:hidden">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <h2 className="mb-3 font-mono text-[11px] uppercase tracking-widest text-lima">/Invitados</h2>
        <ul className="flex flex-col gap-2">
          {ordenados.map((persona, i) => (
            <li key={persona.id}>
              <button
                type="button"
                onClick={() => onAbrir(persona)}
                aria-label={`Ver perfil de ${persona.nombre}`}
                className="flex min-h-14 w-full items-center gap-3 rounded-lg border border-gris/15 bg-gris/5 py-2 pl-2 pr-4 text-left transition-colors duration-200 active:border-lila/60 active:bg-gris/10"
              >
                <span
                  aria-hidden
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-semibold text-noche ${AVATARES[i % AVATARES.length]}`}
                >
                  {iniciales(persona.nombre)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-sm font-bold leading-tight">
                    {persona.nombre}
                  </span>
                  <span className="mt-1 block font-mono text-[10px] uppercase tracking-wider text-lima">
                    Conocé su perfil →
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
