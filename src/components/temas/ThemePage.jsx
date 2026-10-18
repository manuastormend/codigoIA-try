import { getBajada, getTemporada } from "../../servicios/programas";
import { useEffect, useState } from "react";
import { getCitasDeTema } from "../../servicios/citas";
import { getProgramasDeTema, getTema } from "../../servicios/temas";
import { getVecinos } from "../../servicios/mapa";
import { getYoutubeThumbnail } from "../../servicios/youtube";
import { formatFecha } from "../../servicios/texto";
import Footer from "../general/Footer";
import Orbes from "../utils/Orbes";
import PageHeader from "../utils/PageHeader";
import RouterLink from "../utils/RouterLink";
import VideoFlotante from "../utils/VideoFlotante";
import CitaCard from "./CitaCard";

const ETIQUETA = "font-mono text-xs uppercase tracking-widest";
const BOTON =
  "rounded-full border px-5 py-2.5 font-mono text-xs font-medium uppercase tracking-wider transition-colors duration-300 sm:text-sm";

/**
 * Página de un tema o subtema (/temas/:id), a donde se llega desde el mapa:
 * título, bajada y los programas que tocan el tema.
 */
export default function ThemePage({ id }) {
  const tema = getTema(id);
  useEffect(() => {
    document.title = tema ? `${tema.nombre} · Código.IA` : "Uy, acá no hay nada · Código.IA";
  }, [tema]);

  return (
    <div className="min-h-screen w-full bg-noche text-gris">
      <main id="contenido" tabIndex={-1} className="outline-none">
        {!tema ? (
          <>
          <PageHeader conVolver={false} />
          <div className="mx-auto max-w-4xl px-6 py-24 text-center sm:px-10">
            <p className={`${ETIQUETA} text-lima`}>/No encontrado</p>
            <h1 className="mt-4 font-display text-3xl font-medium sm:text-5xl">
              Uy, acá no hay nada.
            </h1>
          </div>
          </>
        ) : (
          <Contenido tema={tema} />
        )}
      </main>
      <div className="pt-14">
        <Footer />
      </div>
    </div>
  );
}

// Conexiones del mapa: de un tema salen sus subtemas y los temas con los que
// comparte subtemas; de un subtema, los temas en los que aparece.
function getConexiones(tema) {
  const directos = getVecinos(tema.id).map(getTema).filter(Boolean);
  if (tema.tipo !== "tema") {
    return [{ titulo: "Aparece en los temas", items: directos }];
  }
  const cruzados = new Map();
  for (const sub of directos) {
    for (const otro of getVecinos(sub.id).map(getTema)) {
      if (otro && otro.id !== tema.id) cruzados.set(otro.id, otro);
    }
  }
  return [
    { titulo: "Subtemas", items: directos },
    { titulo: "Se cruza con", items: [...cruzados.values()] },
  ].filter((g) => g.items.length > 0);
}

function Contenido({ tema }) {
  const programas = getProgramasDeTema(tema.id);
  const citas = getCitasDeTema(tema.id);
  const conexiones = getConexiones(tema).filter((g) => g.items.length > 0);
  const [video, setVideo] = useState(null);

  return (
    <>
      <div className="relative overflow-hidden bg-noche text-gris">
        <Orbes />
        <div aria-hidden="true" className="tx tx-puntos absolute inset-0" />
        <div className="relative">
          <PageHeader conVolver={false} />
          <section>
            <div className="mx-auto max-w-5xl px-6 pb-10 pt-6 sm:px-10 sm:pb-12">
              <span className={`${ETIQUETA} mb-5 inline-block text-lila`}>
                /Tema
              </span>
              <h1 className="mb-4 font-display text-4xl font-semibold leading-[1.02] tracking-tight sm:text-6xl">
                <span className="text-lima">{tema.nombre}</span>
              </h1>
              {tema.descripcion && (
                <p className="max-w-2xl text-lg text-gris/80 sm:text-xl">
                  {tema.descripcion}
                </p>
              )}
              {conexiones.length > 0 && (
                <div className="mt-8 grid gap-5">
                  {conexiones.map((grupo) => (
                    <div key={grupo.titulo}>
                      <h2 className={`${ETIQUETA} mb-3 text-gris/60`}>/{grupo.titulo}</h2>
                      <ul className="flex flex-wrap gap-2">
                        {grupo.items.map((item) => (
                          <li key={item.id}>
                            <RouterLink
                              to={`/temas/${item.id}`}
                              className={`inline-flex min-h-10 items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                                item.tipo === "tema"
                                  ? "border-lila/50 bg-lila/10 text-lila hover:bg-lila hover:text-noche"
                                  : "border-gris/30 bg-gris/5 text-gris hover:border-lima hover:bg-lima hover:text-noche"
                              }`}
                            >
                              {item.nombre}
                            </RouterLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {citas.length > 0 && (
        <section className="tx tx-puntos-claro relative overflow-hidden bg-gris text-noche">
          <div className="relative mx-auto max-w-5xl px-6 py-10 sm:px-10 sm:py-14">
            <h2 className={`${ETIQUETA} mb-8 inline-block text-azul`}>
              /Citas destacadas sobre {tema.nombre}
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {citas.map((cita) => (
                <CitaCard key={cita.id} cita={cita} onReproducir={setVideo} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10 sm:py-12">
          <h2 className={`${ETIQUETA} mb-8 inline-block text-lima`}>
            /Programas que tocan este tema · {programas.length}
          </h2>
          {programas.length === 0 ? (
            <p className="text-gris/70">
              Todavía no hay programas con este tema.
            </p>
          ) : (
            <div className="grid gap-6">
              {programas.map((programa) => (
                <TarjetaPrograma key={programa.id} programa={programa} />
              ))}
            </div>
          )}
        </div>
      </section>

      {video && (
        <VideoFlotante
          url={video.programa.linkYoutube}
          inicio={video.inicio}
          titulo={video.programa.titulo}
          onCerrar={() => setVideo(null)}
        />
      )}
    </>
  );
}

function TarjetaPrograma({ programa }) {
  const temporada = getTemporada(programa.temporadaId);
  const fecha = formatFecha(programa.fechaPublicacion);
  const thumb = getYoutubeThumbnail(programa.linkYoutube);
  const bajada = getBajada(programa);

  return (
    <article className="grid gap-4 rounded-3xl border border-gris/15 bg-gris/5 p-4 transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-lila/50">
      <div className="flex flex-wrap items-center gap-3">
        {temporada && (
          <span className={`${ETIQUETA} rounded-full bg-lima px-3 py-1 text-[11px] text-noche`}>
            {temporada.titulo}
          </span>
        )}
        {fecha && (
          <span className="font-mono text-[11px] uppercase tracking-wider text-gris/60">
            {fecha}
          </span>
        )}
      </div>

      <div className="grid items-start gap-4 md:grid-cols-12">
        <RouterLink
          to={`/programa/${programa.id}`}
          aria-label={`Ver ficha de «${programa.titulo}»`}
          className="group relative block aspect-video w-full overflow-hidden rounded-2xl bg-noche md:col-span-4"
        >
          {thumb ? (
            <img
              src={thumb}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-xs text-gris/30">
              Sin imagen
            </span>
          )}
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-lima text-xl text-noche transition-colors group-hover:bg-naranja group-hover:text-white"
          >
            ▶
          </span>
        </RouterLink>

        <div className="md:col-span-8">
          <h3 className="font-display text-2xl font-semibold leading-[1.1] tracking-tight sm:text-3xl">
            <RouterLink
              to={`/programa/${programa.id}`}
              className="underline-offset-4 decoration-lima decoration-[3px] hover:underline"
            >
              {programa.titulo}
            </RouterLink>
          </h3>
          {bajada && (
            <p className="mt-3 line-clamp-3 max-w-[70ch] text-base text-gris/70">
              {bajada}
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            <RouterLink
              to={`/programa/${programa.id}`}
              className={`${BOTON} border-lima bg-lima text-noche hover:border-gris hover:bg-gris`}
            >
              Mirá el programa completo
            </RouterLink>
            {programa.linkYoutube && (
              <a
                href={programa.linkYoutube}
                target="_blank"
                rel="noopener noreferrer"
                className={`${BOTON} border-gris text-gris hover:border-lima hover:bg-lima hover:text-noche`}
              >
                ▶ Miralo en YouTube<span className="sr-only"> (abre en una pestaña nueva)</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
