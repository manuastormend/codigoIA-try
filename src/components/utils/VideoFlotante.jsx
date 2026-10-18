import { useEffect } from "react";
import { getYoutubeId } from "../../servicios/youtube";

/**
 * Cuadro de video flotante (abajo a la derecha): solo el video y una cruz
 * para cerrarlo. Arranca solo en `inicio` segundos.
 */
export default function VideoFlotante({ url, inicio = 0, titulo, onCerrar }) {
  const id = getYoutubeId(url);

  useEffect(() => {
    const alTeclear = (e) => e.key === "Escape" && onCerrar?.();
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [onCerrar]);

  if (!id) return null;

  return (
    <div
      role="dialog"
      aria-label={titulo ? `Video: ${titulo}` : "Video"}
      className="fixed bottom-4 right-4 z-50 w-[min(92vw,420px)] overflow-visible rounded-2xl border border-gris/25 bg-noche shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
    >
      <button
        type="button"
        onClick={onCerrar}
        aria-label="Cerrar video"
        className="absolute -top-3 right-2 z-10 grid h-9 w-9 -translate-y-full place-items-center rounded-full bg-gris font-mono text-base text-noche shadow-suave transition-colors hover:bg-lima"
      >
        ✕
      </button>
      <div className="aspect-video w-full overflow-hidden rounded-2xl">
        <iframe
          key={`${id}-${inicio}`}
          className="h-full w-full"
          src={`https://www.youtube.com/embed/${id}?start=${Math.floor(inicio)}&autoplay=1&rel=0&playsinline=1`}
          title={titulo || "Reproductor de YouTube"}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    </div>
  );
}
