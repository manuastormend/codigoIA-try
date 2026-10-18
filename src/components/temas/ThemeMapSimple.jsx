import { useState } from "react";
import { CENTRO, NODOS } from "../../servicios/mapa";
import { useMediaQuery } from "../../servicios/medios";
import RouterLink from "../utils/RouterLink";

/**
 * Mapa de temas SIMPLE para celular y tablet (versión de prueba).
 *
 * Solo lo esencial: la IA en el medio y los 8 temas grandes alrededor, cada
 * uno unido por una línea muy fina que se mueve (un pulso viaja de la IA al
 * tema). Cada tema es un link directo a
 * /temas/:id. Sin subtemas, sin conexiones entre temas, sin framer-motion:
 * un SVG de flechas y botones HTML.
 *
 * Los ángulos salen de la posición de cada tema en el mapa de PC
 * (temas.json → `mapa`), así que el orden alrededor de la IA es el mismo.
 */

// El lienzo mide 100 x 120 unidades (proporción 5:6, como el contenedor).
const W = 100;
const H = 120;
const CX = W / 2;
const CY = H / 2;
const RX = 30; // radio horizontal del anillo de temas
const RY = 40; // radio vertical
const R_IA = 9.5; // desde dónde sale la línea (borde del círculo IA)

// Celular (< 768 px): posiciones propias, en filas, para que las etiquetas
// (que son anchas) no se pisen. Siguen el orden del anillo: Infancia arriba,
// Arte abajo, y de a pares a los costados. Valores en unidades del lienzo.
const POS_CELULAR = {
  infancia: [50, 8],
  fraudes: [25, 30],
  educacion: [77, 30],
  "salud-mental": [21, 60],
  chatbots: [80, 60],
  amor: [28, 88],
  musica: [74, 88],
  arte: [50, 110],
};

// Tablet (>= 768 px): anillo elíptico, con el ángulo de cada tema en el mapa de PC.
function posicionAnillo(n) {
  const ang = Math.atan2(((n.mapa.y - 50) / 100) * 720, ((n.mapa.x - 50) / 100) * 1200);
  return [CX + RX * Math.cos(ang), CY + RY * Math.sin(ang)];
}

function armarTemas(celular) {
  return NODOS.filter((n) => n.tipo === "tema").map((n) => {
    const [x, y] = (celular && POS_CELULAR[n.id]) || posicionAnillo(n);
    const dx = x - CX;
    const dy = y - CY;
    const t0 = R_IA / Math.hypot(dx, dy);
    return {
      ...n,
      x,
      y,
      x1: CX + dx * t0,
      y1: CY + dy * t0,
      // La línea llega hasta el centro del tema: la etiqueta (opaca) la tapa.
      x2: x,
      y2: y,
    };
  });
}

const TEMAS_CELULAR = armarTemas(true);
const TEMAS_TABLET = armarTemas(false);

export default function ThemeMapSimple() {
  const [sel, setSel] = useState(null);
  const esTablet = useMediaQuery("(min-width: 768px)");
  const TEMAS = esTablet ? TEMAS_TABLET : TEMAS_CELULAR;

  return (
    <div
      role="group"
      aria-label="Mapa de temas simplificado"
      className="relative mx-auto aspect-[5/6] w-full max-w-[460px] overflow-hidden rounded-3xl bg-[#0b0b22] [background-image:radial-gradient(rgba(250,250,250,0.1)_1px,transparent_1.5px)] [background-size:22px_22px] md:max-w-[560px]"
    >
      <style>{`
        @keyframes simple-pulso { to { stroke-dashoffset: -8.6; } }
        @keyframes simple-brillo { 0%, 100% { opacity: .55; transform: scale(1); } 50% { opacity: 1; transform: scale(1.12); } }
        .simple-pulso { animation: simple-pulso 1.6s linear infinite; }
        .simple-brillo { animation: simple-brillo 4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .simple-pulso, .simple-brillo { animation: none; } }
      `}</style>
      <svg aria-hidden viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full">
        {TEMAS.map((t) => {
          const activo = sel === t.id;
          return (
            <g key={t.id}>
              <line
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke={activo ? "#C4FD36" : "#C172FF"}
                strokeOpacity={activo ? 0.9 : 0.35}
                strokeWidth="0.25"
                strokeLinecap="round"
              />
              <line
                className="simple-pulso"
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke={activo ? "#C4FD36" : "#E3C4FF"}
                strokeWidth="0.4"
                strokeLinecap="round"
                strokeDasharray="1.6 7"
              />
            </g>
          );
        })}
      </svg>

      {/* Núcleo con resplandor verde */}
      <div
        style={{ left: `${CX}%`, top: `${(CY / H) * 100}%` }}
        className="absolute h-16 w-16 -translate-x-1/2 -translate-y-1/2 md:h-24 md:w-24"
      >
        <span
          aria-hidden
          className="simple-brillo absolute -inset-5 rounded-full bg-[radial-gradient(circle,rgba(196,253,54,0.55)_0%,rgba(196,253,54,0.18)_45%,transparent_70%)] md:-inset-8"
        />
        <div className="relative flex h-full w-full items-center justify-center rounded-full bg-lima font-display text-2xl font-semibold text-noche shadow-[0_0_26px_rgba(196,253,54,0.75),0_0_60px_rgba(196,253,54,0.35)] md:text-4xl">
          <span aria-hidden>{CENTRO.etiqueta}</span>
          <span className="sr-only">{CENTRO.leyenda}</span>
        </div>
      </div>

      {/* Temas: cada uno es un link directo a su página. */}
      {TEMAS.map((t) => (
        <RouterLink
          key={t.id}
          to={`/temas/${t.id}`}
          style={{ left: `${(t.x / W) * 100}%`, top: `${(t.y / H) * 100}%` }}
          onFocus={() => setSel(t.id)}
          onBlur={() => setSel(null)}
          onPointerDown={() => setSel(t.id)}
          onPointerLeave={() => setSel(null)}
          className={`absolute inline-flex min-h-11 -translate-x-1/2 -translate-y-1/2 items-center whitespace-nowrap rounded-full border px-3 py-2 text-sm font-medium leading-none outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-lima motion-reduce:transition-none md:min-h-12 md:px-5 md:text-base ${
            sel === t.id ? "border-lima bg-lima text-noche" : "border-lila/70 bg-[#1d1245] text-gris"
          }`}
        >
          {t.nombre}
        </RouterLink>
      ))}
    </div>
  );
}
