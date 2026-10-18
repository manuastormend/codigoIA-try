import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ARISTAS, CENTRO, NODOS, getVecinos } from "../../servicios/mapa";
import { getProgramasDeTema } from "../../servicios/temas";
import RouterLink from "../utils/RouterLink";

// Si la persona pidió menos movimiento, los trazos punteados quedan quietos y
// no hay ondas ni chispas.
const REDUCIR_MOVIMIENTO =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const LIMA = "196,253,54";
const LILA = "193,114,255";
const BLANCO = "250,250,250";

// ── Geometría en vertical ───────────────────────────────────────────────────
// Tres columnas: el núcleo IA arriba a la izquierda con un tronco que baja,
// los temas en el medio y los subtemas a la derecha. Las posiciones se
// calculan solas a partir de las conexiones de mapa.json (no usa las
// coordenadas de escritorio).
const ANCHO = 360;
const X_TRONCO = 34;
const X_TEMA = 124;
const X_SUB = 292;
const ANCHO_TEMA = 108;
const ANCHO_SUB = 122;
const Y_INICIO = 140;
const SEPARACION = 60;

const TEMAS = NODOS.filter((n) => n.tipo === "tema");
const SUBTEMAS = NODOS.filter((n) => n.tipo !== "tema");
const esTema = (id) => TEMAS.some((t) => t.id === id);

// Orden de las columnas: se ordenan temas y subtemas por el promedio de la
// posición de sus conexiones (heurística del baricentro) para que las líneas
// se crucen lo menos posible.
const vecinosEn = (id, otros) =>
  ARISTAS.filter((e) => e.de === id || e.a === id)
    .map((e) => (e.de === id ? e.a : e.de))
    .filter((v) => otros.includes(v));
const promedioIdx = (id, otros) => {
  const idx = vecinosEn(id, otros).map((v) => otros.indexOf(v));
  return idx.length ? idx.reduce((a, b) => a + b, 0) / idx.length : otros.length;
};
let ordenTemas = TEMAS.map((t) => t.id);
let ordenSubs = SUBTEMAS.map((s) => s.id);
for (let i = 0; i < 6; i++) {
  ordenSubs = [...ordenSubs].sort((a, b) => promedioIdx(a, ordenTemas) - promedioIdx(b, ordenTemas));
  ordenTemas = [...ordenTemas].sort((a, b) => promedioIdx(a, ordenSubs) - promedioIdx(b, ordenSubs));
}

// La geometría se calcula con dos medidas: la normal (tarjeta en la página) y la
// compacta (pantalla completa), que junta las filas para que el mapa entero
// entre en la pantalla del celular sin scroll.
function calcularGeometria({ yInicio, separacion, yNucleo }) {
  const pos = { [CENTRO.id]: { x: X_TRONCO, y: yNucleo } };
  ordenSubs.forEach((id, i) => {
    pos[id] = { x: X_SUB, y: yInicio + i * separacion };
  });
  // Cada tema queda a la altura promedio de los subtemas que conecta, sin pisarse.
  const promedio = (id) => {
    const ys = ARISTAS.filter((e) => e.de === id || e.a === id)
      .map((e) => (e.de === id ? e.a : e.de))
      .filter((v) => pos[v])
      .map((v) => pos[v].y);
    return ys.length ? ys.reduce((a, b) => a + b, 0) / ys.length : yInicio;
  };
  let previo = yInicio - separacion;
  ordenTemas.forEach((id) => {
    previo = Math.max(promedio(id), previo + separacion);
    pos[id] = { x: X_TEMA, y: previo };
  });
  const alto = Math.max(...Object.values(pos).map((p) => p.y)) + separacion - 8;
  const yTroncoFin = Math.max(...TEMAS.map((t) => pos[t.id].y));
  return { pos, alto, yTroncoFin };
}
const GEO = calcularGeometria({ yInicio: 140, separacion: 60, yNucleo: 46 });
const GEO_COMPACTA = calcularGeometria({ yInicio: 92, separacion: 42, yNucleo: 34 });

const CANTIDAD = Object.fromEntries(
  NODOS.map((n) => [n.id, getProgramasDeTema(n.id).length])
);

// Conexiones tema ↔ subtema (rectas, de borde a borde) y ramas del tronco.
const CONEXIONES = ARISTAS.filter((e) => e.de !== CENTRO.id).map((e) => {
  const tema = esTema(e.de) ? e.de : e.a;
  const sub = tema === e.de ? e.a : e.de;
  return { tema, sub };
}).filter((c) => GEO.pos[c.tema] && GEO.pos[c.sub]);

const pct = (v, total) => `${((v / total) * 100).toFixed(2)}%`;

/** Fondo "universo": noche profunda con nebulosas suaves y una cuadrícula fina. */
function Universo() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 70% 30% at 15% 8%, rgba(196,253,54,0.10), transparent 70%)",
            "radial-gradient(ellipse 80% 35% at 10% 45%, rgba(36,0,255,0.30), transparent 70%)",
            "radial-gradient(ellipse 70% 30% at 90% 70%, rgba(193,114,255,0.18), transparent 70%)",
            "radial-gradient(ellipse 60% 25% at 20% 95%, rgba(255,107,59,0.12), transparent 70%)",
            "linear-gradient(180deg, #12122a 0%, #080818 55%, #040410 100%)",
          ].join(", "),
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(250,250,250,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(250,250,250,0.05) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          WebkitMaskImage: "linear-gradient(180deg, #000, transparent 95%)",
          maskImage: "linear-gradient(180deg, #000, transparent 95%)",
        }}
      />
    </>
  );
}

/** La red: núcleo, tronco, conexiones y nodos. Un toque llama a `alElegir(id, evento)`. */
function Red({ activo, alElegir, compacto = false }) {
  const { pos: POS, alto: ALTO, yTroncoFin: Y_TRONCO_FIN } = compacto ? GEO_COMPACTA : GEO;
  const encendidos = new Set(activo ? [activo, ...getVecinos(activo)] : []);
  const conexionEncendida = (c) => activo !== null && (c.tema === activo || c.sub === activo);

  return (
    <div className="relative mx-auto w-full max-w-[420px] px-0 pt-2" style={{ aspectRatio: `${ANCHO} / ${ALTO}` }}>
      <svg
        viewBox={`0 0 ${ANCHO} ${ALTO}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full overflow-visible"
        aria-hidden="true"
      >

        {/* Tronco que baja del núcleo y una rama hacia cada tema. */}
        <line
          x1={X_TRONCO}
          y1={POS[CENTRO.id].y}
          x2={X_TRONCO}
          y2={Y_TRONCO_FIN}
          stroke="#FAFAFA"
          strokeWidth="1"
          strokeLinecap="round"
          style={{ opacity: activo ? 0.12 : 0.35 }}
        />
        {TEMAS.map((t) => {
          const lit = encendidos.has(t.id);
          const y = POS[t.id].y;
          return (
            <g key={t.id}>
              {lit && (
                <line
                  x1={X_TRONCO}
                  y1={y}
                  x2={X_TEMA - ANCHO_TEMA / 2}
                  y2={y}
                  strokeWidth={6}
                  strokeLinecap="round"
                  className="stroke-lima"
                  style={{ opacity: 0.22 }}
                />
              )}
              <line
                x1={X_TRONCO}
                y1={y}
                x2={X_TEMA - ANCHO_TEMA / 2}
                y2={y}
                strokeWidth={lit ? 1.8 : 1}
                strokeLinecap="round"
                strokeDasharray={lit ? "6 5" : undefined}
                className={lit ? "stroke-lima" : "stroke-gris"}
                style={{ opacity: lit ? 1 : activo ? 0.1 : 0.35 }}
              >
                {lit && !REDUCIR_MOVIMIENTO && (
                  <animate attributeName="stroke-dashoffset" from="0" to="-11" dur="0.7s" repeatCount="indefinite" />
                )}
              </line>
              <circle
                cx={X_TRONCO}
                cy={y}
                r={lit ? 3.5 : 2.5}
                className={lit ? "fill-lima" : "fill-gris"}
                style={{ opacity: lit ? 1 : activo ? 0.15 : 0.7 }}
              />
            </g>
          );
        })}

        {/* Conexiones tema ↔ subtema: rectas, de borde a borde. */}
        {CONEXIONES.map((c) => {
          const lit = conexionEncendida(c);
          const a = POS[c.tema];
          const b = POS[c.sub];
          return (
            <g key={`${c.tema}-${c.sub}`}>
              {lit && (
                <line
                  x1={a.x + ANCHO_TEMA / 2}
                  y1={a.y}
                  x2={b.x - ANCHO_SUB / 2}
                  y2={b.y}
                  strokeWidth={6}
                  strokeLinecap="round"
                  className="stroke-lima"
                  style={{ opacity: 0.22 }}
                />
              )}
              <line
              x1={a.x + ANCHO_TEMA / 2}
              y1={a.y}
              x2={b.x - ANCHO_SUB / 2}
              y2={b.y}
              strokeWidth={lit ? 1.8 : 1}
              strokeLinecap="round"
              strokeDasharray={lit ? "6 5" : undefined}
              className={lit ? "stroke-lima" : "stroke-gris"}
              style={{ opacity: lit ? 1 : activo ? 0.08 : 0.3 }}
            >
              {lit && !REDUCIR_MOVIMIENTO && (
                <animate attributeName="stroke-dashoffset" from="0" to="-11" dur="0.7s" repeatCount="indefinite" />
              )}
            </line>
            </g>
          );
        })}
      </svg>

      {/* Núcleo */}
      <span
        className={`mapa-vidrio absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center font-display font-semibold text-lima ${
          compacto ? "h-11 w-11 rounded-2xl text-base" : "h-14 w-14 rounded-[20px] text-xl"
        }`}
        style={{
          left: pct(POS[CENTRO.id].x, ANCHO),
          top: pct(POS[CENTRO.id].y, ALTO),
          "--tono": LIMA,
          "--brillo": 0.5,
          textShadow: "0 0 14px rgba(196,253,54,0.9)",
        }}
      >
        {CENTRO.etiqueta}
      </span>
      <span
        className="absolute -translate-y-1/2 font-mono text-[10px] font-semibold uppercase leading-tight tracking-[0.1em] text-gris/70"
        style={{ left: pct(X_TRONCO + 44, ANCHO), top: pct(POS[CENTRO.id].y, ALTO), maxWidth: "9rem" }}
      >
        {CENTRO.leyenda}
      </span>

      {NODOS.map((nodo) => {
        const tema = nodo.tipo === "tema";
        const lit = encendidos.has(nodo.id);
        const dim = activo !== null && !lit;
        const elegido = activo === nodo.id;
        return (
          <button
            key={nodo.id}
            type="button"
            aria-pressed={elegido}
            aria-label={`${tema ? "Tema" : "Subtema"}: ${nodo.nombre}`}
            onClick={(ev) => alElegir(nodo.id, ev)}
            data-lit={lit}
            className={[
              "mapa-vidrio absolute flex items-center justify-center text-center leading-[1.15] transition-opacity duration-300",
              tema
                ? compacto
                  ? "min-h-[36px] rounded-[14px] px-1.5 py-1 font-display text-[10px] font-semibold uppercase tracking-[0.03em]"
                  : "min-h-[44px] rounded-[16px] px-2 py-2 font-display text-[11px] font-semibold uppercase tracking-[0.04em]"
                : compacto
                  ? "min-h-[36px] rounded-xl px-2 py-1 font-sans text-[10px] font-medium"
                  : "min-h-[44px] rounded-2xl px-2.5 py-2 font-sans text-[11px] font-medium",
              lit ? "z-[2] text-lima" : "text-gris",
              dim ? "opacity-30" : "opacity-100",
            ].join(" ")}
            style={{
              left: pct(POS[nodo.id].x, ANCHO),
              top: pct(POS[nodo.id].y, ALTO),
              width: `${((tema ? ANCHO_TEMA : ANCHO_SUB) / ANCHO) * 100}%`,
              "--tono": lit ? LIMA : tema ? LILA : BLANCO,
              "--brillo": tema ? 0.3 : 0.1,
              transform: `translate(-50%, -50%) scale(${elegido ? 1.06 : 1})`,
              textShadow: lit ? "0 0 12px rgba(196,253,54,0.8)" : "0 1px 6px rgba(3,3,16,0.8)",
            }}
          >
            {nodo.nombre}
          </button>
        );
      })}
    </div>
  );
}

/** Ficha del nodo elegido: el toque ilumina, este botón abre el tema. */
function Ficha({ activo, compacto = false, className = "" }) {
  const nodo = NODOS.find((n) => n.id === activo);
  return (
    <div
      className={`relative border-t border-gris/10 bg-noche/80 px-4 ${compacto ? "py-2.5" : "py-4"} ${className}`}
      aria-live="polite"
    >
      {nodo ? (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-widest text-lima">
              /{nodo.tipo === "tema" ? "Tema" : "Subtema"} · {CANTIDAD[nodo.id]}{" "}
              {CANTIDAD[nodo.id] === 1 ? "programa" : "programas"}
            </p>
            <p className="truncate font-display text-lg font-semibold leading-tight text-gris">{nodo.nombre}</p>
          </div>
          <RouterLink
            to={`/temas/${nodo.id}`}
            className="shrink-0 rounded-full bg-lima px-5 py-2.5 text-sm font-medium text-noche transition-transform duration-200 active:scale-95"
          >
            Meterse en el tema →
          </RouterLink>
        </div>
      ) : (
        <p className="text-center font-mono text-[11px] uppercase tracking-widest text-gris/60">
          Tocá un nodo y mirá cómo se conecta todo
        </p>
      )}
    </div>
  );
}

// Chispas que titilan alrededor del panel: posiciones fijas repartidas por el
// espacio (no al azar, para que no cambien entre renders).
const CHISPAS = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 53 + 17) % 100}%`,
  top: `${(i * 37 + 11) % 100}%`,
  size: 2 + (i % 3),
  delay: `${((i * 0.37) % 3.6).toFixed(2)}s`,
  color: ["#C4FD36", "#C172FF", "#FAFAFA"][i % 3],
}));

/**
 * Pantalla completa del mapa (celular): el fondo se oscurece y se desenfoca, una
 * onda de luz sale del nodo tocado, aparece un panel de cristal con el mapa y
 * titilan chispas alrededor. Se cierra con la cruz, Esc o tocando afuera.
 */
// Ancho del panel para que el mapa entero entre en la pantalla visible (con las
// barras del navegador del celular): se mide el alto real, se descuentan la
// cabecera y la ficha del panel y se respeta un ancho mínimo y máximo.
const RESERVA_PANEL_PX = 158;
function calcularAnchoPanel() {
  const alto = window.visualViewport?.height ?? window.innerHeight;
  const porAlto = ((alto - RESERVA_PANEL_PX) * ANCHO) / GEO_COMPACTA.alto;
  const porAncho = Math.min(window.innerWidth - 24, 420);
  return Math.round(Math.max(280, Math.min(porAlto, porAncho)));
}

function PantallaCompleta({ activo, alElegir, alCerrar, origen }) {
  const botonCerrar = useRef(null);
  const dialogo = useRef(null);
  const [anchoPanel, setAnchoPanel] = useState(calcularAnchoPanel);
  useEffect(() => {
    const alRedimensionar = () => setAnchoPanel(calcularAnchoPanel());
    window.addEventListener("resize", alRedimensionar);
    window.visualViewport?.addEventListener("resize", alRedimensionar);
    return () => {
      window.removeEventListener("resize", alRedimensionar);
      window.visualViewport?.removeEventListener("resize", alRedimensionar);
    };
  }, []);

  useEffect(() => {
    const previo = document.activeElement;
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // El resto de la página queda "inerte": ni foco ni lector de pantalla.
    document.getElementById("root")?.setAttribute("inert", "");
    const alTeclear = (e) => {
      if (e.key === "Escape") {
        alCerrar();
        return;
      }
      if (e.key !== "Tab" || !dialogo.current) return;
      // El foco da la vuelta adentro del diálogo.
      const enfocables = [...dialogo.current.querySelectorAll("button, a[href]")].filter(
        (el) => !el.disabled && el.offsetParent !== null
      );
      if (enfocables.length === 0) return;
      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };
    window.addEventListener("keydown", alTeclear);
    botonCerrar.current?.focus();
    return () => {
      document.body.style.overflow = overflowPrevio;
      document.getElementById("root")?.removeAttribute("inert");
      window.removeEventListener("keydown", alTeclear);
      previo?.focus?.();
    };
  }, [alCerrar]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Mapa de temas"
      ref={dialogo}
      className="fixed inset-0 z-[80] overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Fondo oscurecido y desenfocado */}
      <div aria-hidden="true" className="fixed inset-0 bg-[#02020c]/90" />

      {/* Aura que se expande desde el centro */}
      <div aria-hidden="true" className="pointer-events-none fixed left-1/2 top-1/2 h-[110vmax] w-[110vmax] -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="h-full w-full rounded-full"
          initial={{ scale: 0.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background:
              "radial-gradient(circle, rgba(196,253,54,0.14) 0%, rgba(193,114,255,0.11) 22%, transparent 48%)",
          }}
        />
      </div>

      {/* Ondas de luz desde el nodo tocado y chispas (solo con movimiento normal) */}
      {!REDUCIR_MOVIMIENTO && (
        <>
          {[0, 0.22, 0.44].map((retraso) => (
            <span
              key={retraso}
              aria-hidden="true"
              className="mapa-onda pointer-events-none fixed h-24 w-24 rounded-full border border-lima/60"
              style={{ left: origen.x, top: origen.y, animationDelay: `${retraso}s` }}
            />
          ))}
          <div aria-hidden="true" className="pointer-events-none fixed inset-0">
            {CHISPAS.map((c, i) => (
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
        </>
      )}

      <div
        className="relative flex min-h-full items-center justify-center px-3 py-4"
        onClick={(e) => e.target === e.currentTarget && alCerrar()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ type: "spring", stiffness: 230, damping: 26 }}
          className="relative overflow-hidden rounded-[28px] border border-lima/30 bg-gradient-to-br from-gris/[0.14] via-gris/[0.04] to-gris/[0.08] bg-[#0c0c1f]/70 shadow-[0_30px_90px_rgba(0,0,0,0.6),0_0_70px_rgba(196,253,54,0.16)]"
          style={{
            width: anchoPanel,
          }}
        >
          {/* Reflejo de cristal */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: "linear-gradient(112deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 34%)" }}
          />
          <header className="relative flex items-center justify-between px-4 pt-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-gris/70">/Mapa de temas</p>
            <button
              ref={botonCerrar}
              type="button"
              onClick={alCerrar}
              aria-label="Cerrar mapa"
              className="grid h-11 w-11 place-items-center rounded-full border border-gris/30 bg-noche/40 font-mono text-base text-gris transition-colors hover:border-lima hover:bg-lima hover:text-noche"
            >
              ✕
            </button>
          </header>
          <Red activo={activo} alElegir={alElegir} compacto />
          <Ficha activo={activo} compacto className="sticky bottom-0" />
        </motion.div>
      </div>
    </motion.div>
  );
}

/**
 * Mapa de temas para celular: la misma red en vidrio y neón, pero en vertical
 * y pensada para el dedo. El primer toque sobre un nodo abre el mapa a pantalla
 * completa (fondo oscurecido, cristal y destellos); ahí cada toque ilumina los
 * caminos del nodo y la ficha de abajo abre el tema.
 */
export default function ThemeMapMovil() {
  const [activo, setActivo] = useState(null);
  const [abierto, setAbierto] = useState(false);
  const [origen, setOrigen] = useState({ x: 0, y: 0 });

  const cerrar = useCallback(() => setAbierto(false), []);

  const elegir = (id, ev) => {
    setActivo((actual) => (actual === id ? null : id));
    if (!abierto) {
      const r = ev.currentTarget.getBoundingClientRect();
      setOrigen({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      setAbierto(true);
    }
  };

  return (
    <>
      <div
        className="relative overflow-hidden rounded-3xl bg-[#050512] shadow-suave-lg"
        inert={abierto ? "" : undefined}
      >
        <Universo />
        <Red activo={activo} alElegir={elegir} />
        <Ficha activo={activo} />
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {abierto && (
              <PantallaCompleta activo={activo} alElegir={elegir} alCerrar={cerrar} origen={origen} />
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
