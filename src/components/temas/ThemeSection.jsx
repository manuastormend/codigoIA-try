import { lazy, Suspense, useState } from "react";
import { useMediaQuery } from "../../servicios/medios";
// Cada mapa se descarga solo si la pantalla lo necesita (PC o celular).
const ThemeMap = lazy(() => import("./ThemeMap"));
const ThemeMapMovil = lazy(() => import("./ThemeMapMovil"));
import RouterLink from "../utils/RouterLink";
import { TEMAS, getTema } from "../../servicios/temas";
import { getVecinos } from "../../servicios/mapa";

// Un punto de color de la paleta por chip, rotando.
const PUNTOS = ["bg-lila", "bg-lima", "bg-naranja", "bg-azul"];

/**
 * Sección "Temas" de la home, sobre fondo gris: el título, el mapa de nodos
 * (pantallas grandes) y, en pantallas chicas, una lista de chips con los
 * mismos temas. Cada nodo/chip lleva a /temas/:id.
 */
export default function ThemeSection() {
  const temas = TEMAS.filter((t) => t.tipo === "tema");
  // Modo inmersivo (PC): al interactuar con el mapa, la sección se oscurece y
  // el mapa muestra sus destellos. Lo maneja ThemeMap.
  const [inm, setInm] = useState(false);
  const esEscritorio = useMediaQuery("(min-width: 1024px)");

  return (
    <section
      id="temas"
      data-inmersivo={inm}
      className="group seccion-curva tx tx-puntos-claro bg-gris text-noche transition-[background-color,color] duration-700 motion-reduce:transition-none data-[inmersivo=true]:bg-[#070716] data-[inmersivo=true]:text-gris data-[inmersivo=true]:[--tx-img:radial-gradient(rgba(250,250,250,0.16)_1.2px,transparent_1.7px)]"
    >
      <div className="mx-auto max-w-6xl px-6 py-14 sm:px-10 sm:py-20">
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-azul transition-colors duration-700 group-data-[inmersivo=true]:text-lima">/Mapa de temas</p>
        <h2 className="max-w-4xl font-display text-3xl font-semibold leading-[1.05] tracking-tight sm:text-4xl">
          Todo se conecta con la <span className="text-azul transition-colors duration-700 group-data-[inmersivo=true]:text-lima">IA</span>
        </h2>
        <p className="mt-4 max-w-xl text-base text-noche/75 transition-colors duration-700 group-data-[inmersivo=true]:text-gris/75">
          <span className="hidden lg:inline">
            Pasá el cursor o tabulá por un nodo para iluminar sus caminos. Hacé
            clic en cualquiera para ver los programas de ese tema.
          </span>
          <span className="lg:hidden">
            Tocá un nodo y mirá cómo se conecta todo. Después metete en el tema desde la ficha de abajo.
          </span>
        </p>

        <div className="mt-10 hidden overflow-hidden rounded-3xl shadow-suave-lg transition-shadow duration-700 group-data-[inmersivo=true]:shadow-[0_0_90px_rgba(196,253,54,0.2),0_30px_80px_rgba(0,0,0,0.5)] lg:block">
          {esEscritorio && (
            <Suspense fallback={<div className="aspect-[1200/720] w-full bg-[#050512]" />}>
              <ThemeMap inmersivo={inm} alCambiarInmersivo={setInm} />
            </Suspense>
          )}
        </div>

        {/* Alternativa en texto del mapa (PC): la misma información, en una lista
            que se recorre con teclado o lector de pantalla. */}
        <details className="group/lista mt-4 hidden rounded-2xl border border-current/15 px-5 py-3 lg:block">
          <summary className="cursor-pointer font-mono text-xs uppercase tracking-widest [&::-webkit-details-marker]:hidden">
            Ver el mapa como lista
          </summary>
          <ul className="mt-5 grid gap-5 pb-2 lg:grid-cols-4">
            {temas.map((t) => (
              <li key={t.id}>
                <RouterLink to={`/temas/${t.id}`} className="font-display text-base font-semibold underline-offset-4 hover:underline">
                  {t.nombre}
                </RouterLink>
                <ul className="mt-1 grid gap-0.5 text-sm opacity-80">
                  {getVecinos(t.id)
                    .map(getTema)
                    .filter(Boolean)
                    .map((s) => (
                      <li key={s.id}>
                        <RouterLink to={`/temas/${s.id}`} className="underline-offset-4 hover:underline">
                          {s.nombre}
                        </RouterLink>
                      </li>
                    ))}
                </ul>
              </li>
            ))}
          </ul>
        </details>

        <div className="mt-8 lg:hidden">
          {!esEscritorio && (
            <Suspense fallback={<div className="h-[640px] w-full rounded-3xl bg-[#050512]" />}>
              <ThemeMapMovil />
            </Suspense>
          )}
        </div>

        {/* Lista de temas en celular: la misma información del mapa, como desplegable
            (arranca cerrado, igual que "Sobre el proyecto" y "Escribinos"). */}
        <details className="group mt-8 rounded-3xl border border-noche/10 bg-white text-noche shadow-suave lg:hidden">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-3xl px-6 py-4 font-display text-xl font-semibold tracking-tight [&::-webkit-details-marker]:hidden">
            Lista de temas
            <span
              aria-hidden
              className="relative h-9 w-9 shrink-0 rounded-full bg-lima transition-transform duration-200 group-hover:scale-110 before:absolute before:left-1/2 before:top-1/2 before:h-0.5 before:w-4 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-noche before:content-[''] after:absolute after:left-1/2 after:top-1/2 after:h-4 after:w-0.5 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-noche after:content-[''] group-open:after:hidden"
            />
          </summary>
          <ul className="flex flex-wrap gap-3 px-6 pb-6 pt-1">
          {temas.map((t, i) => (
            <li key={t.id}>
              <RouterLink
                to={`/temas/${t.id}`}
                className="inline-flex min-h-11 items-center gap-2.5 rounded-full border border-noche/10 bg-gris px-5 py-2 text-base font-medium transition-transform duration-200 hover:-translate-y-0.5"
              >
                <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${PUNTOS[i % PUNTOS.length]}`} />
                {t.nombre}
              </RouterLink>
            </li>
          ))}
        </ul>
        </details>
      </div>
    </section>
  );
}
