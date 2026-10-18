import { useEffect, useState } from "react";
import {
  getProgramaPorId,
  getProgramasPorTemporada,
  getRecursos,
  getTemporada,
} from "../../servicios/programas";
import { getTemasDePrograma } from "../../servicios/temas";
import { getParticipantes } from "../../servicios/personas";
import { getYoutubeEmbedUrl, getYoutubeId } from "../../servicios/youtube";
import { iniciales } from "../../servicios/citas";
import { formatFecha } from "../../servicios/texto";
import PersonasPage from "../personas/PersonasPage";
import Footer from "../general/Footer";
import Orbes from "../utils/Orbes";
import PageHeader from "../utils/PageHeader";
import PersonBadge from "../utils/PersonBadge";
import RouterLink from "../utils/RouterLink";
import Texto from "../utils/Texto";

const IFRAME_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
const ETIQUETA = "font-mono text-xs uppercase tracking-widest";
const AVATARES = ["bg-lila", "bg-lima", "bg-naranja", "bg-azul text-gris"];

// Recursos que se pueden embeber y no son el video principal (ese ya se
// muestra arriba). Los que no tienen url (ej. audios de Uni Radio) se omiten.
function getRecursosExtra(programa) {
  const idPrincipal = getYoutubeId(programa.linkYoutube);
  return getRecursos(programa.id).filter((r) => {
    if (!r.url) return false;
    if (r.plataforma === "youtube") return getYoutubeId(r.url) !== idPrincipal;
    return r.plataforma === "drive";
  });
}

function urlEmbed(recurso) {
  return recurso.plataforma === "youtube" ? getYoutubeEmbedUrl(recurso.url) : recurso.url;
}

// Título con la última palabra resaltada, como en el diseño.
function TituloResaltado({ texto }) {
  const palabras = texto.split(" ");
  const ultima = palabras.pop();
  return (
    <>
      {palabras.join(" ")} <span className="text-lima">{ultima}</span>
    </>
  );
}

// Bloque desplegable con el "+" cuadrado del resto del sitio.
function Desplegable({ titulo, abierto = true, ultimo = false, children }) {
  return (
    <details
      open={abierto}
      className={`group border-t border-gris/15 ${ultimo ? "border-b" : ""}`}
    >
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-5 font-display text-xl font-bold sm:text-2xl [&::-webkit-details-marker]:hidden">
        {titulo}
        <span
          aria-hidden
          className="relative h-[34px] w-[34px] shrink-0 rounded-full bg-lima transition-transform duration-200 group-hover:scale-110 before:absolute before:left-1/2 before:top-1/2 before:h-0.5 before:w-3.5 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-noche before:content-[''] after:absolute after:left-1/2 after:top-1/2 after:h-3.5 after:w-0.5 after:-translate-x-1/2 after:-translate-y-1/2 after:bg-noche after:content-[''] group-open:after:hidden"
        />
      </summary>
      <div className="pb-6 text-base leading-relaxed text-gris/85 sm:text-[17px]">{children}</div>
    </details>
  );
}

/**
 * Ficha de un programa (/programa/:id): hero con título y video, contenido en
 * desplegables, invitados al costado y más programas de la temporada.
 */
export default function ProgramPage({ id }) {
  const [personaAbierta, setPersonaAbierta] = useState(null);
  const programa = getProgramaPorId(id);
  useEffect(() => {
    document.title = programa ? `${programa.titulo} · Código.IA` : "Nos perdimos · Código.IA";
  }, [programa]);
  const temporada = programa ? getTemporada(programa.temporadaId) : null;
  const delaTemporada = programa ? getProgramasPorTemporada(programa.temporadaId) : [];
  const numero = programa ? delaTemporada.findIndex((p) => p.id === programa.id) + 1 : 0;
  const temas = programa ? getTemasDePrograma(programa.id) : [];
  const participantes = programa ? getParticipantes(programa.id) : [];
  const invitados = participantes.filter((p) => p.rol === "invitado");
  const conduccion = participantes.filter((p) => p.rol === "conduccion");
  const extras = programa ? getRecursosExtra(programa) : [];
  const fecha = programa ? formatFecha(programa.fechaPublicacion) : null;

  return (
    <div className="min-h-screen w-full bg-noche text-gris">
      <main id="contenido" tabIndex={-1} className="outline-none">
        {!programa ? (
          <>
          <PageHeader conVolver={false} />
          <div className="mx-auto max-w-4xl px-6 py-24 text-center sm:px-10">
            <p className={`${ETIQUETA} text-lima`}>/No encontrado</p>
            <h1 className="mt-4 font-display text-3xl font-medium sm:text-5xl">
              Nos perdimos.
            </h1>
            <RouterLink
              to="/"
              className="mt-8 inline-block rounded-full border border-gris px-6 py-3 font-mono text-xs font-medium uppercase tracking-wider transition-colors duration-300 hover:border-lima hover:bg-lima hover:text-noche sm:text-sm"
            >
              Volver al inicio
            </RouterLink>
          </div>
          </>
        ) : (
          <>
            {/* Título */}
            <div className="relative overflow-hidden bg-noche text-gris">
            <Orbes />
            <div aria-hidden="true" className="tx tx-puntos absolute inset-0" />
            <div className="relative">
            <PageHeader conVolver={false} />
            <section>
              <div className="mx-auto max-w-6xl px-6 pb-10 pt-6 sm:px-10 sm:pb-12">
                <div className="flex max-w-4xl flex-col gap-5">
                  <span className={`${ETIQUETA} self-start text-lila`}>
                    /Programa {String(numero).padStart(2, "0")}
                    {temporada ? ` · ${temporada.titulo}` : ""}
                  </span>
                  <h1 className="font-display text-3xl font-semibold leading-[1.02] tracking-tight sm:text-5xl">
                    <TituloResaltado texto={programa.titulo} />
                  </h1>
                  {programa.pregunta && (
                    <p className="max-w-2xl text-xl font-medium leading-snug text-gris/90 sm:text-2xl">
                      {programa.pregunta}
                    </p>
                  )}
                  {programa.subtitulo && (
                    <p className="max-w-2xl text-base text-gris/70">{programa.subtitulo}</p>
                  )}
                  {(fecha || programa.duracion) && (
                    <div className="inline-flex flex-wrap items-center gap-4 self-start rounded-full border border-gris/20 px-5 py-2.5 font-mono text-xs uppercase tracking-wider">
                      {fecha && <span>{fecha}</span>}
                      {programa.duracion && (
                        <span className="rounded-full bg-lima px-2.5 py-0.5 text-noche">
                          {programa.duracion}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>
            </div>
            </div>

            {/* Video grande + descripción · invitados al costado */}
            <section>
              <div className="mx-auto grid max-w-6xl gap-10 px-6 pb-16 pt-10 sm:px-10 lg:grid-cols-12 lg:gap-6">
                <div className="flex flex-col gap-8 lg:col-span-9">
                  <div className="aspect-video w-full overflow-hidden rounded-3xl border border-gris/15 bg-noche shadow-[0_30px_70px_-30px_rgba(193,114,255,0.5)]">
                    {programa.linkYoutube ? (
                      <iframe
                        src={getYoutubeEmbedUrl(programa.linkYoutube)}
                        title={programa.titulo}
                        className="h-full w-full"
                        allow={IFRAME_ALLOW}
                        allowFullScreen
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gris/40">
                        Video no disponible
                      </div>
                    )}
                  </div>

                  <Texto className="max-w-3xl text-xl leading-relaxed text-gris sm:text-[22px]">
                    {programa.resumen}
                  </Texto>

                  <div>
                    {programa.descripcion && (
                      <Desplegable titulo="Sobre la entrevista">
                        <Texto>{programa.descripcion}</Texto>
                      </Desplegable>
                    )}
                    {extras.length > 0 && (
                      <Desplegable titulo="Más material" abierto={false}>
                        <div className="grid gap-6">
                          {extras.map((recurso) => (
                            <figure key={recurso.id}>
                              <div className="aspect-video w-full overflow-hidden rounded-2xl border border-gris/15 bg-noche">
                                <iframe
                                  src={urlEmbed(recurso)}
                                  title={recurso.titulo}
                                  className="h-full w-full"
                                  allow={IFRAME_ALLOW}
                                  allowFullScreen
                                />
                              </div>
                              <figcaption className="mt-2 text-sm text-gris/70">
                                {recurso.titulo}
                              </figcaption>
                            </figure>
                          ))}
                        </div>
                      </Desplegable>
                    )}
                    {temas.length > 0 && (
                      <div className="border-y border-gris/15 py-6">
                        <h2 className="mb-4 font-display text-xl font-bold sm:text-2xl">
                          {temas.length > 1 ? "Temas" : "Tema"}
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          {temas.map((t) => (
                            <RouterLink
                              key={t.id}
                              to={`/temas/${t.id}`}
                              className="rounded-full border border-lila/50 bg-lila/10 px-4 py-2 font-mono text-xs uppercase tracking-wider text-lila transition-colors hover:border-lila hover:bg-lila hover:text-noche"
                            >
                              {t.nombre}
                            </RouterLink>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <aside className="flex flex-col gap-5 lg:col-span-3 lg:col-start-10">
                  {invitados.length > 0 && (
                    <>
                      <h2 className={`${ETIQUETA} text-lima`}>/Invitados</h2>
                      {invitados.map((persona, i) => (
                        <button
                          key={persona.id}
                          type="button"
                          onClick={() => setPersonaAbierta(persona)}
                          aria-label={`Ver perfil de ${persona.nombre}`}
                          className="group overflow-hidden rounded-3xl border border-gris/15 bg-gris/5 text-left transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-lila/60 hover:shadow-[0_18px_40px_-18px_rgba(193,114,255,0.55)]"
                        >
                          <div
                            className={`relative flex aspect-[2/1] items-center justify-center overflow-hidden font-display text-4xl font-semibold text-noche ${AVATARES[i % AVATARES.length]}`}
                          >
                            {iniciales(persona.nombre)}
                          </div>
                          <div className="px-4 pb-4 pt-3">
                            <p className="font-display text-xl font-bold leading-tight">
                              {persona.nombre}
                            </p>
                            {persona.profesion && (
                              <p className="mt-1 text-sm text-gris/70">{persona.profesion}</p>
                            )}
                            <p className="mt-3 font-mono text-xs uppercase tracking-wider text-lima">
                              Conocé su perfil →
                            </p>
                          </div>
                        </button>
                      ))}
                    </>
                  )}

                  {conduccion.length > 0 && (
                    <div>
                      <h2 className={`${ETIQUETA} mb-3 text-lima`}>/Conducción</h2>
                      <div className="flex flex-wrap gap-2">
                        {conduccion.map((persona) => (
                          <PersonBadge key={persona.id}>{persona.nombre}</PersonBadge>
                        ))}
                      </div>
                    </div>
                  )}
                </aside>
              </div>
            </section>
          </>
        )}
      </main>

      <div className="pt-14">
        <Footer />
      </div>

      {personaAbierta && (
        <PersonasPage persona={personaAbierta} onCerrar={() => setPersonaAbierta(null)} />
      )}
    </div>
  );
}
