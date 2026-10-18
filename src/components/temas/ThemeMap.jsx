import { useEffect, useRef, useState } from "react";
import { ARISTAS, CENTRO, NODOS, getVecinos } from "../../servicios/mapa";
import { getProgramasDeTema } from "../../servicios/temas";
import RouterLink from "../utils/RouterLink";

// Si la persona pidió menos movimiento: sin inclinación ni paralaje, sin
// flotar, sin pulsos y los trazos punteados quedan quietos.
const REDUCIR_MOVIMIENTO =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const CANTIDAD = Object.fromEntries(
  NODOS.map((n) => [n.id, getProgramasDeTema(n.id).length])
);

// Profundidad estable por nodo (0 = lejos, 1 = cerca), derivada del id para
// que no cambie entre renders. Los temas quedan adelante, los subtemas atrás.
function hash(texto) {
  let h = 2166136261;
  for (const c of texto) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0) / 4294967295;
}
const PROFUNDIDAD = Object.fromEntries(
  NODOS.map((n) => {
    const r = hash(n.id);
    return [n.id, n.tipo === "tema" ? 0.85 + r * 0.15 : 0.3 + r * 0.45];
  })
);
PROFUNDIDAD[CENTRO.id] = 1;

// Tonos del vidrio ("r,g,b"): los temas en violeta, los subtemas en blanco
// suave y todo se enciende en lima neón al resaltarlo.
const LIMA = "196,253,54";
const LILA = "193,114,255";
const TONO = { tema: LILA, subtema: "250,250,250" };

// Las conexiones son rectas, de centro a centro (no usan los puntos de control
// de mapa.json, que las curvaban). El viewBox del svg es 1200 × 720.
const PUNTOS = Object.fromEntries(
  NODOS.map((n) => [n.id, [(n.mapa.x / 100) * 1200, (n.mapa.y / 100) * 720]])
);
PUNTOS[CENTRO.id] = [600, 360];
const trazoRecto = (e) => {
  const [x1, y1] = PUNTOS[e.de];
  const [x2, y2] = PUNTOS[e.a];
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`;
};

// Chispas del modo inmersivo: posiciones fijas repartidas por el mapa (no al
// azar, para que no cambien entre renders).
const CHISPAS = Array.from({ length: 22 }, (_, i) => ({
  left: `${(i * 53 + 17) % 100}%`,
  top: `${(i * 37 + 11) % 100}%`,
  size: 2 + (i % 3),
  delay: `${((i * 0.37) % 3.6).toFixed(2)}s`,
  color: ["#C4FD36", "#C172FF", "#FAFAFA"][i % 3],
}));

// Cuánto se corre cada capa con el mouse (px): lo cercano más, lo lejano menos.
const paralaje = (id) => ((PROFUNDIDAD[id] - 0.55) * 40).toFixed(1);

/**
 * Mapa de nodos en vidrio y neón: el núcleo "IA" al centro, los temas
 * alrededor y sus subtemas más afuera, como paneles de cristal que flotan en
 * un universo oscuro unidos por líneas de luz. El fondo, las capas y la escena
 * se mueven distinto con el mouse (paralaje + leve inclinación) y un foco de luz
 * sigue el cursor. Al pasar el cursor (o tabular) por un nodo se ilumina su
 * camino con luz que corre por las líneas y el resto se atenúa: de un subtema se
 * ilumina el camino hasta el núcleo (por sus temas) y de un tema, el camino al
 * núcleo y sus subtemas. Al hacer clic se abre la página del tema (ThemePage).
 * Los nodos, sus posiciones y las conexiones salen de temas.json y mapa.json.
 */
export default function ThemeMap({ inmersivo = false, alCambiarInmersivo }) {
  const [activo, setActivo] = useState(null);
  const raiz = useRef(null);

  // Modo inmersivo: con el mouse (o el teclado) adentro del mapa la sección se
  // oscurece y aparecen el aura y las chispas. Hay una pequeña espera para que
  // no se dispare si el cursor solo cruza el mapa.
  // Los pulsos de luz solo corren con el mapa a la vista (fuera de pantalla no gastan nada).
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = raiz.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entrada]) => setVisible(entrada.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const intencion = useRef(null);
  const entrar = (ev) => {
    if (ev.pointerType && ev.pointerType !== "mouse") return;
    clearTimeout(intencion.current);
    intencion.current = setTimeout(() => alCambiarInmersivo?.(true), 220);
  };
  const salir = () => {
    clearTimeout(intencion.current);
    intencion.current = setTimeout(() => alCambiarInmersivo?.(false), 150);
  };
  useEffect(() => () => clearTimeout(intencion.current), []);
  const encendidos = new Set(activo ? [activo, ...getVecinos(activo)] : []);

  const aristaEncendida = (e) => {
    if (activo === null) return false;
    // Del núcleo al tema encendido (el activo o el tema padre del subtema).
    if (e.de === CENTRO.id) return encendidos.has(e.a);
    // Entre el nodo activo y sus vecinos.
    return e.de === activo || e.a === activo;
  };

  // El mouse escribe su posición en variables CSS y el resto se resuelve con
  // calc() en los estilos: sin re-renders ni JS por cuadro.
  const pendiente = useRef(null);
  const marco = useRef(0);
  const mover = (ev) => {
    if (ev.pointerType !== "mouse" || !raiz.current) return;
    pendiente.current = { x: ev.clientX, y: ev.clientY };
    if (marco.current) return;
    // Se agrupa en un solo cálculo por cuadro (antes se recalculaba en cada evento).
    marco.current = requestAnimationFrame(() => {
      marco.current = 0;
      if (!raiz.current || !pendiente.current) return;
      const r = raiz.current.getBoundingClientRect();
      const x = (pendiente.current.x - r.left) / r.width;
      const y = (pendiente.current.y - r.top) / r.height;
      const s = raiz.current.style;
      s.setProperty("--px", `${(x * 100).toFixed(1)}%`);
      s.setProperty("--py", `${(y * 100).toFixed(1)}%`);
      if (REDUCIR_MOVIMIENTO) return;
      s.setProperty("--mx", (x - 0.5).toFixed(3));
      s.setProperty("--my", (y - 0.5).toFixed(3));
    });
  };
  const soltar = () => {
    cancelAnimationFrame(marco.current);
    marco.current = 0;
    const s = raiz.current?.style;
    if (!s) return;
    ["--mx", "--my"].forEach((v) => s.setProperty(v, "0"));
    ["--px", "--py"].forEach((v) => s.setProperty(v, "50%"));
  };

  return (
    <div
      ref={raiz}
      className="relative aspect-[1200/720] w-full overflow-hidden bg-[#050512] [perspective:1400px]"
      onPointerMove={mover}
      onPointerEnter={entrar}
      onPointerLeave={() => {
        soltar();
        salir();
      }}
      onFocus={() => {
        clearTimeout(intencion.current);
        alCambiarInmersivo?.(true);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) salir();
      }}
    >
      {/* Universo: noche profunda con nebulosas muy suaves (lima, azul, lila y
          un toque de naranja). Se mueve al revés que la escena. */}
      <div
        aria-hidden="true"
        className="absolute -inset-[8%] transition-[translate] duration-700 ease-out"
        style={{
          translate: "calc(var(--mx, 0) * -30px) calc(var(--my, 0) * -30px)",
          background: [
            "radial-gradient(ellipse 34% 32% at 50% 50%, rgba(196,253,54,0.10), transparent 72%)",
            "radial-gradient(ellipse 42% 40% at 20% 28%, rgba(36,0,255,0.34), transparent 70%)",
            "radial-gradient(ellipse 36% 34% at 82% 24%, rgba(193,114,255,0.18), transparent 70%)",
            "radial-gradient(ellipse 40% 42% at 80% 76%, rgba(255,107,59,0.13), transparent 70%)",
            "radial-gradient(ellipse 120% 100% at 50% 50%, #14142b 0%, #090919 55%, #030310 100%)",
          ].join(", "),
          filter: "blur(6px)",
        }}
      />
      {/* Cuadrícula fina, apenas visible, que se desvanece hacia los bordes. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-[4%] transition-[translate] duration-500 ease-out"
        style={{
          translate: "calc(var(--mx, 0) * -14px) calc(var(--my, 0) * -14px)",
          backgroundImage:
            "linear-gradient(rgba(250,250,250,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(250,250,250,0.06) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          WebkitMaskImage: "radial-gradient(ellipse 70% 65% at 50% 50%, #000 0%, transparent 85%)",
          maskImage: "radial-gradient(ellipse 70% 65% at 50% 50%, #000 0%, transparent 85%)",
        }}
      />
      {/* Foco de luz que sigue al cursor. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle 240px at var(--px, 50%) var(--py, 50%), rgba(196,253,54,0.11), transparent 70%)",
        }}
      />
      {/* Magia al interactuar: un aura que se expande desde el centro y chispas
          que titilan. Aparecen con el modo inmersivo. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
          inmersivo ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute left-1/2 top-1/2 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2">
          <div
            className="h-full w-full rounded-full transition-transform duration-1000 ease-out"
            style={{
              transform: `scale(${inmersivo ? 1 : 0.4})`,
              background:
                "radial-gradient(circle, rgba(196,253,54,0.16) 0%, rgba(193,114,255,0.12) 24%, transparent 50%)",
            }}
          />
        </div>
        {!REDUCIR_MOVIMIENTO &&
          CHISPAS.map((c, i) => (
            <span
              key={i}
              className="mapa-chispa absolute rounded-full"
              style={{
                left: c.left,
                top: c.top,
                width: c.size,
                height: c.size,
                background: c.color,
                boxShadow: `0 0 10px 2px ${c.color}`,
                animationDelay: c.delay,
              }}
            />
          ))}
      </div>
      {/* Viñeta: oscurece los bordes para dar hondura. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 55%, rgba(2,2,10,0.78) 100%)",
        }}
      />

      <div
        className="absolute inset-[3%] transition-transform duration-500 ease-out"
        style={{
          transform:
            "rotateX(calc(var(--my, 0) * -5deg)) rotateY(calc(var(--mx, 0) * 5deg))",
        }}
      >
        <svg
          viewBox="0 0 1200 720"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full overflow-visible"
          aria-hidden="true"
        >

          {ARISTAS.map((e, i) => {
            const lit = aristaEncendida(e);
            // Las líneas hacia nodos lejanos son más tenues.
            const prof = Math.min(PROFUNDIDAD[e.de], PROFUNDIDAD[e.a]);
            const opacidad = lit ? 1 : activo ? 0.05 : 0.2 + prof * 0.28;
            return (
              <g key={`${e.de}-${e.a}`}>
                {/* Brillo del camino encendido: un trazo ancho y translúcido (sin filtro de desenfoque). */}
                {lit && (
                  <path
                    d={trazoRecto(e)}
                    strokeWidth={7}
                    strokeLinecap="round"
                    className="fill-none stroke-lima"
                    style={{ opacity: 0.22 }}
                  />
                )}
                <path
                  d={trazoRecto(e)}
                  strokeWidth={lit ? 1.8 : 0.8 + prof * 0.5}
                  strokeDasharray={lit ? "7 6" : undefined}
                  strokeLinecap="round"
                  className={`fill-none transition-opacity duration-200 ${lit ? "stroke-lima" : "stroke-gris"}`}
                  style={{ opacity: opacidad }}
                >
                  {/* Con el camino encendido, la luz corre desde el núcleo hacia
                      afuera (7 + 6 = un ciclo del punteado). */}
                  {lit && !REDUCIR_MOVIMIENTO && (
                    <animate
                      attributeName="stroke-dashoffset"
                      from="0"
                      to="-13"
                      dur="0.7s"
                      repeatCount="indefinite"
                    />
                  )}
                </path>
                {/* Pulso de luz que recorre la línea de vez en cuando. */}
                {visible && !lit && !activo && !REDUCIR_MOVIMIENTO && (
                  <path
                    d={trazoRecto(e)}
                    pathLength="100"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeDasharray="5 95"
                    className="fill-none stroke-lima"
                    style={{ opacity: 0.6 }}
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="5"
                      to="-100"
                      dur={`${(5 + hash(`${e.de}${e.a}`) * 4).toFixed(2)}s`}
                      begin={`${(-hash(`${e.a}${e.de}`) * 8).toFixed(2)}s`}
                      repeatCount="indefinite"
                    />
                  </path>
                )}
              </g>
            );
          })}
        </svg>

        {/* Órbitas: anillos casi invisibles que giran muy despacio alrededor del núcleo.
            Son elementos HTML (no SVG) para que giren en el compositor del navegador. */}
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[28.33%] -translate-x-1/2 -translate-y-1/2">
          <div className="mapa-girar h-full w-full rounded-full border-2 border-dotted border-gris/15" />
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="mapa-girar-inverso h-full w-full rounded-full border-2 border-dotted border-lima/10" />
        </div>

        {/* Núcleo: panel de cristal con un anillo que gira y un halo que respira. */}
        <span
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            translate: "calc(var(--mx, 0) * 12px) calc(var(--my, 0) * 12px)",
            transition: "translate 400ms ease-out",
          }}
        >
          <span
            aria-hidden="true"
            className="mapa-respirar absolute left-1/2 top-1/2 -ml-[120px] -mt-[120px] h-[240px] w-[240px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(196,253,54,0.34) 0%, rgba(196,253,54,0.08) 42%, transparent 70%)",
            }}
          />
          <span
            aria-hidden="true"
            className="mapa-girar absolute -inset-3.5 rounded-[40px] border border-dashed border-lima/40"
          />
          <span
            className="mapa-vidrio mapa-vidrio--blur relative flex h-24 w-24 items-center justify-center rounded-[30px] font-display text-[34px] font-semibold text-lima"
            style={{ "--tono": LIMA, "--brillo": 0.5, textShadow: "0 0 18px rgba(196,253,54,0.9)" }}
          >
            {CENTRO.etiqueta}
          </span>
        </span>
        <span className="absolute left-1/2 top-[calc(50%+78px)] -translate-x-1/2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-gris/75">
          {CENTRO.leyenda}
        </span>

        {NODOS.map((nodo) => {
          const lit = encendidos.has(nodo.id);
          const dim = activo !== null && !lit;
          const enfocado = activo === nodo.id;
          const prof = PROFUNDIDAD[nodo.id];
          const esTema = nodo.tipo === "tema";
          const cantidad = CANTIDAD[nodo.id];
          return (
            <RouterLink
              key={nodo.id}
              to={`/temas/${nodo.id}`}
              aria-label={`${esTema ? "Tema" : "Subtema"}: ${nodo.nombre}. ${cantidad} ${cantidad === 1 ? "programa" : "programas"}`}
              style={{
                left: `${nodo.mapa.x}%`,
                top: `${nodo.mapa.y}%`,
                filter: dim ? "blur(1.2px)" : undefined,
              }}
              className={[
                "group absolute -translate-x-1/2 -translate-y-1/2 outline-none transition-[opacity,filter] duration-300",
                lit ? "z-[2]" : "",
                dim ? "opacity-25" : "opacity-100",
              ].join(" ")}
              onMouseEnter={() => setActivo(nodo.id)}
              onFocus={() => setActivo(nodo.id)}
              onMouseLeave={() => setActivo(null)}
              onBlur={() => setActivo(null)}
            >
              {/* Capa de paralaje: se corre con el mouse según su profundidad. */}
              <span
                aria-hidden="true"
                className="block"
                style={{
                  translate: `calc(var(--mx, 0) * ${paralaje(nodo.id)}px) calc(var(--my, 0) * ${paralaje(nodo.id)}px)`,
                  transition: "translate 400ms ease-out",
                }}
              >
                <span
                  className="mapa-flotar block"
                  style={{ animationDelay: `${(-hash(nodo.id) * 6).toFixed(2)}s` }}
                >
                  <span
                    data-lit={lit}
                    className={[
                      "mapa-vidrio flex items-center gap-2 whitespace-nowrap",
                      "group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-4 group-focus-visible:outline-lima",
                      esTema
                        ? "rounded-[18px] px-4 py-2.5 font-display text-[13px] font-semibold uppercase tracking-[0.05em]"
                        : "rounded-full px-3 py-1.5 font-sans text-[12px] font-medium",
                      lit ? "text-lima" : "text-gris",
                    ].join(" ")}
                    style={{
                      "--tono": lit ? LIMA : TONO[nodo.tipo],
                      "--brillo": esTema ? 0.32 : 0.08 + prof * 0.06,
                      transform: `scale(${enfocado ? 1.14 : esTema ? 1 : 0.88 + prof * 0.12})`,
                      textShadow: lit ? "0 0 14px rgba(196,253,54,0.8)" : "0 1px 8px rgba(3,3,16,0.8)",
                    }}
                  >
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full transition-[background-color,box-shadow] duration-300 ${
                        lit ? "bg-lima shadow-[0_0_10px_2px_rgba(196,253,54,0.9)]" : esTema ? "bg-lila shadow-[0_0_8px_1px_rgba(193,114,255,0.8)]" : "bg-gris/60"
                      }`}
                    />
                    {nodo.nombre}
                  </span>
                </span>
              </span>
              {/* Onda de luz que sale del nodo al apuntarlo. */}
              {enfocado && !REDUCIR_MOVIMIENTO && (
                <span
                  aria-hidden="true"
                  className="mapa-onda pointer-events-none absolute left-1/2 top-1/2 h-14 w-14 rounded-full border border-lima/60"
                />
              )}
              {/* Cantidad de programas: aparece al apuntar al nodo. */}
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full border border-lima/40 bg-noche/70 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-lima transition-all duration-200 ${
                  enfocado ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
                }`}
              >
                {cantidad} {cantidad === 1 ? "programa" : "programas"}
              </span>
            </RouterLink>
          );
        })}
      </div>
    </div>
  );
}
