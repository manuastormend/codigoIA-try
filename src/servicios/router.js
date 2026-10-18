import { useEffect, useState } from "react";

/**
 * Router mínimo casero, sin librerías externas (no hay react-router
 * instalado). Sigue window.location.pathname y se actualiza solo con la
 * navegación nativa del navegador (atrás/adelante) o llamando a
 * `navigate()`, que empuja al historial sin recargar la página.
 */
// Al volver atrás (botón "Volver" o el del navegador) se devuelve la página al
// punto donde estaba. La página puede tardar unos cuadros en montarse y alcanzar
// su altura, así que se reintenta un rato hasta que el scroll llegue a destino.
function restaurarScroll(y) {
  let intentos = 0;
  const t = setInterval(() => {
    window.scrollTo(0, y);
    if (Math.abs(window.scrollY - y) < 2 || ++intentos > 30) clearInterval(t);
  }, 50);
}

export function useRoute() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const onPopState = () => {
      setPathname(window.location.pathname);
      const y = window.history.state?.scrollY;
      if (typeof y === "number") restaurarScroll(y);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return pathname;
}

export function navigate(path) {
  if (path === window.location.pathname) return;
  // Guarda dónde estaba parada la página en la entrada actual (para poder volver ahí).
  try {
    window.history.replaceState({ ...(window.history.state || {}), scrollY: window.scrollY }, "");
  } catch {
    /* sin historial: no pasa nada */
  }
  // `app: true` marca las entradas creadas por el sitio: ahí "Volver" puede ir atrás.
  window.history.pushState({ app: true }, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo(0, 0);
}
