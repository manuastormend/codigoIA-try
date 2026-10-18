import { useEffect, useState } from "react";

/**
 * true si la consulta de medios (media query) se cumple, y se actualiza sola si
 * cambia (ej. al girar el celular). Sirve para montar solo el componente que
 * hace falta en cada pantalla en vez de montar los dos y esconder uno con CSS.
 */
export function useMediaQuery(consulta) {
  const [coincide, setCoincide] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(consulta).matches : false
  );

  useEffect(() => {
    const lista = window.matchMedia(consulta);
    const alCambiar = () => setCoincide(lista.matches);
    alCambiar();
    lista.addEventListener("change", alCambiar);
    return () => lista.removeEventListener("change", alCambiar);
  }, [consulta]);

  return coincide;
}
