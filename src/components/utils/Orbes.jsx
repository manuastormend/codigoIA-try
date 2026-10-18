/**
 * Fondo decorativo suave para los héroes oscuros: tres manchas de color
 * (lila, azul y naranja de la paleta). Es solo adorno.
 *
 * Rendimiento: cada mancha es un degradé radial (no un círculo con filtro
 * blur): se ve igual de suave pero el navegador no tiene que desenfocar
 * capas enormes, algo muy caro en celulares.
 */
export default function Orbes({ className = "" }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div
        className="absolute -right-[114px] -top-[222px] h-[620px] w-[620px] rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(193,114,255,0.35), rgba(193,114,255,0.12) 55%, transparent)" }}
      />
      <div
        className="absolute -left-[240px] top-[calc(33.333%-80px)] h-[540px] w-[540px] rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(36,0,255,0.45), rgba(36,0,255,0.15) 55%, transparent)" }}
      />
      <div
        className="absolute -bottom-[200px] right-[calc(25%-70px)] h-[460px] w-[460px] rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(255,107,59,0.2), rgba(255,107,59,0.07) 55%, transparent)" }}
      />
    </div>
  );
}
