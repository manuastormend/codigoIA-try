// Separación entre el inicio del pulso de una letra y la siguiente: esto es
// lo que genera el efecto de "ola" recorriendo la palabra.
const STAGGER_S = 0.06;

/**
 * Envuelve texto corto con una animación de "latido" letra por letra: cada
 * carácter pulsa (escala) con un leve corrimiento respecto al anterior,
 * generando una ola que recorre la palabra en loop infinito. El pulso es
 * mínimo (sutil) en cada letra.
 *
 * Rendimiento: la animación es CSS pura (clase .latido-letra en index.css),
 * que corre en el compositor del navegador sin tocar JavaScript en cada
 * cuadro. Antes cada letra era una animación de framer-motion.
 *
 * Accesibilidad: el texto real va completo y oculto visualmente (para lectores
 * de pantalla, que lo leen de corrido) y las letras animadas se ocultan con
 * aria-hidden. Con "reducir movimiento" las letras quedan quietas.
 *
 * Uso: <Heartbeat className="text-lima">re perdido</Heartbeat>
 */
export default function Heartbeat({ className = "", children }) {
  const text = typeof children === "string" ? children : String(children);
  const letters = Array.from(text);

  return (
    <span className={`inline-block ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-block">
        {letters.map((letter, i) => (
          <span
            key={`${letter}-${i}`}
            className="latido-letra inline-block"
            style={{ animationDelay: `${(i * STAGGER_S).toFixed(2)}s` }}
          >
            {letter === " " ? " " : letter}
          </span>
        ))}
      </span>
    </span>
  );
}
