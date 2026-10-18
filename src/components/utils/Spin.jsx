/**
 * Envuelve cualquier contenido (pensado para un logo/isotipo decorativo) y
 * lo hace girar sobre su propio eje en loop infinito, a velocidad
 * constante. El tamaño y la posición se definen con `className` sobre este
 * wrapper (ancho/alto/absolute/etc.), no sobre el contenido.
 *
 * Rendimiento: el giro es una animación CSS (clase .girar en index.css) que
 * corre en el compositor del navegador; antes era una animación de
 * framer-motion que actualizaba el DOM desde JavaScript en cada cuadro. Con
 * "reducir movimiento" no gira.
 *
 * Uso:
 *   <Spin className="absolute h-40 w-40 text-azul/15" durationSeconds={50}>
 *     <Isotipo className="h-full w-full" />
 *   </Spin>
 */
export default function Spin({
  className = "",
  durationSeconds = 40,
  reverse = false,
  children,
}) {
  return (
    <div
      className={`girar ${className}`}
      style={{
        animationDuration: `${durationSeconds}s`,
        animationDirection: reverse ? "reverse" : "normal",
      }}
    >
      {children}
    </div>
  );
}
